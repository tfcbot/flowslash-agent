import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";

// Load environment variables
config({ path: ".env.local" });

// Only create database connection if DATABASE_URL is available
// This prevents build-time errors when the environment variable is not set
let db: ReturnType<typeof drizzle> | null = null;

if (process.env.DATABASE_URL) {
  // Create Neon SQL client - specific to Neon
  const sql = neon(process.env.DATABASE_URL);
  // Create Drizzle instance with neon-http adapter
  db = drizzle({ client: sql });
} else if (process.env.NODE_ENV === "development") {
  console.warn("DATABASE_URL not set. Database operations will fail.");
}

export { db };
