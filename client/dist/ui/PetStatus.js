import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { EventBridge } from "../EventBridge";
const RARITY_COLORS = {
    common: "#8bc34a",
    uncommon: "#03a9f4",
    rare: "#e040fb",
    legendary: "#ffd700",
};
const PET_EMOJI = {
    slime_grass: "🟢",
    bunny_snow: "🐰",
    fox_ember: "🦊",
    dragon_fire: "🐉",
    phoenix_gold: "🔥",
};
export const PetStatus = ({ isOpen, onClose, }) => {
    const [pets, setPets] = useState([]);
    useEffect(() => {
        const handlePetList = (data) => setPets(data);
        const handlePetHatched = (newPet) => {
            setPets((prev) => [...prev, newPet]);
        };
        EventBridge.on("pets_updated", handlePetList);
        EventBridge.on("pet_hatched", handlePetHatched);
        return () => {
            EventBridge.off("pets_updated", handlePetList);
            EventBridge.off("pet_hatched", handlePetHatched);
        };
    }, []);
    if (!isOpen)
        return null;
    const handleSetActive = (petId) => {
        EventBridge.emit("set_active_pet", { petId });
        setPets((prev) => prev.map((p) => ({ ...p, isActive: p.id === petId })));
    };
    const handleHatchEgg = () => {
        EventBridge.emit("hatch_egg", { gridX: 0, gridY: 0 });
    };
    return (_jsx("div", { style: styles.overlay, children: _jsxs("div", { style: styles.panel, children: [_jsxs("div", { style: styles.header, children: [_jsx("h2", { style: styles.title, children: "\uD83D\uDC3E Pets" }), _jsx("button", { style: styles.closeBtn, onClick: onClose, children: "\u2715" })] }), pets.length === 0 ? (_jsx("div", { style: styles.emptyState, children: _jsx("p", { style: styles.emptyText, children: "No pets yet! Buy an egg from the shop \uD83E\uDD5A" }) })) : (_jsx("div", { style: styles.petList, children: pets.map((pet) => (_jsxs("div", { style: {
                            ...styles.petCard,
                            borderColor: RARITY_COLORS[pet.rarity] ?? "#555",
                        }, children: [_jsxs("div", { style: styles.petHeader, children: [_jsx("span", { style: styles.petEmoji, children: PET_EMOJI[pet.petType] ?? "❓" }), _jsxs("div", { children: [_jsx("div", { style: styles.petName, children: pet.name }), _jsx("div", { style: {
                                                    ...styles.rarityBadge,
                                                    color: RARITY_COLORS[pet.rarity],
                                                }, children: pet.rarity.toUpperCase() })] }), pet.isActive && (_jsx("span", { style: styles.activeBadge, children: "\u2B50 Active" }))] }), _jsxs("div", { style: styles.statRow, children: [_jsxs("span", { children: ["Lv. ", pet.level] }), _jsxs("span", { children: ["\uD83C\uDF56 ", pet.hunger, "%"] })] }), _jsx("div", { style: styles.hungerBar, children: _jsx("div", { style: { ...styles.hungerFill, width: `${pet.hunger}%` } }) }), !pet.isActive && (_jsx("button", { style: styles.setActiveBtn, onClick: () => handleSetActive(pet.id), children: "Set Active" }))] }, pet.id))) })), _jsx("button", { style: styles.hatchBtn, onClick: handleHatchEgg, children: "\uD83E\uDD5A Hatch New Egg" })] }) }));
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
        minWidth: 360,
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
        color: "#fff",
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
    petList: { display: "flex", flexDirection: "column", gap: 12 },
    petCard: {
        background: "rgba(255,255,255,0.05)",
        borderRadius: 12,
        padding: 14,
        border: "1px solid",
    },
    petHeader: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 8,
    },
    petEmoji: { fontSize: 32 },
    petName: {
        color: "#fff",
        fontSize: 15,
        fontWeight: 600,
        fontFamily: "'Inter', sans-serif",
    },
    rarityBadge: {
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 1,
        fontFamily: "'Inter', sans-serif",
    },
    activeBadge: {
        marginLeft: "auto",
        color: "#ffd700",
        fontSize: 12,
        fontWeight: 600,
        fontFamily: "'Inter', sans-serif",
    },
    statRow: {
        display: "flex",
        justifyContent: "space-between",
        color: "#aaa",
        fontSize: 13,
        fontFamily: "'Inter', sans-serif",
        marginBottom: 6,
    },
    hungerBar: {
        height: 6,
        background: "rgba(255,255,255,0.1)",
        borderRadius: 3,
        overflow: "hidden",
        marginBottom: 8,
    },
    hungerFill: {
        height: "100%",
        background: "linear-gradient(90deg, #ef5350, #ff9800, #4caf50)",
        borderRadius: 3,
        transition: "width 0.3s",
    },
    setActiveBtn: {
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.2)",
        color: "#fff",
        borderRadius: 8,
        padding: "6px 12px",
        fontSize: 12,
        cursor: "pointer",
        fontFamily: "'Inter', sans-serif",
    },
    emptyState: { textAlign: "center", padding: 20 },
    emptyText: { color: "#888", fontSize: 14, fontFamily: "'Inter', sans-serif" },
    hatchBtn: {
        width: "100%",
        marginTop: 16,
        background: "linear-gradient(135deg, #ff6f00, #ff8f00)",
        color: "#fff",
        border: "none",
        borderRadius: 12,
        padding: "12px 16px",
        fontSize: 15,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'Inter', sans-serif",
        boxShadow: "0 4px 12px rgba(255,111,0,0.3)",
    },
};
