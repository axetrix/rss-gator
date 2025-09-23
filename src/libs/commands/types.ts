export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>

export type CommandsRegistry = {
  [key: string]: CommandHandler;
}
