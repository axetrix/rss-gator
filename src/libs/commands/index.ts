

import { getUserByName, createUser, removeAllUsers, getUsers } from '../db/queries/users';
import { setUser, getCurrentUser } from '../config';
import { fetchFeed } from '../rss';

import type { CommandHandler, CommandsRegistry } from './types';

async function handleReset(cmdName: string) {
  const userHasRemoved = await removeAllUsers();

  if (!userHasRemoved) {
    console.error(`Users has not been removed`);
    process.exit(1);
  }

  console.log('Users successfully removed');
}

async function handleUsers(cmdName: string) {
  const users = await getUsers();

  if (users.length === 0) {
    console.error(`No users found`);
    process.exit(1);
  }

  const currentUser = getCurrentUser();

  users.forEach((user) => {
      console.log(`* ${user.name}`, user.name === currentUser ? `(current)` : ``);
  });
}

async function handleLogin(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    console.error('Usage: login <username>');
    process.exit(1);
  }

  const user = await getUserByName(args[0]);

  if (!user) {
    console.error(`User ${args[0]} does not exist`);
    process.exit(1);
  }

  setUser(args[0]);

  console.log('Logged in as', args[0]);
}

async function handleRegister(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    console.error('Usage: register <username>');
    process.exit(1);
  }

  const user = await getUserByName(args[0]);

  if (user) {
    console.error(`User ${args[0]} already exists`);
    process.exit(1);
  }

  const newUser = await createUser(args[0]);
  setUser(args[0]);

  console.log('Register user as', args[0]);
}

async function handleAgg(cmdName: string, ...args: string[]) {
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

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
  registry[cmdName] = handler;
}

export function init(): CommandsRegistry {
  const registry: CommandsRegistry = {};

  registerCommand(registry, 'login', handleLogin);
  registerCommand(registry, 'register', handleRegister);
  registerCommand(registry, 'reset', handleReset);
  registerCommand(registry, 'users', handleUsers);
  registerCommand(registry, 'agg', handleAgg);

  return registry;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]): Promise<void> {
  const handler = registry[cmdName];

  if (!handler) {
    console.error(`Unknown command: ${cmdName}`);
    process.exit(1);
  }

  await handler(cmdName, ...args);
}
