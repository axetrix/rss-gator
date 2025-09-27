import { getUserByName } from '../db/queries/users';
import { getCurrentUser } from '../config';

import type { UserCommandHandler, CommandHandler } from "../commands/types";

type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;

export const middlewareLoggedIn = (handler: UserCommandHandler): CommandHandler =>
  async (cmd: string, ...args: string[]) => {
    const currenUserName = getCurrentUser();
    const currentUser = await getUserByName(currenUserName);

    if (!currentUser) {
      console.error('Current user not found');
      process.exit(1);
    }

    await handler(cmd, currentUser, ...args);
  };
