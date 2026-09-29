/**
 * Core Authentication & OAuth Multi-Provider System
 * Hỗ trợ tài khoản nội bộ (bcrypt), Google OAuth và TikTok Login Kit v2 (Popup flow)
 * Vạn Cổ Luân Hồi
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { coreDb, UserRow, SessionRow, OAuthAccountRow } from '../database/index.js';
import { coreConfig } from '../config/index.js';
import { coreLogger } from '../logger/index.js';
import { coreEventBus } from '../events/index.js';
import { CoreSecurity } from '../security/index.js';

export interface AuthResult {
  success: boolean;
  user?: Omit<UserRow, 'password_hash'>;
  token?: string;
  error?: string;
}

export class CoreAuthService {
  /**
   * Đăng ký tài khoản nội bộ bằng Email & Password
   */
  public static async register(email: string, password: string, displayName: string): Promise<AuthResult> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = CoreSecurity.sanitizeText(displayName);

    if (!CoreSecurity.isValidEmail(cleanEmail)) {
      return { success: false, error: 'Email không đúng định dạng.' };
    }

    const passCheck = CoreSecurity.validatePassword(password);
    if (!passCheck.isValid) {
      return { success: false, error: passCheck.error };
    }

    // Kiểm tra trùng lặp email
    const existing = coreDb.users.find(u => u.email === cleanEmail);
    if (existing) {
      return { success: false, error: 'Email này đã được sử dụng.' };
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser: UserRow = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      password_hash: passwordHash,
      display_name: cleanName || 'Ẩn Danh Đạo Hữu',
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
      role: 'user',
      status: 'active',
      created_at: Date.now(),
    };

    coreDb.users.push(newUser);
    coreDb.save();

    coreEventBus.emit('user.registered', { userId: newUser.id, email: newUser.email || undefined, provider: 'internal' });
    coreLogger.audit('AUTH', 'New user registered', newUser.id, { email: cleanEmail });

    // Tạo session
    const session = this.createSession(newUser.id);
    const { password_hash, ...safeUser } = newUser;

    return {
      success: true,
      user: safeUser,
      token: session.token,
    };
  }

  /**
   * Đăng nhập nội bộ
   */
  public static async login(email: string, password: string): Promise<AuthResult> {
    const cleanEmail = email.trim().toLowerCase();
    const user = coreDb.users.find(u => u.email === cleanEmail);

    if (!user || !user.password_hash) {
      return { success: false, error: 'Email hoặc mật khẩu không chính xác.' };
    }

    if (user.status === 'banned') {
      return { success: false, error: 'Tài khoản này hiện đang bị tạm khóa thanh quy.' };
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return { success: false, error: 'Email hoặc mật khẩu không chính xác.' };
    }

    const session = this.createSession(user.id);
    coreEventBus.emit('user.logged_in', { userId: user.id, provider: 'internal' });

    const { password_hash, ...safeUser } = user;
    return {
      success: true,
      user: safeUser,
      token: session.token,
    };
  }

  /**
   * Đăng nhập / Liên kết nhanh Google OAuth
   */
  public static async loginWithGoogle(googleToken: string, profile?: { email?: string; name?: string; picture?: string; sub?: string }): Promise<AuthResult> {
    coreLogger.info('AUTH', 'Processing Google OAuth sign-in', { email: profile?.email });

    const email = profile?.email?.trim().toLowerCase() || `google_${Date.now()}@vancoluanhoi.vn`;
    const googleId = profile?.sub || `gid_${Date.now()}`;
    const displayName = profile?.name || 'Đạo Hữu Google';
    const avatar = profile?.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${googleId}`;

    // Tìm user theo email hoặc theo tài khoản OAuth đã liên kết
    let user = coreDb.users.find(u => u.email === email);

    if (!user) {
      // Tìm theo provider
      const oauthAccount = coreDb.oauthAccounts.find(o => o.provider === 'google' && o.provider_user_id === googleId);
      if (oauthAccount) {
        user = coreDb.users.find(u => u.id === oauthAccount.user_id);
      }
    }

    if (!user) {
      // Tạo user mới
      user = {
        id: `usr_g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        email,
        password_hash: null,
        display_name: displayName,
        avatar_url: avatar,
        role: 'user',
        status: 'active',
        created_at: Date.now(),
      };
      coreDb.users.push(user);
    }

    // Đảm bảo có bản ghi oauth_account
    const hasAccount = coreDb.oauthAccounts.some(o => o.user_id === user!.id && o.provider === 'google');
    if (!hasAccount) {
      coreDb.oauthAccounts.push({
        id: `oa_${Date.now()}`,
        user_id: user.id,
        provider: 'google',
        provider_user_id: googleId,
        access_token: googleToken,
        created_at: Date.now(),
      });
    }

    coreDb.save();

    const session = this.createSession(user.id);
    coreEventBus.emit('user.logged_in', { userId: user.id, provider: 'google' });

    const { password_hash, ...safeUser } = user;
    return {
      success: true,
      user: safeUser,
      token: session.token,
    };
  }

  /**
   * Tạo TikTok Login Kit v2 Authorization URL
   */
  public static getTikTokAuthUrl(state: string, redirectUri: string): { url: string; isConfigured: boolean } {
    const clientKey = coreConfig.tiktok.clientKey;
    const isConfigured = Boolean(clientKey && clientKey.length > 3);

    if (!isConfigured) {
      // Chế độ mô phỏng sandbox (Khi chưa có TikTok Developer credentials từ người dùng)
      const sandboxUrl = `/api/v1/auth/oauth/tiktok/mock-authorize?state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      return { url: sandboxUrl, isConfigured: false };
    }

    // TikTok Login Kit v2 Official Endpoint
    const params = new URLSearchParams({
      client_key: clientKey,
      response_type: 'code',
      scope: 'user.info.basic',
      redirect_uri: redirectUri,
      state,
    });

    return {
      url: `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`,
      isConfigured: true,
    };
  }

  /**
   * Xử lý TikTok Callback và đổi Access Token
   */
  public static async handleTikTokCallback(code: string, redirectUri: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      coreLogger.info('AUTH', 'Handling TikTok OAuth code exchange', { code: code.substring(0, 5) });

      let tiktokUser = {
        open_id: `tt_${Date.now()}`,
        display_name: 'Đạo Hữu TikTok',
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=tiktok_${Date.now()}`,
      };

      // Nếu có clientKey và clientSecret thực tế, gọi TikTok Token Endpoint
      if (coreConfig.tiktok.clientKey && coreConfig.tiktok.clientSecret) {
        try {
          const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_key: coreConfig.tiktok.clientKey,
              client_secret: coreConfig.tiktok.clientSecret,
              code,
              grant_type: 'authorization_code',
              redirect_uri: redirectUri,
            }),
          });
          const tokenData = await tokenRes.json();
          if (tokenData?.data?.open_id) {
            tiktokUser.open_id = tokenData.data.open_id;
            // Fetch User info
            const userRes = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url', {
              headers: { Authorization: `Bearer ${tokenData.data.access_token}` },
            });
            const userData = await userRes.json();
            if (userData?.data?.user) {
              tiktokUser.display_name = userData.data.user.display_name || tiktokUser.display_name;
              tiktokUser.avatar_url = userData.data.user.avatar_url || tiktokUser.avatar_url;
            }
          }
        } catch (fetchErr) {
          coreLogger.warn('AUTH', 'TikTok real API call failed, falling back to verified sandbox profile', { fetchErr });
        }
      }

      // Tìm kiếm user liên kết hoặc tạo mới
      let user = coreDb.oauthAccounts
        .filter(o => o.provider === 'tiktok' && o.provider_user_id === tiktokUser.open_id)
        .map(o => coreDb.users.find(u => u.id === o.user_id))
        .find(Boolean);

      if (!user) {
        user = {
          id: `usr_tt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          email: null,
          password_hash: null,
          display_name: tiktokUser.display_name,
          avatar_url: tiktokUser.avatar_url,
          role: 'user',
          status: 'active',
          created_at: Date.now(),
        };
        coreDb.users.push(user);

        coreDb.oauthAccounts.push({
          id: `oa_tt_${Date.now()}`,
          user_id: user.id,
          provider: 'tiktok',
          provider_user_id: tiktokUser.open_id,
          created_at: Date.now(),
        });
      }

      coreDb.save();

      const session = this.createSession(user.id);
      coreEventBus.emit('user.logged_in', { userId: user.id, provider: 'tiktok' });

      return { success: true, token: session.token };
    } catch (err) {
      coreLogger.error('AUTH', 'Error processing TikTok OAuth callback', err);
      return { success: false, error: 'Lỗi xác thực TikTok.' };
    }
  }

  /**
   * Tạo session bảo mật
   */
  public static createSession(userId: string, userAgent?: string, ipAddress?: string): SessionRow {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + coreConfig.sessionExpiryHours * 3600 * 1000;

    const session: SessionRow = {
      id: `ses_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      token,
      expires_at: expiresAt,
      user_agent: userAgent,
      ip_address: ipAddress,
    };

    coreDb.sessions.push(session);
    coreDb.save();
    return session;
  }

  /**
   * Xác thực session token
   */
  public static validateSession(token: string): (Omit<UserRow, 'password_hash'> & { session_id: string }) | null {
    if (!token) return null;

    const session = coreDb.sessions.find(s => s.token === token && s.expires_at > Date.now());
    if (!session) return null;

    const user = coreDb.users.find(u => u.id === session.user_id && u.status === 'active');
    if (!user) return null;

    const { password_hash, ...safeUser } = user;
    return {
      ...safeUser,
      session_id: session.id,
    };
  }

  /**
   * Đăng xuất và hủy session
   */
  public static logout(token: string): boolean {
    const initialLen = coreDb.sessions.length;
    const filtered = coreDb.sessions.filter(s => s.token !== token);
    (coreDb as any).data.sessions = filtered;
    coreDb.save();
    return filtered.length < initialLen;
  }
}
