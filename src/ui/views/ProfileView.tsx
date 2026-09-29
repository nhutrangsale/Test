/**
 * ProfileView Component
 * Hồ sơ thành viên, tài khoản liên kết Google & TikTok, cài đặt và đăng xuất
 * Vạn Cổ Luân Hồi
 */

import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { User, Shield, LogOut, CheckCircle2, Bookmark, Compass, ShieldAlert } from 'lucide-react';

interface ProfileViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate }) => {
  const { user, logout, startTikTokOAuth } = useAuth();

  if (!user) {
    return null;
  }

  const isTikTokLinked = user.linked_providers?.includes('tiktok') || user.id.startsWith('usr_tt_');
  const isGoogleLinked = user.linked_providers?.includes('google') || user.id.startsWith('usr_g_');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Thẻ thông tin cá nhân */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0D1219] border border-white/[0.08] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          
          <div className="relative">
            <img
              src={user.avatar_url}
              alt={user.display_name}
              className="w-20 h-20 rounded-full border-2 border-emerald-500/40 p-1 bg-slate-950 object-cover"
              referrerPolicy="no-referrer"
            />
            {user.role === 'admin' && (
              <span className="absolute bottom-0 right-0 bg-amber-500 text-slate-950 p-1 rounded-full text-[10px]" title="Quản trị viên">
                <Shield className="w-3 h-3" />
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="font-cinzel text-xl font-semibold text-slate-100">
                {user.display_name}
              </h1>
              {user.role === 'admin' && (
                <span className="text-[10px] font-sans-ui px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Quản Trị Viên
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 font-lora">
              {user.email || 'Thành viên liên kết mạng xã hội'}
            </p>

            <div className="text-[11px] text-slate-500 font-sans-ui pt-1">
              Gia nhập ngày: {new Date(user.created_at).toLocaleDateString('vi-VN')}
            </div>
          </div>

        </div>
      </div>

      {/* Liên kết tài khoản mạng xã hội (TikTok, Google) */}
      <div className="p-6 rounded-2xl bg-[#0D1219] border border-white/[0.08] space-y-4">
        <h3 className="font-cinzel text-base font-semibold text-slate-200">
          Kênh Đăng Nhập & Liên Kết Mạng Xã Hội
        </h3>
        <p className="text-xs text-slate-400 font-lora">
          Quản lý các tài khoản bên ngoài đã liên kết với Vạn Cổ Luân Hồi
        </p>

        <div className="space-y-3 pt-2">
          {/* TikTok Provider Item */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-black border border-white/[0.1] flex items-center justify-center text-white">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.32a6.34 6.34 0 0 0-.85-.06A6.34 6.34 0 0 0 3 15.6a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.08a8.3 8.3 0 0 0 4.91 1.61V7.24a4.84 4.84 0 0 1-1-.55z"/>
                </svg>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">TikTok Login Kit v2</div>
                <div className="text-[11px] text-slate-500 font-sans-ui">
                  {isTikTokLinked ? 'Đã liên kết tài khoản TikTok' : 'Chưa liên kết'}
                </div>
              </div>
            </div>

            {isTikTokLinked ? (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã kết nối</span>
              </span>
            ) : (
              <button
                onClick={startTikTokOAuth}
                className="px-3 py-1.5 text-xs bg-black hover:bg-slate-900 text-white rounded-lg border border-white/[0.15] cursor-pointer transition-colors"
              >
                Kết nối TikTok
              </button>
            )}
          </div>

          {/* Google Provider Item */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/[0.1] flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Google Account</div>
                <div className="text-[11px] text-slate-500 font-sans-ui">
                  {isGoogleLinked ? 'Đã liên kết tài khoản Google' : 'Chưa liên kết'}
                </div>
              </div>
            </div>

            {isGoogleLinked ? (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã kết nối</span>
              </span>
            ) : (
              <span className="text-xs text-slate-500 font-sans-ui">Sẵn sàng</span>
            )}
          </div>
        </div>
      </div>

      {/* Lối tắt hành động */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate('bookmarks')}
          className="flex items-center gap-3 p-4 rounded-xl bg-[#0D1219] hover:bg-[#121924] border border-white/[0.06] hover:border-emerald-500/40 text-left transition-all cursor-pointer"
        >
          <div className="p-2.5 rounded-lg bg-emerald-950/30 text-emerald-400">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200">Tủ Sách Đã Lưu</div>
            <div className="text-[11px] text-slate-500">Xem lại các bài viết tâm đắc</div>
          </div>
        </button>

        {user.role === 'admin' ? (
          <button
            onClick={() => onNavigate('admin')}
            className="flex items-center gap-3 p-4 rounded-xl bg-[#0D1219] hover:bg-[#121924] border border-amber-900/30 hover:border-amber-500/50 text-left transition-all cursor-pointer"
          >
            <div className="p-2.5 rounded-lg bg-amber-950/30 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-200">Bàn Quản Trị Hệ Thống</div>
              <div className="text-[11px] text-slate-500">Quản lý bài viết, tố cáo & modules</div>
            </div>
          </button>
        ) : (
          <button
            onClick={() => onNavigate('explore')}
            className="flex items-center gap-3 p-4 rounded-xl bg-[#0D1219] hover:bg-[#121924] border border-white/[0.06] hover:border-emerald-500/40 text-left transition-all cursor-pointer"
          >
            <div className="p-2.5 rounded-lg bg-slate-900 text-slate-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">Tàng Kinh Các</div>
              <div className="text-[11px] text-slate-500">Khám phá các chuyên mục triết lý</div>
            </div>
          </button>
        )}
      </div>

      {/* Nút Đăng xuất */}
      <div className="pt-4 border-t border-white/[0.06] flex justify-end">
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-red-950/30 border border-white/[0.08] hover:border-red-800/40 text-slate-300 hover:text-red-400 text-xs font-medium transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Quy Ẩn Giang Hồ (Đăng Xuất)</span>
        </button>
      </div>

    </div>
  );
};
