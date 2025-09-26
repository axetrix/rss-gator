import { eq } from 'drizzle-orm';
import { db } from "..";
import { users, User } from "../schema";

export async function createUser(name: string): Promise<User> {
  const [result] = await db.insert(users).values({ name: name }).returning();

  return result;
}

export async function getUserByName(name: string): Promise<User | null> {
  const [result] = await db.select().from(users).where(eq(users.name, name));

  return result;
}

export async function getUsers(): Promise<User[]> {
  const result = await db.select().from(users);

  return result;
}

export async function removeAllUsers(): Promise<boolean> {
  try {
    await db.delete(users).returning();
  } catch (error) {
    console.error('Error removing users:', error);
    return false;
  }

  return true;
}
