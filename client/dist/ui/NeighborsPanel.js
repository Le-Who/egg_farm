import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { EventBridge } from '../EventBridge';
export const NeighborsPanel = ({ isOpen, onClose, }) => {
    const [neighbors, setNeighbors] = useState([
        // Demo — will be populated by Discord Voice API
        { discordId: 'friend-1', displayName: 'PlayerOne', isOnline: true },
        { discordId: 'friend-2', displayName: 'GardenFan', isOnline: true },
        { discordId: 'friend-3', displayName: 'CozyBuilder', isOnline: false },
    ]);
    useEffect(() => {
        const handleUpdate = (data) => setNeighbors(data);
        EventBridge.on('neighbors_updated', handleUpdate);
        return () => EventBridge.off('neighbors_updated', handleUpdate);
    }, []);
    if (!isOpen)
        return null;
    const handleVisit = (discordId) => {
        EventBridge.emit('visit_friend', { discordId });
        onClose();
    };
    const online = neighbors.filter((n) => n.isOnline);
    const offline = neighbors.filter((n) => !n.isOnline);
    return (_jsx("div", { style: styles.overlay, children: _jsxs("div", { style: styles.panel, children: [_jsxs("div", { style: styles.header, children: [_jsx("h2", { style: styles.title, children: "\uD83D\uDC4B Neighbors" }), _jsx("button", { style: styles.closeBtn, onClick: onClose, children: "\u2715" })] }), online.length > 0 && (_jsxs(_Fragment, { children: [_jsxs("div", { style: styles.sectionLabel, children: ["\uD83D\uDFE2 Online (", online.length, ")"] }), online.map((n) => (_jsxs("div", { style: styles.neighborRow, children: [_jsx("span", { style: styles.avatar, children: "\uD83D\uDE0A" }), _jsx("span", { style: styles.name, children: n.displayName }), _jsx("button", { style: styles.visitBtn, onClick: () => handleVisit(n.discordId), children: "Visit \uD83C\uDFE0" })] }, n.discordId)))] })), offline.length > 0 && (_jsxs(_Fragment, { children: [_jsxs("div", { style: { ...styles.sectionLabel, marginTop: 16 }, children: ["\u26AB Offline (", offline.length, ")"] }), offline.map((n) => (_jsxs("div", { style: { ...styles.neighborRow, opacity: 0.5 }, children: [_jsx("span", { style: styles.avatar, children: "\uD83D\uDE34" }), _jsx("span", { style: styles.name, children: n.displayName })] }, n.discordId)))] })), neighbors.length === 0 && (_jsx("p", { style: styles.empty, children: "No neighbors found. Join a Discord voice channel!" }))] }) }));
};
const styles = {
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
    },
    panel: {
        background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
        borderRadius: 16, padding: 24,
        minWidth: 340, maxHeight: '70vh', overflowY: 'auto',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        animation: 'slideIn 0.3s ease-out',
    },
    '@keyframes slideIn': {
        from: { opacity: 0, transform: 'scale(0.95)' },
        to: { opacity: 1, transform: 'scale(1)' },
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    title: { color: '#fff', fontSize: 22, fontFamily: "'Inter', sans-serif", fontWeight: 700, margin: 0 },
    closeBtn: { background: 'none', border: 'none', color: '#888', fontSize: 20, cursor: 'pointer' },
    sectionLabel: {
        color: '#aaa', fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: 1, marginBottom: 8, fontFamily: "'Inter', sans-serif",
    },
    neighborRow: {
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 12px', background: 'rgba(255,255,255,0.05)',
        borderRadius: 10, marginBottom: 6,
    },
    avatar: { fontSize: 24 },
    name: { color: '#fff', fontSize: 14, fontWeight: 500, flex: 1, fontFamily: "'Inter', sans-serif" },
    visitBtn: {
        background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
        color: '#fff', border: 'none', borderRadius: 8,
        padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        fontFamily: "'Inter', sans-serif",
    },
    empty: { color: '#888', textAlign: 'center', fontSize: 14, fontFamily: "'Inter', sans-serif" },
};
