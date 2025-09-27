

import { getUserByName } from '../db/queries/users';
import { getCurrentUser } from '../config';
import { createFeed, getFeeds, getFeedByUrl, createFeedFollow, getFeedFollowsByUserId } from '../db/queries/feeds';
import { fetchFeed } from '../rss';

import type { User, Feed } from "../db/schema";


function printFeed(feed: Feed, user: User) {
  console.log(`* ID:            ${feed.id}`);
  console.log(`* Created:       ${feed.createdAt}`);
  console.log(`* Updated:       ${feed.updatedAt}`);
  console.log(`* name:          ${feed.name}`);
  console.log(`* URL:           ${feed.url}`);
  console.log(`* User:          ${user.name}`);
}

export async function handleAddFeed(cmdName: string, ...args: string[]) {
  if (args.length < 2) {
    console.error('Usage: addfeed <name> <url>');
    process.exit(1);
  }

  const currenUserName = getCurrentUser();
  const currentUser = await getUserByName(currenUserName);

  if (!currentUser) {
    console.error('Current user not found');
    process.exit(1);
  }

  const [name, url] = args;

  const feed = await createFeed(name, url);
  const feedFollow = await createFeedFollow(currentUser.id, feed.id);

  printFeed(feed, currentUser);
}

export async function handleFollow(cmdName: string, ...args: string[]) {
  if (args.length < 1) {
    console.error('Usage: follow <url>');
    process.exit(1);
  }

  const currenUserName = getCurrentUser();
  const currentUser = await getUserByName(currenUserName);

  if (!currentUser) {
    console.error('Current user not found');
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

export async function handleCurrentUserFollowing(cmdName: string) {
  const currenUserName = getCurrentUser();
  const currentUser = await getUserByName(currenUserName);

  if (!currentUser) {
    console.error('Current user not found');
    process.exit(1);
  }

  const feedFollows = await getFeedFollowsByUserId(currentUser.id);

  console.log(`User *${currentUser.name}* followed feeds: `);

  feedFollows.forEach(feedFollow => {
    console.log(`Feed: ${feedFollow.feed.name}, ID: ${feedFollow.feed.id}`);
  });
}

export async function handleAgg(cmdName: string, ...args: string[]) {
  let channelUrl = args[0];

  if (!channelUrl) {
    channelUrl = "https://www.wagslane.dev/index.xml";
    // console.error('Usage: agg <channel url>');
    // process.exit(1);
  }

  try {
    const feed = await fetchFeed(channelUrl);

    console.log(feed)
  } catch (error) {
    console.error(`Error fetching feed ${args[0]}: ${error}`);
    process.exit(1);
  }
}

export async function handleFeeds(cmdName: string, ...args: string[]) {
  try {
    const feeds = await getFeeds();

    const parsedFeeds = feeds.map(feed => ({
      name: feed.name,
      url: feed.url,
    }));

    console.log(parsedFeeds)
  } catch (error) {
    console.error(`Error fetching feeds`);
    process.exit(1);
  }
}
