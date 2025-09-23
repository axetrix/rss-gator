import { defineConfig } from "drizzle-kit";
import { readConfig } from "./src/config";

const config = readConfig();

export default defineConfig({
  schema: "db/schema.ts",
  out: "db/out",
  dialect: "postgresql",
  dbCredentials: {
    url: config.dbUrl,
  },
});
