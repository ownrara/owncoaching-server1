import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL in .env");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Optional: log connection errors (useful for debugging)
pool.on("error", (err) => {
  console.error("Unexpected PG client error:", err);
});
