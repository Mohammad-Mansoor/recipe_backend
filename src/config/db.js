import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { ENV } from "./env.js"; // your environment loader
import * as schema from "../db/schema.js"; // your schema file

// Connect to local PostgreSQL using pg Pool
const pool = new Pool({
  connectionString: ENV.DATABASE_URL,
});
// Optional: Test DB connection on startup
(async () => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("✅ Connected to PostgreSQL at:", result.rows[0].now);
    client.release();
  } catch (error) {
    console.error("❌ Failed to connect to PostgreSQL:", error);
    process.exit(1); // Optional: exit the app if DB connection fails
  }
})();
// Export the db instance just like the tutorial
export const db = drizzle(pool, { schema });
