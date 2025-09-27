import { eq, getTableColumns } from "drizzle-orm";

import { db } from "..";
import { feeds, users, feedFollows, Feed, User, FeedDTO, FeedFollows, FeedFollowsDTO } from "../schema";

export async function createFeed(
  name: string,
  url: string,
): Promise<Feed> {
  const [result] = await db
    .insert(feeds)
    .values({ name: name, url: url } satisfies FeedDTO)
    .returning();

  return result;
}

export async function getFeeds(): Promise<Feed[]> {
  const results = await db
    .select()
    .from(feeds)

  return results;
}

export type FeedFollowWithUserAndFeed = Omit<FeedFollows, 'user_id' | 'feed_id'> & {
  user: User;
  feed: Feed;
};

const { user_id, feed_id, ...rest } = getTableColumns(feedFollows)

export async function createFeedFollow(user_id: string, feed_id: string): Promise<FeedFollowWithUserAndFeed[]> {
 const [inserted] = await db.insert(feedFollows).values({ user_id, feed_id }).returning();

 if (!inserted) {
   throw new Error("Failed to create feed follow");
 }

   const feedFollowsPopulated = await db.select({
     ...rest,
     user: users,
     feed: feeds,
   }).from(feedFollows)
    .innerJoin(users, eq(feedFollows.user_id, users.id))
    .innerJoin(feeds, eq(feedFollows.feed_id, feeds.id));

  return feedFollowsPopulated;
}

export async function getFeedByUrl(url: string): Promise<Feed | null> {
  const [feed] = await db.select().from(feeds).where(eq(feeds.url, url));

  return feed;
}

export async function getFeedFollowsByUserId(user_id: string): Promise<FeedFollowWithUserAndFeed[]> {
  const feedFollowsPopulated = await db.select({
    ...rest,
    user: users,
    feed: feeds,
  }).from(feedFollows)
    .innerJoin(users, eq(feedFollows.user_id, users.id))
    .innerJoin(feeds, eq(feedFollows.feed_id, feeds.id))
    .where(eq(feedFollows.user_id, user_id));

  return feedFollowsPopulated;
}
