

import { getUserByName, createUser } from '../db/queries/users';
import { setUser } from '../config';

import type { CommandHandler, CommandsRegistry } from './types';

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

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
  registry[cmdName] = handler;
}

export function init(): CommandsRegistry {
  const registry: CommandsRegistry = {};

  registerCommand(registry, 'login', handleLogin);
  registerCommand(registry, 'register', handleRegister);

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
