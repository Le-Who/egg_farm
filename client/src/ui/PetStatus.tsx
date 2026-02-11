import React, { useState, useEffect } from 'react';
import { EventBridge } from '../EventBridge';

interface PetInfo {
  id: string;
  petType: string;
  name: string;
  level: number;
  hunger: number;
  isActive: boolean;
  rarity: string;
}

const RARITY_COLORS: Record<string, string> = {
  common: '#8bc34a',
  uncommon: '#03a9f4',
  rare: '#e040fb',
  legendary: '#ffd700',
};

const PET_EMOJI: Record<string, string> = {
  slime_grass: '🟢',
  bunny_snow: '🐰',
  fox_ember: '🦊',
  dragon_fire: '🐉',
  phoenix_gold: '🔥',
};

export const PetStatus: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [pets, setPets] = useState<PetInfo[]>([
    // Demo data — will be replaced by server sync
    { id: 'demo1', petType: 'slime_grass', name: 'Grass Slime', level: 1, hunger: 80, isActive: true, rarity: 'common' },
  ]);

  useEffect(() => {
    const handlePetUpdate = (data: PetInfo[]) => setPets(data);
    EventBridge.on('pets_updated', handlePetUpdate);
    return () => EventBridge.off('pets_updated', handlePetUpdate);
  }, []);

  if (!isOpen) return null;

  const handleSetActive = (petId: string) => {
    EventBridge.emit('set_active_pet', { petId });
  };

  const handleHatchEgg = () => {
    EventBridge.emit('hatch_egg', { gridX: 0, gridY: 0 });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <h2 style={styles.title}>🐾 Pets</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {pets.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No pets yet! Buy an egg from the shop 🥚</p>
          </div>
        ) : (
          <div style={styles.petList}>
            {pets.map((pet) => (
              <div
                key={pet.id}
                style={{
                  ...styles.petCard,
                  borderColor: RARITY_COLORS[pet.rarity] ?? '#555',
                }}
              >
                <div style={styles.petHeader}>
                  <span style={styles.petEmoji}>{PET_EMOJI[pet.petType] ?? '❓'}</span>
                  <div>
                    <div style={styles.petName}>{pet.name}</div>
                    <div style={{ ...styles.rarityBadge, color: RARITY_COLORS[pet.rarity] }}>
                      {pet.rarity.toUpperCase()}
                    </div>
                  </div>
                  {pet.isActive && <span style={styles.activeBadge}>⭐ Active</span>}
                </div>

                <div style={styles.statRow}>
                  <span>Lv. {pet.level}</span>
                  <span>🍖 {pet.hunger}%</span>
                </div>

                <div style={styles.hungerBar}>
                  <div style={{ ...styles.hungerFill, width: `${pet.hunger}%` }} />
                </div>

                {!pet.isActive && (
                  <button style={styles.setActiveBtn} onClick={() => handleSetActive(pet.id)}>
                    Set Active
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <button style={styles.hatchBtn} onClick={handleHatchEgg}>
          🥚 Hatch New Egg
        </button>
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
    minWidth: 360,
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
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  title: { color: '#fff', fontSize: 22, fontFamily: "'Inter', sans-serif", fontWeight: 700, margin: 0 },
  closeBtn: { background: 'none', border: 'none', color: '#888', fontSize: 20, cursor: 'pointer' },
  petList: { display: 'flex', flexDirection: 'column' as const, gap: 12 },
  petCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    border: '1px solid',
  },
  petHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  petEmoji: { fontSize: 32 },
  petName: { color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: "'Inter', sans-serif" },
  rarityBadge: { fontSize: 10, fontWeight: 700, letterSpacing: 1, fontFamily: "'Inter', sans-serif" },
  activeBadge: {
    marginLeft: 'auto', color: '#ffd700', fontSize: 12, fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
  },
  statRow: {
    display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: 13,
    fontFamily: "'Inter', sans-serif", marginBottom: 6,
  },
  hungerBar: {
    height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', marginBottom: 8,
  },
  hungerFill: {
    height: '100%', background: 'linear-gradient(90deg, #ef5350, #ff9800, #4caf50)',
    borderRadius: 3, transition: 'width 0.3s',
  },
  setActiveBtn: {
    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 12,
    cursor: 'pointer', fontFamily: "'Inter', sans-serif",
  },
  emptyState: { textAlign: 'center' as const, padding: 20 },
  emptyText: { color: '#888', fontSize: 14, fontFamily: "'Inter', sans-serif" },
  hatchBtn: {
    width: '100%', marginTop: 16,
    background: 'linear-gradient(135deg, #ff6f00, #ff8f00)',
    color: '#fff', border: 'none', borderRadius: 12,
    padding: '12px 16px', fontSize: 15, fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Inter', sans-serif",
    boxShadow: '0 4px 12px rgba(255,111,0,0.3)',
  },
};
