import type pg from 'pg';
import { getPool } from '../pool.js';
import type { HouseItem } from '../../../shared/types.js';

export class HouseItemRepo {
  private pool: pg.Pool;

  constructor(pool?: pg.Pool) {
    this.pool = pool ?? getPool();
  }

  async findByUserId(userId: string): Promise<HouseItem[]> {
    const { rows } = await this.pool.query(
      `SELECT id, user_id AS "userId", item_id AS "itemId",
              grid_x AS "gridX", grid_y AS "gridY", state
       FROM house_items WHERE user_id = $1`,
      [userId],
    );
    return rows as HouseItem[];
  }

  async place(userId: string, itemId: string, gridX: number, gridY: number): Promise<HouseItem> {
    const { rows } = await this.pool.query(
      `INSERT INTO house_items (user_id, item_id, grid_x, grid_y)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id AS "userId", item_id AS "itemId",
                 grid_x AS "gridX", grid_y AS "gridY", state`,
      [userId, itemId, gridX, gridY],
    );
    return rows[0] as HouseItem;
  }

  async remove(houseItemId: string): Promise<boolean> {
    const { rowCount } = await this.pool.query(
      'DELETE FROM house_items WHERE id = $1',
      [houseItemId],
    );
    return (rowCount ?? 0) > 0;
  }

  async updatePosition(houseItemId: string, gridX: number, gridY: number): Promise<HouseItem | null> {
    const { rows } = await this.pool.query(
      `UPDATE house_items SET grid_x = $2, grid_y = $3 WHERE id = $1
       RETURNING id, user_id AS "userId", item_id AS "itemId",
                 grid_x AS "gridX", grid_y AS "gridY", state`,
      [houseItemId, gridX, gridY],
    );
    return (rows[0] as HouseItem) ?? null;
  }
}
