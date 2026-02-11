import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPhaserGame } from './game/PhaserGame';
import { HUD } from './ui/HUD';
import { InventoryPanel } from './ui/InventoryPanel';
import { ShopPanel } from './ui/ShopPanel';
import { PetStatus } from './ui/PetStatus';
import { NeighborsPanel } from './ui/NeighborsPanel';

const App: React.FC = () => {
  const phaserRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [petsOpen, setPetsOpen] = useState(false);
  const [neighborsOpen, setNeighborsOpen] = useState(false);

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
  const handleOpenShop = useCallback(() => setShopOpen(true), []);
  const handleCloseShop = useCallback(() => setShopOpen(false), []);
  const handleOpenPets = useCallback(() => setPetsOpen(true), []);
  const handleClosePets = useCallback(() => setPetsOpen(false), []);
  const handleOpenNeighbors = useCallback(() => setNeighborsOpen(true), []);
  const handleCloseNeighbors = useCallback(() => setNeighborsOpen(false), []);

  return (
    <div style={styles.root}>
      {/* Phaser canvas */}
      <div ref={phaserRef} style={styles.gameContainer} />

      {/* React HUD overlay */}
      <HUD
        onOpenInventory={handleOpenInventory}
        onOpenShop={handleOpenShop}
        onOpenPets={handleOpenPets}
        onOpenNeighbors={handleOpenNeighbors}
      />
      <InventoryPanel isOpen={inventoryOpen} onClose={handleCloseInventory} />
      <ShopPanel isOpen={shopOpen} onClose={handleCloseShop} />
      <PetStatus isOpen={petsOpen} onClose={handleClosePets} />
      <NeighborsPanel isOpen={neighborsOpen} onClose={handleCloseNeighbors} />
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

