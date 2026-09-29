/**
 * Mobile Bottom Navigation
 * Tuân thủ quy định chiều cao <= 15% mobile viewport
 * 4 Tab: Trang chủ | Khám phá | Đã lưu | Cá nhân
 * Vạn Cổ Luân Hồi
 */

import React from 'react';
import { Home, Compass, Bookmark, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface MobileNavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
}

export const MobileNavbar: React.FC<MobileNavbarProps> = ({ currentView, onNavigate }) => {
  const { user, openAuthModal } = useAuth();

  const handleProfileClick = () => {
    if (user) {
      onNavigate('profile');
    } else {
      openAuthModal();
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#07090D]/95 backdrop-blur-lg border-t border-stone-200 dark:border-white/[0.08] px-2 py-1 flex items-center justify-around h-14 transition-colors">
      <button
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center justify-center w-16 py-1 cursor-pointer transition-colors ${
          currentView === 'home' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200'
        }`}
      >
        <Home className="w-4 h-4" />
        <span className="text-[10px] mt-1 tracking-tight">Trang Chủ</span>
      </button>

      <button
        onClick={() => onNavigate('explore')}
        className={`flex flex-col items-center justify-center w-16 py-1 cursor-pointer transition-colors ${
          currentView === 'explore' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Compass className="w-4 h-4" />
        <span className="text-[10px] mt-1 font-medium tracking-tight">Khám Phá</span>
      </button>

      <button
        onClick={() => onNavigate('bookmarks')}
        className={`flex flex-col items-center justify-center w-16 py-1 cursor-pointer transition-colors ${
          currentView === 'bookmarks' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Bookmark className="w-4 h-4" />
        <span className="text-[10px] mt-1 font-medium tracking-tight">Đã Lưu</span>
      </button>

      <button
        onClick={handleProfileClick}
        className={`flex flex-col items-center justify-center w-16 py-1 cursor-pointer transition-colors ${
          currentView === 'profile' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <User className="w-4 h-4" />
        <span className="text-[10px] mt-1 font-medium tracking-tight">
          {user ? 'Cá Nhân' : 'Tài Khoản'}
        </span>
      </button>
    </nav>
  );
};
