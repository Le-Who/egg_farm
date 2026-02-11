import { describe, it, expect, vi, beforeEach } from "vitest";
import { PetRepo } from "../src/db/repositories/PetRepo";

function createMockPool() {
  return { query: vi.fn() } as any;
}

describe("PetRepo", () => {
  let pool: ReturnType<typeof createMockPool>;
  let repo: PetRepo;

  beforeEach(() => {
    pool = createMockPool();
    repo = new PetRepo(pool);
  });

  describe("findByUserId", () => {
    it("returns all pets for a user", async () => {
      const pets = [
        {
          id: "p1",
          userId: "u1",
          petType: "slime_grass",
          stats: { level: 1, hunger: 80 },
          isActive: true,
        },
        {
          id: "p2",
          userId: "u1",
          petType: "fox_ember",
          stats: { level: 2, hunger: 60 },
          isActive: false,
        },
      ];
      pool.query.mockResolvedValue({ rows: pets });

      const result = await repo.findByUserId("u1");
      expect(result).toHaveLength(2);
      expect(result[0].petType).toBe("slime_grass");
    });

    it("returns empty array when no pets", async () => {
      pool.query.mockResolvedValue({ rows: [] });
      expect(await repo.findByUserId("u-empty")).toEqual([]);
    });
  });

  describe("getActivePet", () => {
    it("returns the active pet", async () => {
      pool.query.mockResolvedValue({
        rows: [
          {
            id: "p1",
            userId: "u1",
            petType: "slime_grass",
            stats: { level: 1, hunger: 80 },
            isActive: true,
          },
        ],
      });

      const result = await repo.getActivePet("u1");
      expect(result).not.toBeNull();
      expect(result!.isActive).toBe(true);
    });

    it("returns null when no active pet", async () => {
      pool.query.mockResolvedValue({ rows: [] });
      expect(await repo.getActivePet("u1")).toBeNull();
    });
  });

  describe("create", () => {
    it("creates a pet with default stats", async () => {
      pool.query.mockResolvedValue({
        rows: [
          {
            id: "p-new",
            userId: "u1",
            petType: "dragon_fire",
            stats: { level: 1, hunger: 100 },
            isActive: false,
          },
        ],
      });

      const result = await repo.create("u1", "dragon_fire");
      expect(result.petType).toBe("dragon_fire");
      expect(result.isActive).toBe(false);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT"),
        ["u1", "dragon_fire", '{"level":1,"hunger":100}'],
      );
    });
  });

  describe("setActive", () => {
    it("deactivates all then activates the selected pet", async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // deactivate all
        .mockResolvedValueOnce({ rowCount: 1 }); // activate one

      const result = await repo.setActive("u1", "p1");
      expect(result).toBe(true);
      expect(pool.query).toHaveBeenCalledTimes(2);
    });

    it("returns false when pet not found", async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rowCount: 0 });

      const result = await repo.setActive("u1", "nonexistent");
      expect(result).toBe(false);
    });
  });
});
