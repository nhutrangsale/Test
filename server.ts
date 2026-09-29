/**
 * Full-Stack Server Entry Point
 * Express + Modular API Architecture + Vite Middleware Integration
 * Vạn Cổ Luân Hồi
 */

import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { coreConfig } from './src/core/config/index.js';
import { coreLogger } from './src/core/logger/index.js';
import { coreDb } from './src/core/database/index.js';
import { coreModuleManager } from './src/core/module-loader.js';
import { CoreAuthService } from './src/core/auth/index.js';

// Import modules
import { philosophyModule } from './src/modules/philosophy/index.js';
import { communityModule } from './src/modules/community/index.js';
import { adminModule } from './src/modules/admin/index.js';
import { awakeningModule } from './src/modules/awakening/index.js';
import { cultivationModule } from './src/modules/cultivation/index.js';
import { simulationModule } from './src/modules/simulation/index.js';
import { advertisingModule } from './src/modules/advertising/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = coreConfig.port;

  // Đăng ký các module vào Core Module Manager
  coreModuleManager.register(philosophyModule);
  coreModuleManager.register(communityModule);
  coreModuleManager.register(adminModule);
  coreModuleManager.register(awakeningModule);
  coreModuleManager.register(cultivationModule);
  coreModuleManager.register(simulationModule);
  coreModuleManager.register(advertisingModule);

  // Khởi tạo các module đang bật
  await coreModuleManager.initializeAll();

  // Middleware cơ bản
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());

  // Security & Iframe Support Header
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Cho phép hiển thị an toàn trong AI Studio iFrame
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Logging Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/')) {
      coreLogger.info('HTTP', `${req.method} ${req.path}`);
    }
    next();
  });

  // ==========================================
  // CORE AUTHENTICATION API ROUTES
  // ==========================================
  const authRouter = express.Router();

  // Đăng ký
  authRouter.post('/register', async (req: Request, res: Response) => {
    try {
      const { email, password, displayName } = req.body;
      const result = await CoreAuthService.register(email, password, displayName);
      if (!result.success) {
        return res.status(400).json({ success: false, error: { message: result.error } });
      }

      // Set cookie bảo mật (hỗ trợ cross-origin iframe với SameSite=None; Secure)
      res.cookie('session_token', result.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 86400 * 1000,
      });

      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  });

  // Đăng nhập
  authRouter.post('/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await CoreAuthService.login(email, password);
      if (!result.success) {
        return res.status(400).json({ success: false, error: { message: result.error } });
      }

      res.cookie('session_token', result.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 86400 * 1000,
      });

      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  });

  // Đăng nhập Google OAuth
  authRouter.post('/google', async (req: Request, res: Response) => {
    try {
      const { googleToken, profile } = req.body;
      const result = await CoreAuthService.loginWithGoogle(googleToken, profile);

      res.cookie('session_token', result.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 86400 * 1000,
      });

      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  });

  // ==========================================
  // TIKTOK LOGIN KIT V2 OAUTH ROUTES
  // ==========================================

  // Lấy URL chuyển hướng TikTok OAuth
  authRouter.get('/oauth/tiktok/url', (req: Request, res: Response) => {
    const state = Math.random().toString(36).substring(2, 15);
    const redirectUri = `${req.protocol}://${req.get('host')}/api/v1/auth/oauth/tiktok/callback`;
    const { url, isConfigured } = CoreAuthService.getTikTokAuthUrl(state, redirectUri);
    res.json({ success: true, data: { url, isConfigured, state } });
  });

  // Màn hình Sandbox xác thực thử nghiệm TikTok (Khi chưa điền Developer App ID)
  authRouter.get('/oauth/tiktok/mock-authorize', (req: Request, res: Response) => {
    const state = req.query.state as string;
    const redirectUri = req.query.redirect_uri as string;

    const mockCallbackUrl = `${redirectUri}?code=mock_tiktok_code_${Date.now()}&state=${encodeURIComponent(state || '')}`;

    res.send(`
      <!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>TikTok Login Sandbox — Vạn Cổ Luân Hồi</title>
          <style>
            body {
              background: #0B0F15;
              color: #F1F5F9;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              box-sizing: border-box;
            }
            .card {
              background: #121820;
              border: 1px solid rgba(255,255,255,0.1);
              border-radius: 12px;
              padding: 32px;
              max-width: 440px;
              text-align: center;
              box-shadow: 0 20px 40px rgba(0,0,0,0.6);
            }
            .logo {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 56px;
              height: 56px;
              background: #000;
              border-radius: 50%;
              margin-bottom: 20px;
              border: 1px solid #10B981;
            }
            h2 { margin: 0 0 12px; font-size: 20px; color: #FFF; }
            p { font-size: 14px; color: #94A3B8; line-height: 1.6; margin-bottom: 24px; }
            .btn {
              display: inline-block;
              width: 100%;
              padding: 12px;
              background: #10B981;
              color: #07090D;
              font-weight: 600;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              text-decoration: none;
              font-size: 15px;
              box-sizing: border-box;
              transition: opacity 0.2s;
            }
            .btn:hover { opacity: 0.9; }
            .badge {
              display: inline-block;
              background: rgba(16, 185, 129, 0.15);
              color: #34D399;
              font-size: 11px;
              padding: 4px 10px;
              border-radius: 4px;
              margin-bottom: 16px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
              </svg>
            </div>
            <div class="badge">TikTok Login Kit v2 Sandbox</div>
            <h2>Ủy Quyền Đăng Nhập TikTok</h2>
            <p>Ứng dụng <strong>Vạn Cổ Luân Hồi</strong> yêu cầu truy cập thông tin cơ bản (Tên hiển thị, Ảnh đại diện) qua TikTok Login Kit.</p>
            <a href="${mockCallbackUrl}" class="btn">Đồng Ý & Tiếp Tục Vào Hệ Thống</a>
          </div>
        </body>
      </html>
    `);
  });

  // Callback tiếp nhận code từ TikTok OAuth
  app.get(['/api/v1/auth/oauth/tiktok/callback', '/api/v1/auth/oauth/tiktok/callback/'], async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const redirectUri = `${req.protocol}://${req.get('host')}/api/v1/auth/oauth/tiktok/callback`;

    const result = await CoreAuthService.handleTikTokCallback(code || 'mock_code', redirectUri);

    if (result.success && result.token) {
      res.cookie('session_token', result.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 86400 * 1000,
      });

      // Bắn tín hiệu OAUTH_AUTH_SUCCESS qua postMessage tới parent window và đóng popup
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>Xác Thực Thành Công</title>
          </head>
          <body style="background: #0B0F15; color: #10B981; font-family: sans-serif; text-align: center; padding: 40px;">
            <h3>Đã xác thực thành công qua TikTok!</h3>
            <p style="color: #94A3B8;">Cửa sổ này sẽ tự động đóng lại...</p>
            <script>
              try {
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'OAUTH_AUTH_SUCCESS',
                    provider: 'tiktok',
                    token: ${JSON.stringify(result.token)}
                  }, '*');
                  setTimeout(() => window.close(), 300);
                } else {
                  window.location.href = '/';
                }
              } catch (e) {
                window.location.href = '/';
              }
            </script>
          </body>
        </html>
      `);
    } else {
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head><meta charset="UTF-8" /><title>Lỗi Xác Thực</title></head>
          <body style="background: #0B0F15; color: #EF4444; font-family: sans-serif; text-align: center; padding: 40px;">
            <h3>Không thể hoàn tất đăng nhập TikTok</h3>
            <p style="color: #94A3B8;">${result.error || 'Vui lòng thử lại sau.'}</p>
            <button onclick="window.close()" style="margin-top: 16px; padding: 8px 16px;">Đóng</button>
          </body>
        </html>
      `);
    }
  });

  // Lấy thông tin user hiện tại
  authRouter.get('/me', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.cookies?.session_token as string);

    if (!token) {
      return res.json({ success: true, data: { user: null } });
    }

    const user = CoreAuthService.validateSession(token);
    if (!user) {
      return res.json({ success: true, data: { user: null } });
    }

    // Lấy danh sách liên kết oauth
    const linkedProviders = coreDb.oauthAccounts
      .filter(o => o.user_id === user.id)
      .map(o => o.provider);

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          linked_providers: linkedProviders,
        }
      }
    });
  });

  // Đăng xuất
  authRouter.post('/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.cookies?.session_token as string);
    if (token) {
      CoreAuthService.logout(token);
    }
    res.clearCookie('session_token');
    res.json({ success: true, message: 'Đã quy ẩn giang hồ (Đăng xuất thành công).' });
  });

  // Mount Auth Router
  app.use('/api/v1/auth', authRouter);

  // Mount Philosophy Router
  app.use('/api/v1/philosophy', (req, res, next) => {
    if (!coreModuleManager.isEnabled('philosophy')) {
      return res.status(503).json({ success: false, error: { message: 'Module Triết Lý hiện đang tạm bảo trì.' } });
    }
    philosophyModule.router(req, res, next);
  });

  // Mount Community Router
  app.use('/api/v1/community', (req, res, next) => {
    if (!coreModuleManager.isEnabled('community')) {
      return res.status(503).json({ success: false, error: { message: 'Module Cộng Đồng hiện đang tạm bảo trì.' } });
    }
    communityModule.router(req, res, next);
  });

  // Mount Admin Router
  app.use('/api/v1/admin', (req, res, next) => {
    if (!coreModuleManager.isEnabled('admin')) {
      return res.status(503).json({ success: false, error: { message: 'Module Quản Trị đang tắt.' } });
    }
    adminModule.router(req, res, next);
  });

  // Mount Advertising & Affiliate Router
  app.use('/api/v1/advertising', (req, res, next) => {
    if (!coreModuleManager.isEnabled('advertising')) {
      return res.status(503).json({ success: false, error: { message: 'Module Quảng Cáo & Tiếp Thị đang tạm tắt.' } });
    }
    advertisingModule.router(req, res, next);
  });

  // Status endpoint
  app.get('/api/v1/system/status', (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        app: coreConfig.appName,
        time: new Date().toISOString(),
        modules: coreModuleManager.getAllModules(),
      }
    });
  });

  // ==========================================
  // SEO ENDPOINTS: ROBOTS.TXT & SITEMAP.XML
  // ==========================================
  app.get('/robots.txt', (req: Request, res: Response) => {
    res.type('text/plain');
    res.send(`User-agent: *\nAllow: /\nDisallow: /quan-tri\nDisallow: /api/v1/admin\n\nSitemap: ${coreConfig.appUrl}/sitemap.xml\n`);
  });

  app.get('/sitemap.xml', (req: Request, res: Response) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const publishedPosts = coreDb.posts.filter(p => p.status === 'published');
    const categories = coreDb.categories.filter(c => c.is_active === 1);

    const postUrls = publishedPosts.map(p => `
    <url>
      <loc>${baseUrl}/bai-viet/${p.slug}</loc>
      <lastmod>${new Date(p.published_at).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`).join('');

    const categoryUrls = categories.map(c => `
    <url>
      <loc>${baseUrl}/kham-pha?category=${c.slug}</loc>
      <changefreq>daily</changefreq>
      <priority>0.7</priority>
    </url>`).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/kham-pha</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/dieu-khoan</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>${categoryUrls}${postUrls}
</urlset>`;

    res.type('application/xml');
    res.send(sitemap);
  });


  // ==========================================
  // CLIENT SERVING & VITE DEV SERVER
  // ==========================================
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    coreLogger.info('SERVER', 'Vite dev middleware mounted');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    coreLogger.info('SERVER', `Server chạy vững chãi tại http://0.0.0.0:${PORT} (Môi trường: ${coreConfig.env})`);
  });
}

startServer().catch(err => {
  console.error('Fatal Server Boot Error:', err);
  process.exit(1);
});
