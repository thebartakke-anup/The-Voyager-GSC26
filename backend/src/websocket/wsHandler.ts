import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  userRole?: string;
  isAlive?: boolean;
}

interface WSMessage {
  type: string;
  payload?: unknown;
}

let wss: WebSocketServer | null = null;

export function initWebSocket(server: import('http').Server): WebSocketServer {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws: AuthenticatedWebSocket, req: IncomingMessage) => {
    ws.isAlive = true;

    // Authenticate connection
    const url = new URL(req.url || '/', `http://localhost`);
    const token = url.searchParams.get('token');

    if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; role: string };
        ws.userId = decoded.id;
        ws.userRole = decoded.role;
      } catch {
        ws.close(4001, 'Invalid token');
        return;
      }
    }

    ws.send(JSON.stringify({ type: 'CONNECTED', payload: { message: 'Connected to Voyager WSS' } }));

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (data) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());
        handleMessage(ws, message);
      } catch {
        ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Invalid message format' } }));
      }
    });

    ws.on('close', () => {
      console.log(`WebSocket client disconnected: ${ws.userId || 'anonymous'}`);
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err);
    });
  });

  // Heartbeat
  const interval = setInterval(() => {
    if (!wss) return;
    wss.clients.forEach((ws) => {
      const authWs = ws as AuthenticatedWebSocket;
      if (!authWs.isAlive) {
        authWs.terminate();
        return;
      }
      authWs.isAlive = false;
      authWs.ping();
    });
  }, 30000);

  wss.on('close', () => clearInterval(interval));

  return wss;
}

function handleMessage(ws: AuthenticatedWebSocket, message: WSMessage): void {
  switch (message.type) {
    case 'PING':
      ws.send(JSON.stringify({ type: 'PONG' }));
      break;
    case 'SUBSCRIBE_SHIPMENT':
      ws.send(JSON.stringify({ type: 'SUBSCRIBED', payload: message.payload }));
      break;
    default:
      ws.send(JSON.stringify({ type: 'UNKNOWN_MESSAGE_TYPE' }));
  }
}

export function broadcast(type: string, payload: unknown): void {
  if (!wss) return;
  const message = JSON.stringify({ type, payload });
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

export function broadcastToUser(userId: string, type: string, payload: unknown): void {
  if (!wss) return;
  const message = JSON.stringify({ type, payload });
  wss.clients.forEach((ws) => {
    const authWs = ws as AuthenticatedWebSocket;
    if (authWs.readyState === WebSocket.OPEN && authWs.userId === userId) {
      authWs.send(message);
    }
  });
}
