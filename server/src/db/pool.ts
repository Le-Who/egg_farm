import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Singleton pool — lazy-initialized so tests can mock before first use
let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (!pool) {
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  return pool;
}

/** Allow tests to inject a mock pool */
export function setPool(mockPool: pg.Pool): void {
  pool = mockPool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
