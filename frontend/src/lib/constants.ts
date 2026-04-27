export const COLORS = {
  bg: '#0a0e27',
  surface: '#1a1f3a',
  accentPrimary: '#00d4ff',
  accentSecondary: '#ff006e',
  success: '#00ff41',
  warning: '#ffd60a',
  danger: '#ff006e',
  textPrimary: '#e0e0ff',
  textSecondary: '#a0a0c0',
  border: '#2a3555',
} as const;

export const STATUS_COLORS: Record<string, string> = {
  PLANNED: '#a0a0c0',
  IN_TRANSIT: '#00d4ff',
  DELAYED: '#ffd60a',
  AT_PORT: '#00ff41',
  DELIVERED: '#00ff41',
  CANCELLED: '#ff006e',
};

export const SEVERITY_COLORS: Record<string, string> = {
  LOW: '#00ff41',
  MEDIUM: '#ffd60a',
  HIGH: '#ff7700',
  CRITICAL: '#ff006e',
};

export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    me: '/api/auth/me',
  },
  shipments: '/api/shipments',
  ports: '/api/ports',
  disruptions: '/api/disruptions',
  recommendations: '/api/recommendations',
  captainReports: '/api/captain-reports',
  simulation: '/api/simulation',
} as const;
