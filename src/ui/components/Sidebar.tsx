/**
 * Sidebar Component
 * - Desktop: Có thể thu gọn (Collapsible), cố định thanh bên trái
 * - Mobile: Dạng Drawer vuốt mở linh hoạt
 * - Thẩm mỹ Cổ Phong Hắc Sắc Ngọc Bích / Bạch Ngọc, không lạm dụng hiệu ứng
 * Vạn Cổ Luân Hồi
 */

import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { ThemeToggle } from './ThemeToggle.js';
import { 
  Home, Compass, Bookmark, ShieldAlert, ShieldCheck, 
  ChevronLeft, ChevronRight, X, Sparkles, Feather, Scale, Heart, Sun, RotateCw,
  HeartHandshake
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onNavigate: (view: string, params?: any) => void;
  onOpenDonationModal?: () => void;
  onOpenLifeExperiencePopup?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onNavigate,
  onOpenDonationModal,
  onOpenLifeExperiencePopup,
}) => {
  const { user } = useAuth();

  const handleNavClick = (view: string, params?: any) => {
    onNavigate(view, params);
    onCloseMobile();
  };

  const navItems = [
    { id: 'home', label: 'Trang Chủ', icon: Home, view: 'home' },
    { id: 'explore', label: 'Tàng Kinh Các', icon: Compass, view: 'explore' },
    { id: 'life-experience', label: 'Trải Nghiệm Nhân Sinh', icon: Sparkles, view: 'life-experience' },
    { id: 'bookmarks', label: 'Tủ Sách Đã Lưu', icon: Bookmark, view: 'bookmarks' },
    { id: 'legal', label: 'Quy Chuẩn & Pháp Lý', icon: ShieldCheck, view: 'legal' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Bàn Quản Trị', icon: ShieldAlert, view: 'admin' });
  }

  const categoryQuickLinks = [
    { slug: 'nhan-sinh', label: 'Nhân Sinh', icon: Feather },
    { slug: 'tinh-duyen', label: 'Tình Duyên', icon: Heart },
    { slug: 'van-menh', label: 'Vận Mệnh', icon: Compass },
    { slug: 'nhan-qua', label: 'Nhân Quả', icon: Scale },
    { slug: 'luan-hoi', label: 'Luân Hồi', icon: RotateCw },
    { slug: 'tam-dao', label: 'Tâm Đạo', icon: Sun },
  ];

  return (
    <>
      {/* ==============================================================
          MOBILE DRAWER OVERLAY
          ============================================================== */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* ==============================================================
          SIDEBAR CONTAINER (Desktop persistent + Mobile slide drawer)
          ============================================================== */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#FBF9F5] dark:bg-[#080B10] text-stone-800 dark:text-slate-100 border-r border-stone-200 dark:border-white/[0.07] flex flex-col justify-between transition-all duration-300 ease-in-out font-sans-ui ${
          // Desktop sizing
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          // Mobile drawer toggle
          isMobileOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header / Logo */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-stone-200 dark:border-white/[0.06]">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 text-left focus:outline-none cursor-pointer overflow-hidden"
            >
              <div className="w-8 h-8 rounded-full border border-emerald-500/40 flex items-center justify-center bg-emerald-500/10 dark:bg-emerald-950/40 flex-shrink-0">
                <span className="font-display text-xs text-emerald-600 dark:text-emerald-400 font-bold">萬</span>
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="truncate">
                  <span className="font-display text-sm font-bold tracking-wide text-stone-900 dark:text-slate-100 block">
                    Vạn Cổ Luân Hồi
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 font-reading block">
                    Triết Lý & Chiêm Nghiệm
                  </span>
                </div>
              )}
            </button>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-stone-500 hover:text-stone-900 dark:text-slate-400 dark:hover:text-white rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop collapse toggle button */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1 text-stone-400 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-md hover:bg-black/5 dark:hover:bg-slate-900 transition-colors cursor-pointer"
              title={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.view)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 font-semibold'
                      : 'text-stone-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-slate-100 hover:bg-stone-200/50 dark:hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400 dark:text-slate-400'}`} />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="truncate">{item.label}</span>
                  )}
                </button>
              );
            })}

            {/* Nút Gieo Duyên Trợ Lực Nền Tảng */}
            {onOpenDonationModal && (
              <button
                onClick={() => {
                  onOpenDonationModal();
                  onCloseMobile();
                }}
                title={isCollapsed ? 'Gieo Duyên' : undefined}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer text-left border border-emerald-500/20 mt-2"
              >
                <HeartHandshake className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="truncate">Ủng Hộ Nền Tảng</span>
                )}
              </button>
            )}
          </nav>

          {/* Quick Categories list (when expanded) */}
          {(!isCollapsed || isMobileOpen) && (
            <div className="px-4 pt-3 pb-2 border-t border-stone-200 dark:border-white/[0.05] mt-2">
              <span className="text-[11px] font-display uppercase tracking-wider text-stone-400 dark:text-slate-400 block mb-2 font-bold">
                Chuyên Mục Bát Nhã
              </span>
              <div className="space-y-0.5">
                {categoryQuickLinks.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => handleNavClick('explore', { category: cat.slug })}
                    className="w-full text-left py-1.5 px-2 text-xs text-stone-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-black/5 dark:hover:bg-slate-900/40 rounded transition-colors flex items-center gap-2 cursor-pointer font-reading"
                  >
                    <span className="w-1 h-1 rounded-full bg-stone-400 dark:bg-slate-600" />
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Box: Phase 2 Future modules readiness note & Theme selector */}
        <div className="p-3 border-t border-stone-200 dark:border-white/[0.06] space-y-2">
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex justify-between items-center mb-1">
              <ThemeToggle />
            </div>
          )}

          {(!isCollapsed || isMobileOpen) ? (
            <div className="p-3 rounded-xl bg-stone-100/70 dark:bg-[#0D121A] border border-stone-200 dark:border-white/[0.05] space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="font-display">Trải Nghiệm Nhân Sinh</span>
                </div>
                {onOpenLifeExperiencePopup && (
                  <button
                    onClick={() => {
                      onOpenLifeExperiencePopup();
                      onCloseMobile();
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 transition-colors cursor-pointer font-medium"
                  >
                    Cửa sổ nổi
                  </button>
                )}
              </div>
              <p className="text-[11px] text-stone-500 dark:text-slate-400 font-reading leading-relaxed">
                Trò chơi mô phỏng dòng đời vô thường, nghiệp duyên & luân hồi realtime.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ThemeToggle compact />
              <button
                onClick={onOpenLifeExperiencePopup}
                className="flex justify-center text-emerald-600 dark:text-emerald-400 p-1.5 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                title="Bật cửa sổ Trải Nghiệm Nhân Sinh"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </aside>
    </>
  );
};
