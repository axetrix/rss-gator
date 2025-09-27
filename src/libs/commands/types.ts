import { User } from "../db/schema";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>
export type UserCommandHandler = (cmdName: string, user: User, ...args: string[]) => Promise<void>

export type CommandsRegistry = {
  [key: string]: CommandHandler;
}
