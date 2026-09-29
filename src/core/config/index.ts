/**
 * Core Configuration Manager
 * Vạn Cổ Luân Hồi
 */

export interface SystemConfig {
  env: string;
  port: number;
  appName: string;
  appUrl: string;
  jwtSecret: string;
  sessionExpiryHours: number;
  tiktok: {
    clientKey: string;
    clientSecret: string;
    redirectUri: string;
  };
  google: {
    clientId: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

export const coreConfig: SystemConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  appName: 'Vạn Cổ Luân Hồi',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'van-co-luan-hoi-tam-dao-secret-key-2026',
  sessionExpiryHours: 24 * 7, // 7 days
  tiktok: {
    clientKey: process.env.TIKTOK_CLIENT_KEY || '',
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || '',
    redirectUri: `${process.env.APP_URL || 'http://localhost:3000'}/api/v1/auth/oauth/tiktok/callback`,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
  },
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  }
};
