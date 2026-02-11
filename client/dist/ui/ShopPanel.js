import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { EventBridge } from "../EventBridge";
const SHOP_ITEMS = [
    { id: "seed_mint", name: "Mint Seeds", price: 10, emoji: "🌿" },
    { id: "seed_tomato", name: "Tomato Seeds", price: 20, emoji: "🍅" },
    { id: "seed_sunflower", name: "Sunflower Seeds", price: 35, emoji: "🌻" },
    { id: "chair_wood", name: "Wooden Chair", price: 50, emoji: "🪑" },
    { id: "table_wood", name: "Wooden Table", price: 100, emoji: "🪵" },
    { id: "rug_red", name: "Red Rug", price: 75, emoji: "🟥" },
    { id: "lamp_floor", name: "Floor Lamp", price: 60, emoji: "💡" },
    { id: "pot_flower", name: "Flower Pot", price: 30, emoji: "🌱" },
];
export const ShopPanel = ({ isOpen, onClose, }) => {
    const [buying, setBuying] = useState(null);
    if (!isOpen)
        return null;
    const handleBuy = (itemId) => {
        setBuying(itemId);
        EventBridge.emit("buy_item", { itemId, quantity: 1 });
        setTimeout(() => setBuying(null), 600);
    };
    return (_jsx("div", { style: styles.overlay, children: _jsxs("div", { style: styles.panel, children: [_jsxs("div", { style: styles.header, children: [_jsx("h2", { style: styles.title, children: "\uD83C\uDFEA Shop" }), _jsx("button", { style: styles.closeBtn, onClick: onClose, children: "\u2715" })] }), _jsx("div", { style: styles.grid, children: SHOP_ITEMS.map((item) => (_jsxs("div", { style: {
                            ...styles.itemCard,
                            opacity: buying === item.id ? 0.5 : 1,
                        }, children: [_jsxs("div", { style: styles.itemContent, children: [_jsx("span", { style: styles.emoji, children: item.emoji }), _jsx("span", { style: styles.itemName, children: item.name }), _jsxs("span", { style: styles.price, children: ["\uD83E\uDE99 ", item.price] })] }), _jsx("button", { onClick: () => handleBuy(item.id), disabled: buying === item.id, style: styles.buyBtn, children: buying === item.id ? "..." : "Buy" })] }, item.id))) })] }) }));
};
const styles = {
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
        overflowY: "auto",
        border: "1px solid rgba(255,215,0,0.2)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        animation: "slideIn 0.3s ease-out",
    },
    "@keyframes slideIn": {
        from: { opacity: 0, transform: "scale(0.95)" },
        to: { opacity: 1, transform: "scale(1)" },
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
