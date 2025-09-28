import {
  createFeed,
  getFeeds,
  getFeedByUrl,
  createFeedFollow,
  getFeedFollowsByUserId,
  removeFeedFollow,
  getNextFeedToFetch,
  markFeedFetched,
  getNextFeedFollowToFetchByUser,
} from "../db/queries/feeds";
import { getPostsForUser, createPost, getLastPost } from "../db/queries/posts";
import { fetchFeed } from "../rss";

import type { User, Feed } from "../db/schema";

function printFeed(feed: Feed, user: User) {
  console.log(`* ID:            ${feed.id}`);
  console.log(`* Created:       ${feed.createdAt}`);
  console.log(`* Updated:       ${feed.updatedAt}`);
  console.log(`* name:          ${feed.name}`);
  console.log(`* URL:           ${feed.url}`);
  console.log(`* User:          ${user.name}`);
}

export async function handleAddFeed(
  cmdName: string,
  currentUser: User,
  ...args: string[]
) {
  if (args.length < 2) {
    console.error("Usage: addfeed <name> <url>");
    process.exit(1);
  }

  const [name, url] = args;

  const feed = await createFeed(name, url);
  const feedFollow = await createFeedFollow(currentUser.id, feed.id);

  printFeed(feed, currentUser);
}

export async function handleFollow(
  cmdName: string,
  currentUser: User,
  ...args: string[]
) {
  if (args.length < 1) {
    console.error("Usage: follow <url>");
    process.exit(1);
  }

  const url = args[0];

  const feed = await getFeedByUrl(url);

  if (!feed) {
    console.error(`Feed with URL ${url} not found`);
    process.exit(1);
  }

  const feedFollow = await createFeedFollow(currentUser.id, feed.id);

  console.log(`All followed feeds: `, feedFollow);
}

export async function handleCurrentUserFollowing(
  cmdName: string,
  currentUser: User,
) {
  const feedFollows = await getFeedFollowsByUserId(currentUser.id);

  console.log(`User *${currentUser.name}* followed feeds: `);

  feedFollows.forEach((feedFollow) => {
    console.log(`Feed: ${feedFollow.feed.name}, ID: ${feedFollow.feed.id}`);
  });
}

export async function handleUnfollow(
  cmdName: string,
  currentUser: User,
  ...args: string[]
) {
  if (args.length < 1) {
    console.error("Usage: unfollow <url>");
    process.exit(1);
  }

  const url = args[0];

  const feed = await getFeedByUrl(url);

  if (!feed) {
    console.error(`Feed with URL ${url} not found`);
    process.exit(1);
  }

  const isRemoved = await removeFeedFollow(currentUser.id, feed.id);

  if (isRemoved) {
    console.log(`User *${currentUser.name}* unfollowed feed: ${feed.name}`);
  } else {
    console.error(`Failed to unfollow feed: ${feed.name}`);
    process.exit(1);
  }
}

function parseDuration(durationStr: string): number {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);

  if (!match) {
    throw new Error(`Invalid duration format: ${durationStr}`);
  }

  const [, value, unit] = match;

  const parsedValue = parseInt(value, 10);

  switch (unit) {
    case "ms":
      return parsedValue;
    case "s":
      return parsedValue * 1000;
    case "m":
      return parsedValue * 60000;
    case "h":
      return parsedValue * 3600000;
    default:
      throw new Error(`Invalid unit: ${unit}`);
  }
}

export async function handleAgg(cmdName: string, ...args: string[]) {
  const time_between_reqs = args[0];

  if (!time_between_reqs) {
    console.error("Usage: agg <time between reqs>");
    process.exit(1);
  }

  let intervalId: NodeJS.Timeout;

  const handleError = (error: Error) => {
    console.error(`Error fetching feed ${args[0]}: ${error}`);
    process.exit(1);
  };

  try {
    const duration = parseDuration(time_between_reqs);

    console.log(`Collecting feeds every ${time_between_reqs}`);
    scrapeAllFeed().catch(handleError);

    intervalId = setInterval(async () => {
      scrapeAllFeed().catch(handleError);
    }, duration);

    await new Promise<void>((resolve) => {
      const cleanup = () => {
        console.log(`Shutting down feed aggregator...`);
        clearInterval(intervalId);
        resolve();
      };

      process.on("SIGINT", cleanup);
      process.on("SIGTERM", cleanup);
    });
  } catch (error) {
    console.error(`Error fetching feed ${args[0]}: ${error}`);
    process.exit(1);
  }
}

export async function handleFeeds(cmdName: string, ...args: string[]) {
  try {
    const feeds = await getFeeds();

    const parsedFeeds = feeds.map((feed) => ({
      name: feed.name,
      url: feed.url,
    }));

    console.log(parsedFeeds);
  } catch (error) {
    console.error(`Error fetching feeds`);
    process.exit(1);
  }
}

export async function handleScrapeFeed(
  cmdName: string,
  currentUser: User,
  ...args: string[]
) {
  await scrapeUserFeed(currentUser);
}

async function scrapeUserFeed(currentUser: User) {
  const feedsFollowed = await getNextFeedFollowToFetchByUser(currentUser.id);

  if (feedsFollowed.length === 0) {
    console.log("No feeds to scrape");
    process.exit(0);
  }

  const feed = feedsFollowed[0].feed;

  await scrapeFeed(feed);
}

async function scrapeAllFeed() {
  const feed = await getNextFeedToFetch();

  if (!feed) {
    console.log("No feeds to scrape");
    process.exit(0);
  }

  await scrapeFeed(feed);
}

async function scrapeFeed(feed: Feed) {
  const lastPost = await getLastPost(feed.id);
  const lastPubDate = lastPost ? lastPost.publishedAt : null;

  try {
    console.log();
    console.log(`Scraping feed: ${feed.url}...`);
    console.log();

    const feedData = await fetchFeed(feed.url);

    // for (const item of feedData.items) {
    //   const feedItemPubDate = new Date(item.pubDate);

    //   if (lastPubDate && feedItemPubDate <= lastPubDate) {
    //     continue;
    //   }

    //   await createPost(feed.id, item.title, item.link, item.description, feedItemPubDate);
    // }
    //
    //
    const itemsToProceed = feedData.items.filter(
      (item) => !lastPubDate || new Date(item.pubDate) > lastPubDate,
    );

    await Promise.all(
      itemsToProceed.map((item) =>
        createPost(
          feed.id,
          item.title,
          item.link,
          item.description,
          new Date(item.pubDate),
        ),
      ),
    );

    console.log();
    console.log(`Created ${itemsToProceed.length} posts`);
    console.log("Ending feed scraping...");
    console.log();
  } catch (error) {
    console.error(`Error fetching feed ${feed.url}: ${error}`);
    process.exit(1);
  } finally {
    await markFeedFetched(feed.id);
  }
}

export async function handleBrowse(
  cmdName: string,
  currentUser: User,
  ...args: string[]
) {
  if (args.length < 1) {
    console.error("Usage: browse <limit>");
    process.exit(1);
  }

  const limit = parseInt(args[0]);

  if (isNaN(limit) || limit <= 0) {
    console.error("Invalid limit");
    process.exit(1);
  }

  const posts = await getPostsForUser(currentUser.id, limit);

  for (const post of posts) {
    console.log();
    console.log(`Title: ${post.title}`);
    console.log(`Link: ${post.url}`);
    console.log(`Description: ${post.description}`);
    console.log(`Published At: ${post.publishedAt}`);
    console.log();
  }
}
