import express from 'express';
import { createServer } from 'http';
import { Server } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { HouseRoom } from './rooms/HouseRoom.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

export async function bootstrap() {
  const app = express();
  app.use(express.json());

  // Health check
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  const httpServer = createServer(app);

  const gameServer = new Server({
    transport: new WebSocketTransport({ server: httpServer }),
  });

  // Register room types
  gameServer.define('house', HouseRoom);

  httpServer.listen(PORT, () => {
    console.log(`🏠 Egg Farm server listening on http://localhost:${PORT}`);
  });

  return { app, httpServer, gameServer };
}

// Auto-start when run directly
const isMain = process.argv[1]?.endsWith('index.ts') || process.argv[1]?.endsWith('index.js');
if (isMain) {
  bootstrap();
}
