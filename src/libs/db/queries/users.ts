import { eq } from 'drizzle-orm';
import { db } from "..";
import { users } from "../schema";

type User = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt?: Date;
};

export async function createUser(name: string): Promise<User> {
  const [result] = await db.insert(users).values({ name: name }).returning();

  return result;
}

export async function getUserByName(name: string): Promise<User | null> {
  const [result] = await db.select().from(users).where(eq(users.name, name));

  return result;
}
