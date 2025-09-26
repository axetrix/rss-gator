

import { handleAddFeed, handleAgg, handleFeeds } from './feeds';
import { handleLogin, handleRegister, handleReset, handleUsers } from './users';

import type { CommandHandler, CommandsRegistry } from './types';

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
  registerCommand(registry, 'addfeed', handleAddFeed);
  registerCommand(registry, 'feeds', handleFeeds);

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
