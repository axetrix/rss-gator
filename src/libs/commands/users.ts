

import { getUserByName, createUser, removeAllUsers, getUsers } from '../db/queries/users';
import { setUser, getCurrentUser } from '../config';

export async function handleReset(cmdName: string) {
  const userHasRemoved = await removeAllUsers();

  if (!userHasRemoved) {
    console.error(`Users has not been removed`);
    process.exit(1);
  }

  console.log('Users successfully removed');
}

export async function handleUsers(cmdName: string) {
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

export async function handleLogin(cmdName: string, ...args: string[]) {
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

export async function handleRegister(cmdName: string, ...args: string[]) {
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
