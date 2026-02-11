import type pg from "pg";
import { getPool } from "../pool.js";
import type { Pet } from "../../../shared/types.js";

export class PetRepo {
  private pool: pg.Pool;

  constructor(pool?: pg.Pool) {
    this.pool = pool ?? getPool();
  }

  async findByUserId(userId: string): Promise<Pet[]> {
    const { rows } = await this.pool.query(
      `SELECT id, user_id AS "userId", pet_type AS "petType",
              stats, is_active AS "isActive"
       FROM pets WHERE user_id = $1`,
      [userId],
    );
    return rows as Pet[];
  }

  async findById(id: string): Promise<Pet | null> {
    const { rows } = await this.pool.query(
      `SELECT id, user_id AS "userId", pet_type AS "petType",
              stats, is_active AS "isActive"
       FROM pets WHERE id = $1`,
      [id],
    );
    return (rows[0] as Pet) ?? null;
  }

  async getActivePet(userId: string): Promise<Pet | null> {
    const { rows } = await this.pool.query(
      `SELECT id, user_id AS "userId", pet_type AS "petType",
              stats, is_active AS "isActive"
       FROM pets WHERE user_id = $1 AND is_active = true`,
      [userId],
    );
    return (rows[0] as Pet) ?? null;
  }

  async create(userId: string, petType: string): Promise<Pet> {
    const stats = JSON.stringify({ level: 1, hunger: 100 });
    const { rows } = await this.pool.query(
      `INSERT INTO pets (user_id, pet_type, stats, is_active)
       VALUES ($1, $2, $3, false)
       RETURNING id, user_id AS "userId", pet_type AS "petType",
                 stats, is_active AS "isActive"`,
      [userId, petType, stats],
    );
    return rows[0] as Pet;
  }

  async setActive(userId: string, petId: string): Promise<boolean> {
    // Deactivate all first, then activate the selected one
    await this.pool.query(
      "UPDATE pets SET is_active = false WHERE user_id = $1",
      [userId],
    );
    const { rowCount } = await this.pool.query(
      "UPDATE pets SET is_active = true WHERE id = $1 AND user_id = $2",
      [petId, userId],
    );
    return (rowCount ?? 0) > 0;
  }

  async updateStats(
    petId: string,
    stats: { level: number; hunger: number },
  ): Promise<void> {
    await this.pool.query("UPDATE pets SET stats = $1 WHERE id = $2", [
      JSON.stringify(stats),
      petId,
    ]);
  }

  async remove(petId: string): Promise<boolean> {
    const { rowCount } = await this.pool.query(
      "DELETE FROM pets WHERE id = $1",
      [petId],
    );
    return (rowCount ?? 0) > 0;
  }
}
