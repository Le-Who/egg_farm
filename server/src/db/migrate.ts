import { getPool } from "./pool.js";

/**
 * Run schema migrations.
 * For the MVP we keep it simple — idempotent CREATE IF NOT EXISTS.
 */
export async function migrate(): Promise<void> {
  const pool = getPool();

  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS users (
      id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      discord_id VARCHAR(64) UNIQUE NOT NULL,
      coins      BIGINT  NOT NULL DEFAULT 0,
      gems       INTEGER NOT NULL DEFAULT 0,
      xp         BIGINT  NOT NULL DEFAULT 0,
      last_login TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS house_items (
      id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      item_id VARCHAR(64) NOT NULL,
      grid_x  INTEGER NOT NULL,
      grid_y  INTEGER NOT NULL,
      state   JSONB NOT NULL DEFAULT '{}'
    );

    CREATE INDEX IF NOT EXISTS idx_house_items_user
      ON house_items(user_id);

    CREATE TABLE IF NOT EXISTS inventory (
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      item_id VARCHAR(64) NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
      PRIMARY KEY (user_id, item_id)
    );

    CREATE TABLE IF NOT EXISTS pets (
      id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      pet_type  VARCHAR(64) NOT NULL,
      stats     JSONB NOT NULL DEFAULT '{"level": 1, "hunger": 100}',
      is_active BOOLEAN NOT NULL DEFAULT false
    );

    CREATE INDEX IF NOT EXISTS idx_pets_user
      ON pets(user_id);
  `);
}

// Allow running directly: `tsx src/db/migrate.ts`
const isMain = process.argv[1]?.endsWith("migrate.ts");
if (isMain) {
  migrate()
    .then(() => {
      console.log("✅ Migration complete");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Migration failed:", err);
      process.exit(1);
    });
}
