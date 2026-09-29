/**
 * AuthModal Component
 * Hỗ trợ Đăng nhập / Đăng ký nội bộ, Google OAuth và TikTok Login Kit v2 popup
 * Vạn Cổ Luân Hồi
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { X, Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register, loginWithGoogle, startTikTokOAuth } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await login(email, password);
        if (!res.success) setError(res.error || 'Đăng nhập không thành công.');
      } else {
        const res = await register(email, password, displayName);
        if (!res.success) setError(res.error || 'Đăng ký không thành công.');
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleDemo = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle('google_token_sample', {
        email: 'daohu.google@vancoluanhoi.vn',
        name: 'Tu Tâm Đạo Giả (Google)',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTikTokClick = async () => {
    setError(null);
    await startTikTokOAuth();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0D1219] border border-white/[0.1] rounded-xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Nút đóng */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tiêu đề & Cổ phong Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-emerald-500/40 bg-emerald-950/20 mb-3">
            <span className="font-cinzel text-emerald-400 font-bold">道</span>
          </div>
          <h2 className="font-cinzel text-xl font-semibold text-slate-100 tracking-wide">
            {tab === 'login' ? 'Nhập Môn Tọa Thiền' : 'Khai Mở Chân Tâm'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-lora">
            {tab === 'login'
              ? 'Đăng nhập để đàm đạo, lưu trữ và tương tác triết lý'
              : 'Gia nhập Vạn Cổ Luân Hồi để đồng hành trên nẻo đạo'}
          </p>
        </div>

        {/* Đăng nhập nhanh mạng xã hội (Google & TikTok) */}
        <div className="space-y-2.5 mb-6">
          {/* TikTok Login Button */}
          <button
            type="button"
            onClick={handleTikTokClick}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-black hover:bg-slate-950 text-white text-xs font-semibold rounded-lg border border-white/[0.15] hover:border-emerald-500/50 transition-all cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.32a6.34 6.34 0 0 0-.85-.06A6.34 6.34 0 0 0 3 15.6a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.08a8.3 8.3 0 0 0 4.91 1.61V7.24a4.84 4.84 0 0 1-1-.55z"/>
            </svg>
            <span>Tiếp tục với TikTok Login</span>
          </button>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleDemo}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-lg border border-white/[0.08] transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Tiếp tục với Google</span>
          </button>
        </div>

        {/* Hairline Divider */}
        <div className="relative flex py-2 items-center mb-5">
          <div className="flex-grow border-t border-white/[0.08]"></div>
          <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase tracking-widest font-sans">
            hoặc email
          </span>
          <div className="flex-grow border-t border-white/[0.08]"></div>
        </div>

        {/* Tab chuyển Đăng nhập / Đăng ký */}
        <div className="flex rounded-lg bg-slate-950 p-1 mb-5 border border-white/[0.05]">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              tab === 'login' ? 'bg-[#18212C] text-emerald-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              tab === 'register' ? 'bg-[#18212C] text-emerald-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form nội bộ */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Đạo hiệu / Tên hiển thị</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Vô Ưu Đạo Hữu"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/80 border border-white/[0.08] rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="email"
                required
                placeholder="daohu@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/80 border border-white/[0.08] rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="password"
                required
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/80 border border-white/[0.08] rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : tab === 'login' ? 'Vào Hệ Thống' : 'Tạo Tài Khoản'}
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        {/* Demo credentials note */}
        <div className="mt-4 pt-3 border-t border-white/[0.05] text-[11px] text-slate-500 text-center">
          Tài khoản Admin kiểm thử: <span className="text-emerald-400 font-mono">admin@vancoluanhoi.vn</span> | MK: <span className="text-emerald-400 font-mono">DaoTam2026@</span>
        </div>

      </div>
    </div>
  );
};
