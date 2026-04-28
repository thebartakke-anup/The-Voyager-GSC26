// backend/src/config/env.ts
// Environment configuration with validation

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GEMINI_API_KEY',
];

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar]
);

if (missingEnvVars.length > 0 && process.env.NODE_ENV === 'production') {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/voyagers_db',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key-change-in-production-min-32-chars',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  WS_URL: process.env.WS_URL || 'ws://localhost:3001',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '500', 10),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

if (process.env.NODE_ENV !== 'production') {
  console.log(`Running in ${env.NODE_ENV} mode`);
  console.log(`Database: ${env.DATABASE_URL.replace(/:[^:/@]+@/, ':***@')}`);
}