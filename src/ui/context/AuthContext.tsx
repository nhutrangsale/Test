/**
 * Authentication Context & Provider
 * Quản lý trạng thái đăng nhập, xác thực nội bộ, Google và TikTok Login Kit v2
 * Vạn Cổ Luân Hồi
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client.js';

export interface UserProfile {
  id: string;
  email: string | null;
  display_name: string;
  avatar_url: string;
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'banned';
  created_at: number;
  linked_providers?: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (token: string, profile?: any) => Promise<{ success: boolean; error?: string }>;
  startTikTokOAuth: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const refreshUser = async () => {
    try {
      const res = await api.get<{ user: UserProfile | null }>('/api/v1/auth/me');
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
        localStorage.removeItem('vclh_session_token');
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    // Lắng nghe sự kiện đăng nhập hoàn tất từ cửa sổ Popup OAuth (TikTok / Google)
    const handleAuthMessage = (event: MessageEvent) => {
      // Xác thực nguồn tin nhắn an toàn
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        if (event.data.token) {
          localStorage.setItem('vclh_session_token', event.data.token);
        }
        refreshUser();
        setIsAuthModalOpen(false);
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.post('/api/v1/auth/login', { email, password: pass });
    if (res.success && res.data?.token) {
      localStorage.setItem('vclh_session_token', res.data.token);
      setUser(res.data.user);
      setIsAuthModalOpen(false);
      return { success: true };
    }
    return { success: false, error: res.error?.message || 'Đăng nhập không thành công.' };
  };

  const register = async (email: string, pass: string, name: string) => {
    const res = await api.post('/api/v1/auth/register', { email, password: pass, displayName: name });
    if (res.success && res.data?.token) {
      localStorage.setItem('vclh_session_token', res.data.token);
      setUser(res.data.user);
      setIsAuthModalOpen(false);
      return { success: true };
    }
    return { success: false, error: res.error?.message || 'Đăng ký không thành công.' };
  };

  const loginWithGoogle = async (token: string, profile?: any) => {
    const res = await api.post('/api/v1/auth/google', { googleToken: token, profile });
    if (res.success && res.data?.token) {
      localStorage.setItem('vclh_session_token', res.data.token);
      setUser(res.data.user);
      setIsAuthModalOpen(false);
      return { success: true };
    }
    return { success: false, error: res.error?.message || 'Lỗi đăng nhập Google.' };
  };

  const startTikTokOAuth = async () => {
    try {
      const res = await api.get<{ url: string; isConfigured: boolean }>('/api/v1/auth/oauth/tiktok/url');
      if (res.success && res.data?.url) {
        // Mở popup trực tiếp tới URL authorization của OAuth provider
        const width = 540;
        const height = 680;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
          res.data.url,
          'tiktok_oauth_window',
          `width=${width},height=${height},top=${top},left=${left},status=no,toolbar=no,menubar=no`
        );

        if (!popup) {
          alert('Trình duyệt đã chặn popup. Vui lòng cho phép mở popup để hoàn tất đăng nhập TikTok.');
        }
      } else {
        alert('Không thể tạo liên kết đăng nhập TikTok lúc này.');
      }
    } catch (err: any) {
      console.error('TikTok Auth Error:', err);
    }
  };

  const logout = async () => {
    await api.post('/api/v1/auth/logout');
    localStorage.removeItem('vclh_session_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        register,
        loginWithGoogle,
        startTikTokOAuth,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
