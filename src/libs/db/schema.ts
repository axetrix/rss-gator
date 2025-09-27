import { pgTable, timestamp, uuid, text, uniqueIndex } from "drizzle-orm/pg-core";

export type User = typeof users.$inferSelect;

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  name: text("name").notNull().unique(),
});

export type FeedDTO = typeof feeds.$inferInsert;
export type Feed = typeof feeds.$inferSelect;

export const feeds = pgTable("feeds", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  name: text("name").notNull(),
  url: text("url").notNull().unique(),
});

export const feedFollows = pgTable("feed_follows",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
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
