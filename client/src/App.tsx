import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPhaserGame } from './game/PhaserGame';
import { HUD } from './ui/HUD';
import { InventoryPanel } from './ui/InventoryPanel';

const App: React.FC = () => {
  const phaserRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  const [inventoryOpen, setInventoryOpen] = useState(false);

  useEffect(() => {
    if (phaserRef.current && !gameInstanceRef.current) {
      gameInstanceRef.current = createPhaserGame(phaserRef.current);
    }

    return () => {
      gameInstanceRef.current?.destroy(true);
      gameInstanceRef.current = null;
    };
  }, []);

  const handleOpenInventory = useCallback(() => setInventoryOpen(true), []);
  const handleCloseInventory = useCallback(() => setInventoryOpen(false), []);

  return (
    <div style={styles.root}>
      {/* Phaser canvas */}
      <div ref={phaserRef} style={styles.gameContainer} />

      {/* React HUD overlay */}
      <HUD onOpenInventory={handleOpenInventory} />
      <InventoryPanel isOpen={inventoryOpen} onClose={handleCloseInventory} />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  root: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  gameContainer: {
    width: '100%',
    height: '100%',
  },
};

export default App;
