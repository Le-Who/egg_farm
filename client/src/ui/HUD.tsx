import React, { useState, useEffect } from 'react';
import { EventBridge } from '../EventBridge';

export const HUD: React.FC<{
  onOpenInventory: () => void;
  onOpenShop: () => void;
  onOpenPets: () => void;
  onOpenNeighbors: () => void;
}> = ({ onOpenInventory, onOpenShop, onOpenPets, onOpenNeighbors }) => {
  const [coins, setCoins] = useState(500);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleError = (msg: string) => {
      setError(msg);
      setTimeout(() => setError(null), 3000);
    };

    const handleCoinUpdate = (newBalance: number) => setCoins(newBalance);

    EventBridge.on('server_error', handleError);
    EventBridge.on('coins_updated', handleCoinUpdate);
    return () => {
      EventBridge.off('server_error', handleError);
      EventBridge.off('coins_updated', handleCoinUpdate);
    };
  }, []);

  return (
    <div style={styles.container}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.coinDisplay}>
          <span style={styles.coinIcon}>🪙</span>
          <span style={styles.coinCount}>{coins.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={styles.neighborsBtn} onClick={onOpenNeighbors}>
            👋 Friends
          </button>
          <button style={styles.petsBtn} onClick={onOpenPets}>
            🐾 Pets
          </button>
          <button style={styles.shopBtn} onClick={onOpenShop}>
            🏪 Shop
          </button>
          <button style={styles.inventoryBtn} onClick={onOpenInventory}>
            📦 Inventory
          </button>
        </div>
      </div>

      {/* Error toast */}
      {error && (
        <div style={styles.errorToast}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
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
    position: 'fixed' as const,
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
  },
};
