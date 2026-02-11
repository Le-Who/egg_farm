import { describe, it, expect } from 'vitest';
import { getItemDef, getAllItems, getItemsByCategory, ITEMS } from '../src/config/game-config';

describe('game-config', () => {
  it('ITEMS has at least one entry', () => {
    expect(Object.keys(ITEMS).length).toBeGreaterThan(0);
  });

  it('getItemDef returns correct item', () => {
    const chair = getItemDef('chair_wood');
    expect(chair).toBeDefined();
    expect(chair!.name).toBe('Wooden Chair');
    expect(chair!.price).toBe(50);
    expect(chair!.currency).toBe('coins');
  });

  it('getItemDef returns undefined for unknown items', () => {
    expect(getItemDef('nonexistent_item')).toBeUndefined();
  });

  it('getAllItems returns all defined items', () => {
    const all = getAllItems();
    expect(all.length).toBe(Object.keys(ITEMS).length);
  });

  it('getItemsByCategory filters correctly', () => {
    const furniture = getItemsByCategory('furniture');
    expect(furniture.length).toBeGreaterThan(0);
    furniture.forEach((item) => {
      expect(item.category).toBe('furniture');
    });
  });

  it('every item has valid required fields', () => {
    getAllItems().forEach((item) => {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.price).toBeGreaterThanOrEqual(0);
      expect(item.sizeX).toBeGreaterThan(0);
      expect(item.sizeY).toBeGreaterThan(0);
      expect(['coins', 'gems']).toContain(item.currency);
      expect(['furniture', 'decoration', 'seed', 'special']).toContain(item.category);
    });
  });
});
