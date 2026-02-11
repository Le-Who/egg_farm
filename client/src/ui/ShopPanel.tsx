import React, { useState } from "react";
import { EventBridge } from "../EventBridge";

interface ShopItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
}

const SHOP_ITEMS: ShopItem[] = [
  { id: "seed_mint", name: "Mint Seeds", price: 10, emoji: "🌿" },
  { id: "seed_tomato", name: "Tomato Seeds", price: 20, emoji: "🍅" },
  { id: "seed_sunflower", name: "Sunflower Seeds", price: 35, emoji: "🌻" },
  { id: "chair_wood", name: "Wooden Chair", price: 50, emoji: "🪑" },
  { id: "table_wood", name: "Wooden Table", price: 100, emoji: "🪵" },
  { id: "rug_red", name: "Red Rug", price: 75, emoji: "🟥" },
  { id: "lamp_floor", name: "Floor Lamp", price: 60, emoji: "💡" },
  { id: "pot_flower", name: "Flower Pot", price: 30, emoji: "🌱" },
];

export const ShopPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [buying, setBuying] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBuy = (itemId: string) => {
    setBuying(itemId);
    EventBridge.emit("buy_item", { itemId, quantity: 1 });
    setTimeout(() => setBuying(null), 600);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <h2 style={styles.title}>🏪 Shop</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>
        <div style={styles.grid}>
          {SHOP_ITEMS.map((item) => (
            <div
              key={item.id}
              style={{
                ...styles.itemCard,
                opacity: buying === item.id ? 0.5 : 1,
              }}
            >
              <div style={styles.itemContent}>
                <span style={styles.emoji}>{item.emoji}</span>
                <span style={styles.itemName}>{item.name}</span>
                <span style={styles.price}>🪙 {item.price}</span>
              </div>
              <button
                onClick={() => handleBuy(item.id)}
                disabled={buying === item.id}
                style={styles.buyBtn}
              >
                {buying === item.id ? "..." : "Buy"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1000,
  },
  panel: {
    background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)",
    borderRadius: 16,
    padding: 24,
    minWidth: 380,
    maxHeight: "80vh",
    overflowY: "auto" as const,
    border: "1px solid rgba(255,215,0,0.2)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    color: "#ffd700",
    fontSize: 22,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    margin: 0,
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#888",
    fontSize: 20,
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 10,
  },
  itemCard: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  itemContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  buyBtn: {
    width: "100%",
    padding: "8px 0",
    background: "linear-gradient(135deg, #ffd700, #ffca28)",
    border: "none",
    borderRadius: 8,
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: 13,
  },
  emoji: { fontSize: 28 },
  itemName: {
    color: "#ddd",
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
  },
  price: {
    color: "#ffd700",
    fontSize: 12,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
  },
};
