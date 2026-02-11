import React from 'react';
import { EventBridge } from '../EventBridge';

interface InventoryItem {
  id: string;
  name: string;
  color: string;
}

const ITEMS: InventoryItem[] = [
  { id: 'chair_wood', name: '🪑 Chair', color: '#8b5e3c' },
  { id: 'table_wood', name: '🪵 Table', color: '#a0522d' },
  { id: 'rug_red', name: '🟥 Rug', color: '#b22222' },
  { id: 'lamp_floor', name: '💡 Lamp', color: '#ffd700' },
  { id: 'pot_flower', name: '🌱 Pot', color: '#228b22' },
];

export const InventoryPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleSelect = (itemId: string) => {
    EventBridge.emit('start_placement', itemId);
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <h2 style={styles.title}>📦 Inventory</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={styles.grid}>
          {ITEMS.map((item) => (
            <button
              key={item.id}
              style={{ ...styles.itemBtn, borderColor: item.color }}
              onClick={() => handleSelect(item.id)}
            >
              <span style={styles.itemName}>{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  },
  panel: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    borderRadius: 16,
    padding: 24,
    minWidth: 460,
    maxHeight: '80vh',
    overflowY: 'auto' as const,
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
    animation: 'slideIn 0.3s ease-out',
  },
  '@keyframes slideIn': {
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#e0e0ff',
    fontSize: 20,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: 20,
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
  },
  itemBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '2px solid',
    borderRadius: 12,
    padding: '12px 8px',
    cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  itemName: {
    color: '#ccc',
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
  },
};
