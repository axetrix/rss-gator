

import { getUserByName } from '../db/queries/users';
import { getCurrentUser } from '../config';
import { createFeed, getFeeds } from '../db/queries/feeds';
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

  const feed = await createFeed(name, url, currentUser.id);

  printFeed(feed, currentUser);
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
      user_name: feed.user.name
    }));

    console.log(parsedFeeds)
  } catch (error) {
    console.error(`Error fetching feeds`);
    process.exit(1);
  }
}
