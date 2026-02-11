import type pg from 'pg';
import { getPool } from '../pool.js';
import type { User } from '../../../shared/types.js';

export class UserRepo {
  private pool: pg.Pool;

  constructor(pool?: pg.Pool) {
    this.pool = pool ?? getPool();
  }

  async findByDiscordId(discordId: string): Promise<User | null> {
    const { rows } = await this.pool.query(
      'SELECT id, discord_id AS "discordId", coins, gems, xp, last_login AS "lastLogin" FROM users WHERE discord_id = $1',
      [discordId],
    );
    return (rows[0] as User) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const { rows } = await this.pool.query(
      'SELECT id, discord_id AS "discordId", coins, gems, xp, last_login AS "lastLogin" FROM users WHERE id = $1',
      [id],
    );
    return (rows[0] as User) ?? null;
  }

  async create(discordId: string): Promise<User> {
    const { rows } = await this.pool.query(
      `INSERT INTO users (discord_id) VALUES ($1)
       RETURNING id, discord_id AS "discordId", coins, gems, xp, last_login AS "lastLogin"`,
      [discordId],
    );
    return rows[0] as User;
  }

  /** Get-or-create convenience — used on each login */
  async upsert(discordId: string): Promise<User> {
    const existing = await this.findByDiscordId(discordId);
    if (existing) {
      // Touch last_login
      await this.pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [existing.id]);
      return { ...existing, lastLogin: new Date() };
    }
    return this.create(discordId);
  }

  async updateCoins(userId: string, delta: number): Promise<number> {
    const { rows } = await this.pool.query(
      'UPDATE users SET coins = coins + $2 WHERE id = $1 RETURNING coins',
      [userId, delta],
    );
    return rows[0]?.coins ?? 0;
  }
}
