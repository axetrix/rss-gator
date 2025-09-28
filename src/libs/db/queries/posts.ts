import { and, eq, getTableColumns, desc } from "drizzle-orm";

import { db } from "..";
import { posts, Post, PostDTO, feeds, feedFollows } from "../schema";

export async function createPost(
  feedId: string,
  title: string,
  url: string,
  description: string,
  publishedAt: Date,
): Promise<Post> {
  const [result] = await db
    .insert(posts)
    .values({
      title,
      url,
      publishedAt,
      description,
      feed_id: feedId,
    } satisfies PostDTO)
    .returning();

  return result;
}

export async function getPostsForUser(user_id: string, limit: number): Promise<Post[]> {
  const userPosts = await db
    .select({
      ...getTableColumns(posts),
    })
    .from(posts)
    .innerJoin(
      feedFollows,
      and(
        eq(feedFollows.user_id, user_id),
        eq(feedFollows.feed_id, posts.feed_id),
      ),
    )
    .orderBy(desc(posts.publishedAt))
    .limit(limit);

  return userPosts;
}

export async function getLastPost(feedId: string): Promise<Post | null> {
  const [lastPost] = await db
    .select()
    .from(posts)
    .where(
      eq(posts.feed_id, feedId),
    )
    .orderBy(desc(posts.publishedAt))
    .limit(1);

  return lastPost;
}
