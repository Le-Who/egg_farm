import { describe, it, expect, vi, beforeEach } from "vitest";
import { IAPService } from "../src/services/IAPService";
import { SKUS } from "../src/config/iap-config";

function createMockUserRepo() {
  return {
    findById: vi.fn(),
    updateGems: vi.fn(),
  } as any;
}

function createMockInventoryRepo() {
  return {
    addItem: vi.fn(),
  } as any;
}

describe("IAPService", () => {
  let userRepo: ReturnType<typeof createMockUserRepo>;
  let inventoryRepo: ReturnType<typeof createMockInventoryRepo>;
  let service: IAPService;

  beforeEach(() => {
    userRepo = createMockUserRepo();
    inventoryRepo = createMockInventoryRepo();
    service = new IAPService(userRepo, inventoryRepo);
  });

  it("rejects unknown SKU", async () => {
    const result = await service.fulfillPurchase("u1", "fake.sku");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Unknown SKU");
  });

  it("rejects if user not found", async () => {
    userRepo.findById.mockResolvedValue(null);
    const result = await service.fulfillPurchase(
      "u1",
      "com.game.pouch_gems_small",
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain("User not found");
  });

  it("grants gems for small gem pouch", async () => {
    userRepo.findById.mockResolvedValue({ id: "u1", gems: 50 });
    userRepo.updateGems.mockResolvedValue(150);

    const result = await service.fulfillPurchase(
      "u1",
      "com.game.pouch_gems_small",
    );
    expect(result.success).toBe(true);
    expect(result.gemsGranted).toBe(100);
    expect(result.newGemBalance).toBe(150); // 50 + 100
    expect(userRepo.updateGems).toHaveBeenCalledWith("u1", 100);
  });

  it("grants gems for medium gem pouch", async () => {
    userRepo.findById.mockResolvedValue({ id: "u1", gems: 0 });
    userRepo.updateGems.mockResolvedValue(550);

    const result = await service.fulfillPurchase(
      "u1",
      "com.game.pouch_gems_medium",
    );
    expect(result.success).toBe(true);
    expect(result.gemsGranted).toBe(550);
    expect(userRepo.updateGems).toHaveBeenCalledWith("u1", 550);
  });

  it("grants gems + bonus items for starter pack", async () => {
    userRepo.findById.mockResolvedValue({ id: "u1", gems: 10 });
    userRepo.updateGems.mockResolvedValue(210);

    const result = await service.fulfillPurchase("u1", "com.game.starter_pack");
    expect(result.success).toBe(true);
    expect(result.gemsGranted).toBe(200);

    // Should grant bonus egg
    expect(inventoryRepo.addItem).toHaveBeenCalledWith("u1", "egg_basic", 1);
  });

  it("all SKUs have valid configuration", () => {
    Object.values(SKUS).forEach((sku) => {
      expect(sku.skuId).toBeTruthy();
      expect(sku.priceUsdCents).toBeGreaterThan(0);
      expect(sku.gems).toBeGreaterThan(0);
    });
  });
});
