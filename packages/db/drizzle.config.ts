import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config();

if (!process.env.DATABASE_URL_DIRECT) {
  throw new Error("please set DATABASE_URL_DIRECT in .env");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_DIRECT!,
  },
});
