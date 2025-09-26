import { defineConfig } from "drizzle-kit";
import { readConfig } from "./src/libs/config";

const config = readConfig();

export default defineConfig({
  schema: "src/libs/db/schema.ts",
  out: "src/libs/db/out",
  dialect: "postgresql",
  dbCredentials: {
    url: config.dbUrl,
  },
});
