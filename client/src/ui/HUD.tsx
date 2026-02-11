import React, { useState, useEffect } from 'react';
import { EventBridge } from '../EventBridge';

export const HUD: React.FC<{ onOpenInventory: () => void }> = ({ onOpenInventory }) => {
  const [coins, setCoins] = useState(500);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleError = (msg: string) => {
      setError(msg);
      setTimeout(() => setError(null), 3000);
    };

    EventBridge.on('server_error', handleError);
    return () => EventBridge.off('server_error', handleError);
  }, []);

  return (
    <div style={styles.container}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.coinDisplay}>
          <span style={styles.coinIcon}>🪙</span>
          <span style={styles.coinCount}>{coins.toLocaleString()}</span>
        </div>
        <button style={styles.inventoryBtn} onClick={onOpenInventory}>
          📦 Inventory
        </button>
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
