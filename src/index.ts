import { argv } from 'node:process';

import type { CommandHandler, CommandsRegistry } from './types';

import { setUser } from './config';

function handleLogin(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    console.error('Usage: login <username>');
    process.exit(1);
  }

  if (cmdName === 'login') {
    setUser(args[0]);
  }

  console.log('Logged in as', args[0]);
}

function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
  registry[cmdName] = handler;
}

function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
  const handler = registry[cmdName];

  if (!handler) {
    console.error(`Unknown command: ${cmdName}`);
    process.exit(1);
  }

  handler(cmdName, ...args);
}

function main() {
  const registry: CommandsRegistry = {};

  registerCommand(registry, 'login', handleLogin);

  const args = argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: rss-gator <command> [args]');
    process.exit(1);
  }

  const [command, ...commandArgs] = args;

  runCommand(registry, command, ...commandArgs);
}

main();
