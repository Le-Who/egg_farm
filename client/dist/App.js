import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPhaserGame } from "./game/PhaserGame";
import { HUD } from "./ui/HUD";
import { InventoryPanel } from "./ui/InventoryPanel";
import { ShopPanel } from "./ui/ShopPanel";
import { PetStatus } from "./ui/PetStatus";
import { NeighborsPanel } from "./ui/NeighborsPanel";
import { initDiscordSDK } from "./network/DiscordSDK";
import { joinHouseRoom } from "./network/ColyseusClient";
const App = () => {
    const phaserRef = useRef(null);
    const gameInstanceRef = useRef(null);
    const [inventoryOpen, setInventoryOpen] = useState(false);
    const [shopOpen, setShopOpen] = useState(false);
    const [petsOpen, setPetsOpen] = useState(false);
    const [neighborsOpen, setNeighborsOpen] = useState(false);
    useEffect(() => {
        // Initialize Phaser game
        if (phaserRef.current && !gameInstanceRef.current) {
            gameInstanceRef.current = createPhaserGame(phaserRef.current);
        }
        // Initialize Network & Discord SDK
        const initGame = async () => {
            try {
                console.log("[App] Initializing Discord SDK...");
                const auth = await initDiscordSDK();
                console.log("[App] Discord SDK initialized:", auth);
                console.log(`[App] Joining HouseRoom for user ${auth.user.id}...`);
                await joinHouseRoom(auth.user.id, auth.user.id);
                console.log("[App] Joined room successfully.");
            }
            catch (err) {
                console.error("[App] Initialization failed:", err);
            }
        };
        initGame();
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
    return (_jsxs("div", { style: styles.root, children: [_jsx("div", { ref: phaserRef, style: styles.gameContainer }), _jsx(HUD, { onOpenInventory: handleOpenInventory, onOpenShop: handleOpenShop, onOpenPets: handleOpenPets, onOpenNeighbors: handleOpenNeighbors }), _jsx(InventoryPanel, { isOpen: inventoryOpen, onClose: handleCloseInventory }), _jsx(ShopPanel, { isOpen: shopOpen, onClose: handleCloseShop }), _jsx(PetStatus, { isOpen: petsOpen, onClose: handleClosePets }), _jsx(NeighborsPanel, { isOpen: neighborsOpen, onClose: handleCloseNeighbors })] }));
};
const styles = {
    root: {
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
    },
    gameContainer: {
        width: "100%",
        height: "100%",
    },
};
export default App;
