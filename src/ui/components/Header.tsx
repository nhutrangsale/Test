/**
 * Header Component
 * Header gọn, tinh tế, tích hợp:
 * - Hamburger drawer toggle (Mobile/Desktop)
 * - Logo / Brand mark
 * - Search trigger
 * - Notification Bell + Popover
 * - User Menu Dropdown (Profile, Bookmarks, Admin, Logout)
 * Vạn Cổ Luân Hồi
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { NotificationPopover } from './NotificationPopover.js';
import { ThemeToggle } from './ThemeToggle.js';
import { 
  Menu, Search, Bell, User, Bookmark, ShieldAlert, ShieldCheck, 
  LogOut, ChevronDown 
} from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenSearch: () => void;
  onToggleMobileDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenSearch,
  onToggleMobileDrawer,
}) => {
  const { user, openAuthModal, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full bg-[#FAF8F3]/90 dark:bg-[#07090D]/95 backdrop-blur-md border-b border-black/[0.06] dark:border-white/[0.07] h-16 transition-colors duration-200">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Drawer Trigger + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileDrawer}
            className="lg:hidden p-2 text-stone-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-black/5 dark:hover:bg-slate-900/60 rounded-lg transition-colors cursor-pointer"
            aria-label="Mở danh mục điều hướng"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full border border-emerald-500/40 flex items-center justify-center bg-emerald-500/10 dark:bg-emerald-950/30 group-hover:border-emerald-500 transition-colors">
              <span className="font-display text-xs text-emerald-600 dark:text-emerald-400 font-bold">萬</span>
            </div>
            <span className="font-display text-base sm:text-lg font-bold tracking-wide text-stone-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors whitespace-nowrap">
              Vạn Cổ Luân Hồi
            </span>
          </button>
        </div>

        {/* Center: Search trigger input */}
        <div className="flex-1 max-w-md mx-2 hidden sm:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-black/5 dark:bg-[#0E141D] hover:bg-black/10 dark:hover:bg-[#131B26] border border-black/10 dark:border-white/[0.08] hover:border-emerald-500/40 text-xs text-stone-600 dark:text-slate-400 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500" />
              <span className="font-reading">Tra cứu triết lý, nhân sinh, định số...</span>
            </span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono text-stone-500 bg-white/60 dark:bg-slate-900 border border-black/10 dark:border-white/[0.08] rounded">
              Tìm kiếm
            </kbd>
          </button>
        </div>

        {/* Right: Theme Toggle + Search mobile icon + Notification + User Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 relative">
          
          {/* Nút chuyển đổi Sáng / Tối theo giờ VN */}
          <ThemeToggle />

          {/* Mobile search button */}
          <button
            onClick={onOpenSearch}
            aria-label="Tìm kiếm bài viết"
            className="sm:hidden p-2 text-stone-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-black/5 dark:hover:bg-slate-900/60 rounded-lg transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notification Button & Popover */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotificationOpen(!isNotificationOpen);
                setIsUserMenuOpen(false);
              }}
              className="p-2 text-stone-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-black/5 dark:hover:bg-slate-900/60 rounded-lg transition-colors cursor-pointer relative"
              aria-label="Thông báo"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            <NotificationPopover
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
              onNavigate={onNavigate}
              onCountChange={(count) => setUnreadCount(count)}
            />
          </div>

          {/* User Menu Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsNotificationOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-slate-900 border border-stone-300 dark:border-white/[0.06] transition-colors cursor-pointer"
              >
                <img
                  src={user.avatar_url}
                  alt={user.display_name}
                  className="w-7 h-7 rounded-full object-cover border border-emerald-500/40"
                  referrerPolicy="no-referrer"
                />
                <ChevronDown className="w-3.5 h-3.5 text-stone-500 dark:text-slate-400 hidden sm:block mr-1" />
              </button>

              {isUserMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsUserMenuOpen(false)} 
                  />
                  <div className="absolute right-0 top-12 z-50 w-56 rounded-xl bg-white dark:bg-[#0D1219] border border-stone-200 dark:border-white/[0.08] shadow-2xl py-2 animate-fade-in text-xs font-sans-ui">
                    
                    {/* User summary */}
                    <div className="px-4 py-2 border-b border-stone-100 dark:border-white/[0.06] mb-1">
                      <div className="font-semibold text-stone-900 dark:text-slate-200 truncate">{user.display_name}</div>
                      <div className="text-[11px] text-stone-500 dark:text-slate-400 truncate font-mono">{user.email || 'Liên kết OAuth'}</div>
                      {user.role === 'admin' && (
                        <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
                          Quản Trị Viên
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-stone-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-stone-50 dark:hover:bg-slate-900 transition-colors text-left cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-stone-400 dark:text-slate-400" />
                      <span>Hồ Sơ Cá Nhân</span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('bookmarks');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-stone-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-stone-50 dark:hover:bg-slate-900 transition-colors text-left cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-stone-400 dark:text-slate-400" />
                      <span>Tủ Sách Đã Lưu</span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('legal');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-stone-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-stone-50 dark:hover:bg-slate-900 transition-colors text-left cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-stone-400 dark:text-slate-400" />
                      <span>Quy Chuẩn & Pháp Lý</span>
                    </button>

                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          onNavigate('admin');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors text-left cursor-pointer border-t border-stone-100 dark:border-white/[0.04] mt-1 pt-2"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Bàn Quản Trị</span>
                      </button>
                    )}

                    <div className="border-t border-stone-100 dark:border-white/[0.06] mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                        <span>Quy Ẩn (Đăng Xuất)</span>
                      </button>
                    </div>

                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-all shadow-sm shadow-emerald-500/10 cursor-pointer whitespace-nowrap"
            >
              Đăng Nhập
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
