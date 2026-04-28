import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { initWebSocket } from './websocket/wsHandler';

import authRoutes from './routes/auth';
import shipmentRoutes from './routes/shipments';
import portRoutes from './routes/ports';
import disruptionRoutes from './routes/disruptions';
import recommendationRoutes from './routes/recommendations';
import captainReportRoutes from './routes/captainReports';
import simulationRoutes from './routes/simulation';

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/ports', portRoutes);
app.use('/api/disruptions', disruptionRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/captain-reports', captainReportRoutes);
app.use('/api/simulation', simulationRoutes);

app.use(errorHandler);

const server = http.createServer(app);
initWebSocket(server);

server.listen(env.PORT, () => {
  console.log(`🚢 Voyager Backend running on port ${env.PORT}`);
  console.log(`🌐 Environment: ${env.NODE_ENV}`);
  console.log(`🔌 WebSocket server ready`);
});

export default app;
