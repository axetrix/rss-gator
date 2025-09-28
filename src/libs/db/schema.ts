import { pgTable, timestamp, uuid, text, uniqueIndex } from "drizzle-orm/pg-core";

export type User = typeof users.$inferSelect;

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  name: text("name").notNull().unique(),
});

export type FeedDTO = typeof feeds.$inferInsert;
export type Feed = typeof feeds.$inferSelect;

export const feeds = pgTable("feeds", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  lastFetchedAt: timestamp("last_fetched_at", { withTimezone: true }),
  name: text("name").notNull(),
  url: text("url").notNull().unique(),
});

export const feedFollows = pgTable("feed_follows",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    feed_id: uuid("feed_id").notNull().references(() => feeds.id, { onDelete: "cascade" }),
    user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("unique_feed_user").on(table.feed_id, table.user_id),
  ]
);

export type FeedFollowsDTO = typeof feedFollows.$inferInsert;
export type FeedFollows = typeof feedFollows.$inferSelect;

export const posts = pgTable("posts",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    title: text("title").notNull(),
    url: text("url").notNull().unique(),
    description: text("description").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
    feed_id: uuid("feed_id").notNull().references(() => feeds.id, { onDelete: "cascade" }),
  },
);

export type PostDTO = typeof posts.$inferInsert;
export type Post = typeof posts.$inferSelect;
