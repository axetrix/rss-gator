export type CommandHandler = (cmdName: string, ...args: string[]) => void

export type CommandsRegistry = {
  [key: string]: CommandHandler;
}
