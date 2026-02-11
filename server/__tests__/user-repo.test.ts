import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserRepo } from '../src/db/repositories/UserRepo';

// Mock pg.Pool
function createMockPool() {
  return {
    query: vi.fn(),
  } as any;
}

describe('UserRepo', () => {
  let pool: ReturnType<typeof createMockPool>;
  let repo: UserRepo;

  beforeEach(() => {
    pool = createMockPool();
    repo = new UserRepo(pool);
  });

  describe('findByDiscordId', () => {
    it('returns user when found', async () => {
      const mockUser = {
        id: 'uuid-1',
        discordId: 'discord-123',
        coins: 100,
        gems: 5,
        xp: 0,
        lastLogin: new Date(),
      };
      pool.query.mockResolvedValue({ rows: [mockUser] });

      const result = await repo.findByDiscordId('discord-123');

      expect(result).toEqual(mockUser);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('discord_id'),
        ['discord-123'],
      );
    });

    it('returns null when not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await repo.findByDiscordId('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('inserts and returns new user', async () => {
      const newUser = {
        id: 'uuid-2',
        discordId: 'discord-456',
        coins: 0,
        gems: 0,
        xp: 0,
        lastLogin: new Date(),
      };
      pool.query.mockResolvedValue({ rows: [newUser] });

      const result = await repo.create('discord-456');

      expect(result).toEqual(newUser);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT'),
        ['discord-456'],
      );
    });
  });

  describe('updateCoins', () => {
    it('updates coins and returns new balance', async () => {
      pool.query.mockResolvedValue({ rows: [{ coins: 150 }] });

      const result = await repo.updateCoins('uuid-1', 50);
      expect(result).toBe(150);
    });

    it('returns 0 when user not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await repo.updateCoins('nonexistent', 50);
      expect(result).toBe(0);
    });
  });

  describe('upsert', () => {
    it('returns existing user and touches last_login', async () => {
      const existingUser = {
        id: 'uuid-1',
        discordId: 'discord-123',
        coins: 100,
        gems: 5,
        xp: 0,
        lastLogin: new Date('2024-01-01'),
      };
      // First call: findByDiscordId SELECT
      // Second call: UPDATE last_login
      pool.query
        .mockResolvedValueOnce({ rows: [existingUser] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await repo.upsert('discord-123');

      expect(result.discordId).toBe('discord-123');
      expect(pool.query).toHaveBeenCalledTimes(2);
    });

    it('creates new user when not found', async () => {
      const newUser = {
        id: 'uuid-new',
        discordId: 'discord-new',
        coins: 0,
        gems: 0,
        xp: 0,
        lastLogin: new Date(),
      };
      // First call: findByDiscordId returns empty
      // Second call: INSERT creates user
      pool.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [newUser] });

      const result = await repo.upsert('discord-new');

      expect(result.id).toBe('uuid-new');
    });
  });
});
