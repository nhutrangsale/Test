/**
 * ThemeToggle Component
 * Nút chuyển đổi chế độ Sáng (Bạch Ngọc) / Tối (Huyền Mặc) / Tự Động theo múi giờ Việt Nam
 * Hiển thị thời gian thực Việt Nam (UTC+7) và quy tắc 6h-18h / 18h-6h
 * Vạn Cổ Luân Hồi
 */

import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext.js';
import { Sun, Moon, Clock, ChevronDown, Check } from 'lucide-react';

interface ThemeToggleProps {
  compact?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ compact = false }) => {
  const { preference, resolvedTheme, setPreference, toggleTheme, vnTime } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg text-stone-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer relative"
        title={`Chế độ: ${preference === 'auto' ? `Tự động (${vnTime.timeString} VN - ${vnTime.isDaytime ? 'Sáng' : 'Tối'})` : resolvedTheme === 'dark' ? 'Tối (Huyền Mặc)' : 'Sáng (Bạch Ngọc)'}`}
        aria-label="Đổi chế độ sáng tối"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-4 h-4 text-emerald-400" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
        {preference === 'auto' && (
          <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
        )}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-white/10 bg-white/70 dark:bg-white/5 text-xs text-stone-700 dark:text-slate-300 hover:border-emerald-500/50 transition-all cursor-pointer shadow-xs"
        aria-label="Cài đặt chế độ hiển thị sáng tối"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        )}
        
        <span className="font-sans-ui text-[11px] font-medium hidden sm:inline-block">
          {preference === 'auto' ? (
            <span className="flex items-center gap-1">
              <span>{vnTime.timeString} VN</span>
              <span className="text-[10px] text-stone-400 dark:text-slate-400">({vnTime.isDaytime ? 'Sáng' : 'Tối'})</span>
            </span>
          ) : preference === 'dark' ? (
            'Tối (Huyền Mặc)'
          ) : (
            'Sáng (Bạch Ngọc)'
          )}
        </span>

        <span className="font-sans-ui text-[11px] font-medium sm:hidden">
          {vnTime.timeString}
        </span>

        <ChevronDown className="w-3 h-3 text-stone-400 dark:text-slate-400 ml-0.5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl bg-white dark:bg-[#0D1219] border border-stone-200 dark:border-white/10 shadow-2xl p-2 text-xs space-y-1 font-sans-ui animate-fade-in">
            
            {/* Header thông tin thời gian thực Việt Nam */}
            <div className="px-3 py-2 bg-stone-50 dark:bg-slate-900/60 rounded-lg border border-stone-100 dark:border-white/[0.04] mb-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  Múi Giờ Việt Nam (UTC+7)
                </span>
                <span className="font-mono text-xs font-bold text-stone-900 dark:text-slate-100">
                  {vnTime.timeString}
                </span>
              </div>
              <div className="text-[11px] text-stone-600 dark:text-slate-300 font-medium mt-1">
                {vnTime.canhName} · <span className="text-stone-500 dark:text-slate-400">{vnTime.canhDesc}</span>
              </div>
              <div className="text-[10px] text-stone-500 dark:text-slate-400 mt-0.5">
                Chu kỳ: <strong className="text-stone-700 dark:text-slate-300">6h-18h (Sáng)</strong> · <strong className="text-stone-700 dark:text-slate-300">18h-6h (Tối)</strong>
              </div>
            </div>

            {/* Option 1: Tự động theo giờ Việt Nam */}
            <button
              onClick={() => { setPreference('auto'); setIsOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                preference === 'auto'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold'
                  : 'text-stone-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs">Tự Động Theo Giờ VN</div>
                  <div className="text-[10px] text-stone-500 dark:text-slate-400 font-normal">
                    Đang áp dụng: {vnTime.isDaytime ? '☀️ Sáng (Bạch Ngọc)' : '🌙 Tối (Huyền Mặc)'}
                  </div>
                </div>
              </div>
              {preference === 'auto' && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            </button>

            {/* Option 2: Sáng (Thanh Quang Bạch Ngọc) */}
            <button
              onClick={() => { setPreference('light'); setIsOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                preference === 'light'
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold'
                  : 'text-stone-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Sun className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs">Bạch Ngọc (Chế độ Sáng)</div>
                  <div className="text-[10px] text-stone-500 dark:text-slate-400 font-normal">
                    Giấy xuyến cổ phong, êm dịu ban ngày
                  </div>
                </div>
              </div>
              {preference === 'light' && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
            </button>

            {/* Option 3: Tối (Huyền Mặc Dạ Hành) */}
            <button
              onClick={() => { setPreference('dark'); setIsOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                preference === 'dark'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold'
                  : 'text-stone-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Moon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs">Huyền Mặc (Chế độ Tối)</div>
                  <div className="text-[10px] text-stone-500 dark:text-slate-400 font-normal">
                    Hắc sắc u huyền ngọc bích, tĩnh tâm đêm
                  </div>
                </div>
              </div>
              {preference === 'dark' && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            </button>

            {/* Chủ Động Chọn Tông Màu Cổ Phong */}
            <div className="pt-2 mt-1 border-t border-stone-100 dark:border-white/[0.06] px-1">
              <div className="text-[10px] font-semibold text-stone-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Tông Màu Điểm Nhấn</span>
                <span className="font-normal text-[9px] text-stone-400">Tùy biến cá nhân</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'emerald' as const, name: 'Ngọc Bích', bg: 'bg-emerald-500', ring: 'ring-emerald-500' },
                  { id: 'amber' as const, name: 'Hoàng Kim', bg: 'bg-amber-500', ring: 'ring-amber-500' },
                  { id: 'crimson' as const, name: 'Chu Sa', bg: 'bg-rose-600', ring: 'ring-rose-500' },
                  { id: 'sapphire' as const, name: 'Tử Vi Lam', bg: 'bg-blue-600', ring: 'ring-blue-500' },
                ].map((color) => {
                  const isCurrent = (useTheme().accentColor || 'emerald') === color.id;
                  return (
                    <button
                      key={color.id}
                      onClick={() => {
                        useTheme().setAccentColor(color.id);
                      }}
                      className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                        isCurrent
                          ? `border-stone-400 dark:border-white/30 bg-stone-100 dark:bg-white/10 ring-1 ${color.ring}`
                          : 'border-transparent hover:bg-stone-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full ${color.bg} shadow-xs inline-block`} />
                      <span className="text-[9px] font-medium text-stone-600 dark:text-slate-300 leading-tight">
                        {color.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};
