import React, { useState, useEffect } from "react";
import { EventBridge } from "../EventBridge";

interface Neighbor {
  discordId: string;
  displayName: string;
  isOnline: boolean;
}

export const NeighborsPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [neighbors, setNeighbors] = useState<Neighbor[]>([
    // Demo — will be populated by Discord Voice API
    { discordId: "friend-1", displayName: "PlayerOne", isOnline: true },
    { discordId: "friend-2", displayName: "GardenFan", isOnline: true },
    { discordId: "friend-3", displayName: "CozyBuilder", isOnline: false },
  ]);

  useEffect(() => {
    const handleUpdate = (data: Neighbor[]) => setNeighbors(data);
    EventBridge.on("neighbors_updated", handleUpdate);
    return () => EventBridge.off("neighbors_updated", handleUpdate);
  }, []);

  if (!isOpen) return null;

  const handleVisit = (discordId: string) => {
    EventBridge.emit("visit_friend", { discordId });
    onClose();
  };

  const online = neighbors.filter((n) => n.isOnline);
  const offline = neighbors.filter((n) => !n.isOnline);

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <h2 style={styles.title}>👋 Neighbors</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {online.length > 0 && (
          <>
            <div style={styles.sectionLabel}>🟢 Online ({online.length})</div>
            {online.map((n) => (
              <div key={n.discordId} style={styles.neighborRow}>
                <span style={styles.avatar}>😊</span>
                <span style={styles.name}>{n.displayName}</span>
                <button
                  style={styles.visitBtn}
                  onClick={() => handleVisit(n.discordId)}
                >
                  Visit 🏠
                </button>
              </div>
            ))}
          </>
        )}

        {offline.length > 0 && (
          <>
            <div style={{ ...styles.sectionLabel, marginTop: 16 }}>
              ⚫ Offline ({offline.length})
            </div>
            {offline.map((n) => (
              <div
                key={n.discordId}
                style={{ ...styles.neighborRow, opacity: 0.5 }}
              >
                <span style={styles.avatar}>😴</span>
                <span style={styles.name}>{n.displayName}</span>
              </div>
            ))}
          </>
        )}

        {neighbors.length === 0 && (
          <p style={styles.empty}>
            No neighbors found. Join a Discord voice channel!
          </p>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
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
    background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)",
    borderRadius: 16,
    padding: 24,
    minWidth: 340,
    maxHeight: "70vh",
    overflowY: "auto" as const,
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
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
  sectionLabel: {
    color: "#aaa",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    marginBottom: 8,
    fontFamily: "'Inter', sans-serif",
  },
  neighborRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 12px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    marginBottom: 6,
  },
  avatar: { fontSize: 24 },
  name: {
    color: "#fff",
    fontSize: 14,
    fontWeight: 500,
    flex: 1,
    fontFamily: "'Inter', sans-serif",
  },
  visitBtn: {
    background: "linear-gradient(135deg, #2ecc71, #27ae60)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
  },
  empty: {
    color: "#888",
    textAlign: "center" as const,
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
  },
};
