# Egg Farm - Manual QA Checklist

Use this checklist to verify the game's functionality. Perform these steps in order.

## 1. Connection & Initialization

- [ ] **Action:** Reload the browser page.
- [ ] **Check (Console):** Look for `[App] Discord SDK initialized` and `[App] Joined room successfully`.
- [ ] **Check (Visual):** The isometric grid should appear centered on the screen.
- [ ] **Check (Interaction):** Move mouse over the grid. A blue diamond highlight should follow your cursor.

## 2. Economy & Shop

- [ ] **Action:** Click the **Shop** button (bottom HUD).
- [ ] **Check:** Shop panel slides in.
- [ ] **Action:** Click **Buy** on "Wooden Chair" (Cost: 100).
- [ ] **Check:** Coin balance (top right) decreases by 100.
- [ ] **Check:** A toast or notification says "Purchase successful" (or console log `buy_ok`).

## 3. Inventory & Placement

- [ ] **Action:** Click **Inventory** button.
- [ ] **Check:** The "Wooden Chair" you just bought should be listed with Quantity: 1.
- [ ] **Action:** Click the **Place** button on the chair.
- [ ] **Check:** Inventory closes. The chair is now "attached" to your cursor (or you are in placement mode).
- [ ] **Action:** Click a valid tile on the grid.
- [ ] **Check:** The chair sprite appears on that tile.
- [ ] **Check:** The blue highlight turns off or resets.

## 4. Collision Logic

- [ ] **Action:** Open Shop -> Buy another "Wooden Chair".
- [ ] **Action:** Open Inventory -> Click **Place**.
- [ ] **Action:** Try to click on the **SAME** tile where you placed the first chair.
- [ ] **Check:** The item should **NOT** be placed.
- [ ] **Check:** (Optional) Console might log `Tile already occupied` error.

## 5. Pets & Gacha

- [ ] **Action:** Click **Pets** button.
- [ ] **Check:** Pet panel opens.
- [ ] **Action:** Click **Hatch Egg** (Cost: 1 Egg). _Note: In Demo Mode, this bypasses inventory check._
- [ ] **Check:** A "Hatch Animation" or result screen appears (or just the new pet shows up).
- [ ] **Check:** A new random pet (e.g., "Dog", "Cat", "Chicken") appears in the list.
- [ ] **Action:** Click **Set Active** on the new pet.
- [ ] **Check:** The "Active" badge moves to that pet.

## 6. Social (Visiting)

- [ ] **Action:** Click **Neighbors** button.
- [ ] **Check:** List of mock neighbors appears (`friend-1`, `friend-2`).
- [ ] **Action:** Click **Visit** on `friend-1`.
- [ ] **Check:** The grid reloads (clears your items).
- [ ] **Check:** Console log showing `Joined room` with `friend-1` as owner.
- [ ] **Action:** Click **Home** (or refresh page).
- [ ] **Check:** You are back in your empty room (or your room state).

## 7. Persistence (Demo Mode Warning)

- [ ] **Action:** Reload the page.
- [ ] **Check:** **Warning:** In **Demo Mode** (without DB), your placed items and pets will **disappear** (reset to empty). This is expected behavior until the database is connected.
