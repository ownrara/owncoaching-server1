import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set. DB features disabled.");
}


export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Optional: log connection errors (useful for debugging)
pool.on("error", (err) => {
  console.error("Unexpected PG client error:", err);
});
