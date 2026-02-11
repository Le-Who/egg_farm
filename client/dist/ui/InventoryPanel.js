import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { EventBridge } from "../EventBridge";
const ITEM_DEFINITIONS = {
    chair_wood: { name: "🪑 Chair", color: "#8b5e3c" },
    table_wood: { name: "🪵 Table", color: "#a0522d" },
    rug_red: { name: "🟥 Rug", color: "#b22222" },
    lamp_floor: { name: "💡 Lamp", color: "#ffd700" },
    pot_flower: { name: "🌱 Pot", color: "#228b22" },
    seed_mint: { name: "🌿 Mint", color: "#4caf50" },
    seed_tomato: { name: "🍅 Tomato", color: "#f44336" },
    seed_sunflower: { name: "🌻 Sunflower", color: "#ffc107" },
};
export const InventoryPanel = ({ isOpen, onClose }) => {
    const [inventory, setInventory] = React.useState([]);
    React.useEffect(() => {
        const handleList = (items) => setInventory(items);
        // Optimistic update when buying
        const handleBuy = (payload) => {
            setInventory((prev) => {
                const existing = prev.find((i) => i.itemId === payload.itemId);
                if (existing) {
                    return prev.map((i) => i.itemId === payload.itemId
                        ? { ...i, quantity: i.quantity + payload.quantity }
                        : i);
                }
                return [
                    ...prev,
                    { itemId: payload.itemId, quantity: payload.quantity },
                ];
            });
        };
        EventBridge.on("inventory_updated", handleList);
        EventBridge.on("buy_item", handleBuy);
        return () => {
            EventBridge.off("inventory_updated", handleList);
            EventBridge.off("buy_item", handleBuy);
        };
    }, []);
    if (!isOpen)
        return null;
    const handleSelect = (itemId) => {
        EventBridge.emit("start_placement", itemId); // Or 'plant_seed'
        onClose();
    };
    return (_jsx("div", { style: styles.overlay, children: _jsxs("div", { style: styles.panel, children: [_jsxs("div", { style: styles.header, children: [_jsx("h2", { style: styles.title, children: "\uD83D\uDCE6 Inventory" }), _jsx("button", { style: styles.closeBtn, onClick: onClose, children: "\u2715" })] }), inventory.length === 0 && (_jsx("div", { style: { color: "#888", textAlign: "center", padding: 20 }, children: "Your inventory is empty." })), _jsx("div", { style: styles.grid, children: inventory.map((item) => {
                        const def = ITEM_DEFINITIONS[item.itemId] || {
                            name: item.itemId,
                            color: "#666",
                        };
                        return (_jsxs("button", { style: { ...styles.itemBtn, borderColor: def.color }, onClick: () => handleSelect(item.itemId), children: [_jsx("div", { style: styles.badge, children: item.quantity }), _jsx("span", { style: styles.itemName, children: def.name })] }, item.itemId));
                    }) })] }) }));
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
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        borderRadius: 16,
        padding: 24,
        minWidth: 460,
        maxHeight: "80vh",
        overflowY: "auto",
        border: "1px solid rgba(255,255,255,0.1)",
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
        color: "#e0e0ff",
        fontSize: 20,
        fontFamily: "'Inter', sans-serif",
        fontWeight: 600,
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
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12,
    },
    itemBtn: {
        background: "rgba(255,255,255,0.05)",
        border: "2px solid",
        borderRadius: 12,
        padding: "12px 8px",
        cursor: "pointer",
        transition: "transform 0.15s, box-shadow 0.15s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
    },
    itemName: {
        color: "#ccc",
        fontSize: 13,
        fontFamily: "'Inter', sans-serif",
    },
    badge: {
        position: "absolute",
        top: -8,
        right: -8,
        background: "#ff4081",
        color: "white",
        borderRadius: "50%",
        width: 20,
        height: 20,
        fontSize: 11,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
    },
};
