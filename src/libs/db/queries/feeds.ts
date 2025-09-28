import { and, eq, getTableColumns, sql } from "drizzle-orm";

import { db } from "..";
import {
  feeds,
  users,
  feedFollows,
  Feed,
  User,
  FeedDTO,
  FeedFollows,
} from "../schema";

export async function createFeed(name: string, url: string): Promise<Feed> {
  const [result] = await db
    .insert(feeds)
    .values({ name: name, url: url } satisfies FeedDTO)
    .returning();

  return result;
}

export async function getFeeds(): Promise<Feed[]> {
  const results = await db.select().from(feeds);

  return results;
}

export type FeedFollowWithUserAndFeed = Omit<
  FeedFollows,
  "user_id" | "feed_id"
> & {
  user: User;
  feed: Feed;
};

const { user_id, feed_id, ...rest } = getTableColumns(feedFollows);

export async function createFeedFollow(
  user_id: string,
  feed_id: string,
): Promise<FeedFollowWithUserAndFeed[]> {
  const [inserted] = await db
    .insert(feedFollows)
    .values({ user_id, feed_id })
    .returning();

  if (!inserted) {
    throw new Error("Failed to create feed follow");
  }

  const feedFollowsPopulated = await db
    .select({
      ...rest,
      user: users,
      feed: feeds,
    })
    .from(feedFollows)
    .innerJoin(users, eq(feedFollows.user_id, users.id))
    .innerJoin(feeds, eq(feedFollows.feed_id, feeds.id));

  return feedFollowsPopulated;
}

export async function getFeedByUrl(url: string): Promise<Feed | null> {
  const [feed] = await db.select().from(feeds).where(eq(feeds.url, url));

  return feed;
}

export async function getFeedFollowsByUserId(
  user_id: string,
): Promise<FeedFollowWithUserAndFeed[]> {
  const feedFollowsPopulated = await db
    .select({
      ...rest,
      user: users,
      feed: feeds,
    })
    .from(feedFollows)
    .innerJoin(users, eq(feedFollows.user_id, users.id))
    .innerJoin(feeds, eq(feedFollows.feed_id, feeds.id))
    .where(eq(feedFollows.user_id, user_id));

  return feedFollowsPopulated;
}

export async function removeFeedFollow(
  user_id: string,
  feed_id: string,
): Promise<boolean> {
  try {
    await db
      .delete(feedFollows)
      .where(
        and(eq(feedFollows.user_id, user_id), eq(feedFollows.feed_id, feed_id)),
      );
  } catch (error) {
    console.error(error);
    return false;
  }

  return true;
}

export async function markFeedFetched(feed_id: string): Promise<Feed | null> {
  const [feed] = await db
    .update(feeds)
    .set({ lastFetchedAt: new Date() })
    .where(eq(feeds.id, feed_id))
    .returning();

  return feed;
}

export async function getNextFeedToFetch(): Promise<Feed | null> {
  const [feed] = await db
    .select()
    .from(feeds)
    .orderBy(sql`${feeds.lastFetchedAt} asc nulls first`)
    .limit(1);

  return feed;
}

export async function getNextFeedFollowToFetchByUser(
  user_id: string,
): Promise<FeedFollowWithUserAndFeed[]> {
  const feedFollowsPopulated = await db
    .select({
      ...rest,
      user: users,
      feed: feeds,
    })
    .from(feedFollows)
    .innerJoin(users, eq(feedFollows.user_id, users.id))
    .innerJoin(feeds, eq(feedFollows.feed_id, feeds.id))
    .where(eq(feedFollows.user_id, user_id))
    .orderBy(sql`${feeds.lastFetchedAt} asc nulls first`);

  return feedFollowsPopulated;
}
