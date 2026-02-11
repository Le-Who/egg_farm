import type pg from 'pg';
import { getPool } from '../pool.js';

export interface InventoryItem {
  userId: string;
  itemId: string;
  quantity: number;
}

export class InventoryRepo {
  private pool: pg.Pool;

  constructor(pool?: pg.Pool) {
    this.pool = pool ?? getPool();
  }

  async getByUserId(userId: string): Promise<InventoryItem[]> {
    const { rows } = await this.pool.query(
      `SELECT user_id AS "userId", item_id AS "itemId", quantity
       FROM inventory WHERE user_id = $1`,
      [userId],
    );
    return rows as InventoryItem[];
  }

  async getItem(userId: string, itemId: string): Promise<InventoryItem | null> {
    const { rows } = await this.pool.query(
      `SELECT user_id AS "userId", item_id AS "itemId", quantity
       FROM inventory WHERE user_id = $1 AND item_id = $2`,
      [userId, itemId],
    );
    return (rows[0] as InventoryItem) ?? null;
  }

  /** Add quantity to a user's inventory (upsert) */
  async addItem(userId: string, itemId: string, quantity: number): Promise<InventoryItem> {
    const { rows } = await this.pool.query(
      `INSERT INTO inventory (user_id, item_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, item_id) DO UPDATE SET quantity = inventory.quantity + $3
       RETURNING user_id AS "userId", item_id AS "itemId", quantity`,
      [userId, itemId, quantity],
    );
    return rows[0] as InventoryItem;
  }

  /** Remove quantity — returns false if insufficient stock */
  async removeItem(userId: string, itemId: string, quantity: number): Promise<boolean> {
    const { rows } = await this.pool.query(
      `UPDATE inventory SET quantity = quantity - $3
       WHERE user_id = $1 AND item_id = $2 AND quantity >= $3
       RETURNING quantity`,
      [userId, itemId, quantity],
    );
    if (rows.length === 0) return false;

    // Clean up zero-quantity rows
    if (rows[0].quantity === 0) {
      await this.pool.query(
        'DELETE FROM inventory WHERE user_id = $1 AND item_id = $2',
        [userId, itemId],
      );
    }
    return true;
  }
}
