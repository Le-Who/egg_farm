import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { EventBridge } from '../EventBridge';
export const HUD = ({ onOpenInventory, onOpenShop, onOpenPets, onOpenNeighbors }) => {
    const [coins, setCoins] = useState(500);
    const [error, setError] = useState(null);
    useEffect(() => {
        const handleError = (msg) => {
            setError(msg);
            setTimeout(() => setError(null), 3000);
        };
        const handleCoinUpdate = (newBalance) => setCoins(newBalance);
        EventBridge.on('server_error', handleError);
        EventBridge.on('coins_updated', handleCoinUpdate);
        return () => {
            EventBridge.off('server_error', handleError);
            EventBridge.off('coins_updated', handleCoinUpdate);
        };
    }, []);
    return (_jsxs("div", { style: styles.container, children: [_jsxs("div", { style: styles.topBar, children: [_jsxs("div", { style: styles.coinDisplay, children: [_jsx("span", { style: styles.coinIcon, children: "\uD83E\uDE99" }), _jsx("span", { style: styles.coinCount, children: coins.toLocaleString() })] }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("button", { style: styles.neighborsBtn, onClick: onOpenNeighbors, children: "\uD83D\uDC4B Friends" }), _jsx("button", { style: styles.petsBtn, onClick: onOpenPets, children: "\uD83D\uDC3E Pets" }), _jsx("button", { style: styles.shopBtn, onClick: onOpenShop, children: "\uD83C\uDFEA Shop" }), _jsx("button", { style: styles.inventoryBtn, onClick: onOpenInventory, children: "\uD83D\uDCE6 Inventory" })] })] }), error && (_jsxs("div", { style: styles.errorToast, children: ["\u26A0\uFE0F ", error] }))] }));
};
const styles = {
    container: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        pointerEvents: 'none',
        zIndex: 500,
        fontFamily: "'Inter', sans-serif",
    },
    topBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px',
        pointerEvents: 'auto',
    },
    coinDisplay: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'rgba(0,0,0,0.5)',
        padding: '6px 14px',
        borderRadius: 20,
        border: '1px solid rgba(255,215,0,0.3)',
    },
    coinIcon: { fontSize: 18 },
    coinCount: {
        color: '#ffd700',
        fontWeight: 600,
        fontSize: 16,
    },
    neighborsBtn: {
        background: 'linear-gradient(135deg, #9b59b6, #8e44ad)',
        color: '#fff',
        border: 'none',
        borderRadius: 12,
        padding: '8px 16px',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(155,89,182,0.3)',
        transition: 'transform 0.15s',
    },
    petsBtn: {
        background: 'linear-gradient(135deg, #ff9800, #f57c00)',
        color: '#fff',
        border: 'none',
        borderRadius: 12,
        padding: '8px 16px',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(255,152,0,0.3)',
        transition: 'transform 0.15s',
    },
    shopBtn: {
        background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
        color: '#fff',
        border: 'none',
        borderRadius: 12,
        padding: '8px 16px',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(46,204,113,0.3)',
        transition: 'transform 0.15s',
    },
    inventoryBtn: {
        background: 'linear-gradient(135deg, #4a90d9, #357abd)',
        color: '#fff',
        border: 'none',
        borderRadius: 12,
        padding: '8px 16px',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(74,144,217,0.3)',
        transition: 'transform 0.15s',
    },
    errorToast: {
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(180,40,40,0.9)',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: 8,
        fontSize: 14,
        pointerEvents: 'auto',
        zIndex: 2000,
        animation: 'fadeIn 0.3s ease-out',
    },
    '@keyframes fadeIn': {
        from: { opacity: 0, transform: 'translateY(10px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
    },
};
