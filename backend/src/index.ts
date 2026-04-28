// backend/src/index.ts
// Main application entry point

import 'dotenv/config';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { initWebSocket } from './websocket/wsHandler';

// Route imports
import authRoutes from './routes/auth';
import shipmentRoutes from './routes/shipments';
import portRoutes from './routes/ports';
import disruptionRoutes from './routes/disruptions';
import recommendationRoutes from './routes/recommendations';
import captainReportRoutes from './routes/captainReports';
import simulationRoutes from './routes/simulation';

const app: Express = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// ============================================
// BODY PARSING
// ============================================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ============================================
// API ROUTES
// ============================================
const apiRouter = express.Router();

// Auth
apiRouter.use('/auth', authRoutes);

// Resources
apiRouter.use('/shipments', shipmentRoutes);
apiRouter.use('/ports', portRoutes);
apiRouter.use('/disruptions', disruptionRoutes);
apiRouter.use('/recommendations', recommendationRoutes);
apiRouter.use('/captain-reports', captainReportRoutes);

// Simulation & real-time
apiRouter.use('/simulation', simulationRoutes);

// Mount all API routes under /api
app.use('/api', apiRouter);

// ============================================
// 404 HANDLER
// ============================================
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// ERROR HANDLER (Must be last)
// ============================================
app.use(errorHandler);

// ============================================
// WEBSOCKET SERVER
// ============================================
const server = http.createServer(app);
const wss = initWebSocket(server);

// Log WebSocket connections
wss.on('connection', (ws) => {
  console.log(`[WebSocket] New connection. Total clients: ${wss.clients.size}`);
  
  ws.on('close', () => {
    console.log(`[WebSocket] Client disconnected. Total clients: ${wss.clients.size}`);
  });
});

// ============================================
// SERVER STARTUP
// ============================================
const PORT = env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log('🚀 VOYAGERS TRIBUTE - Maritime Intelligence Platform');
  console.log(`${'='.repeat(60)}`);
  console.log(`
📡 Server Configuration:
   - Environment: ${env.NODE_ENV}
   - HTTP Port: ${PORT}
   - WebSocket: ws://localhost:${PORT}
   - Frontend URL: ${env.FRONTEND_URL}
   - Database: ${env.DATABASE_URL.split('@')[1] || 'configured'}
  `);
  console.log(`✅ Server listening on http://localhost:${PORT}`);
  console.log(`🔗 WebSocket available at ws://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`${'='.repeat(60)}\n`);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM signal received: closing HTTP server');
  
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('❌ Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT signal received: closing HTTP server');
  
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('❌ Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
});

// ============================================
// UNHANDLED ERROR HANDLERS
// ============================================
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
