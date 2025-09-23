import { argv } from 'node:process';

import { init, runCommand } from './libs/commands';

async function main() {
  const registry = init();

  const args = argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: rss-gator <command> [args]');
    process.exit(1);
  }

  const [command, ...commandArgs] = args;

  await runCommand(registry, command, ...commandArgs);

  process.exit(0);
}

main();
