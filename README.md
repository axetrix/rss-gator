## Requirements

To run this CLI, you'll need:

- Node.js (version 22 or higher)
- npm or pnpm package manager
- Command line access (Terminal, Command Prompt, or PowerShell)

Make sure you have the necessary dependencies installed by running `npm install` or `yarn install` in the project directory before using the CLI.

## Configuration

Before running the CLI, you'll need to set up a databse:

1. Setup your database, it should be PostgreSQL
2. Create a `.gatorconfig.json` file in the project root directory
```
{
  "database": {
    "db_url": "postgresql://user:password@localhost:5432/database",
    "current_user_name": ""
  }
}
```
3. run `npx drizzle-kit migrate`

## Usage

Once you've set up the database, you could start using the app:


The app support the next commands:
1. npm run start register <username> - register a new user and login
2. npm run start login <username> - login to the app
3. npm run start reset - clear user table
4. npm run start addfeed <feed name> <url> - add a new feed and subscribe to it for the current user
5. npm run start following - list all the feeds subscribed by the current user
6. npm run start unfollow <url> - unsubscribe from a feed
7. npm run start follow <url> - subscribe to a feed for the current user
8. npm run start agg <time>- aggregate all the feeds every <time>, and save the result to the database
9. npm run start browse <limit> - browse the aggregated feeds for the current user
