import { eq, getTableColumns } from "drizzle-orm";

import { db } from "..";
import { feeds, users, Feed, User, FeedDTO } from "../schema";

const { user_id, ...rest } = getTableColumns(feeds);

export async function createFeed(
  name: string,
  url: string,
  user_id: string,
): Promise<Feed> {
  const [result] = await db
    .insert(feeds)
    .values({ name: name, url: url, user_id: user_id } satisfies FeedDTO)
    .returning();

  return result;
}

export type FeedWithUser = Omit<Feed, "user_id"> & {
  user: User;
};

export async function getFeeds(): Promise<FeedWithUser[]> {
  const results = await db
    .select({ ...rest, user: users })
    .from(feeds)
    .innerJoin(users, eq(users.id, feeds.user_id));

  return results;
}
