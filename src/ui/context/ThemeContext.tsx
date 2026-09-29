/**
 * Theme Context & Automatic Vietnam Day/Night Scheduler
 * - Quản lý chế độ Sáng (Thanh Quang Bạch Ngọc) / Tối (Huyền Mặc Dạ Hành)
 * - Tự động điều chỉnh theo múi giờ Việt Nam (UTC+7):
 *   + Từ 6:00 sáng -> 18:00 tối: Chế độ Sáng (Bạch Ngọc / Tuyết Chỉ Cổ Phong)
 *   + Từ 18:00 tối -> 6:00 sáng: Chế độ Tối (Huyền Mặc Ngọc Bích)
 * - Cập nhật thời gian thực tế, tính toán canh giờ cổ phong (Tý, Sửu, Dần, Mão, Thìn, Tỵ, Ngọ, Mùi, Thân, Dậu, Tuất, Hợi)
 * - Cho phép người dùng chuyển đổi thủ công hoặc để Tự Động (Auto)
 * Vạn Cổ Luân Hồi
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemePreference = 'auto' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';
export type AccentColor = 'emerald' | 'amber' | 'crimson' | 'sapphire';

export interface VietnamTimeInfo {
  hour: number;
  minute: number;
  timeString: string;
  isDaytime: boolean;
  canhName: string;
  canhDesc: string;
}

interface ThemeContextType {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (pref: ThemePreference) => void;
  accentColor: AccentColor;
  setAccentColor: (accent: AccentColor) => void;
  toggleTheme: () => void;
  vnTime: VietnamTimeInfo;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Tính toán canh giờ cổ truyền theo giờ Việt Nam
 */
function getCanhGio(hour: number): { name: string; desc: string } {
  if (hour === 23 || hour === 0) return { name: 'Giờ Tý', desc: 'Canh Ba · Dạ tĩnh tâm trầm' };
  if (hour >= 1 && hour < 3) return { name: 'Giờ Sửu', desc: 'Canh Bốn · Gà gáy định tâm' };
  if (hour >= 3 && hour < 5) return { name: 'Giờ Dần', desc: 'Canh Năm · Bình minh chớm lộ' };
  if (hour >= 5 && hour < 7) return { name: 'Giờ Mão', desc: 'Mặt trời mọc · Đón khí thanh phong' };
  if (hour >= 7 && hour < 9) return { name: 'Giờ Thìn', desc: 'Ăn sáng định tĩnh · Rồng bay sương tan' };
  if (hour >= 9 && hour < 11) return { name: 'Giờ Tỵ', desc: 'Tâm ý thông tuệ · Tĩnh lặng làm việc' };
  if (hour >= 11 && hour < 13) return { name: 'Giờ Ngọ', desc: 'Chính ngọ nhật nguyệt · Dương khí cực thịnh' };
  if (hour >= 13 && hour < 15) return { name: 'Giờ Mùi', desc: 'Nghỉ ngơi an hòa · Thư thái tĩnh dưỡng' };
  if (hour >= 15 && hour < 17) return { name: 'Giờ Thân', desc: 'Thưởng trà ngẫm đạo · Trút bỏ muộn phiền' };
  if (hour >= 17 && hour < 19) return { name: 'Giờ Dậu', desc: 'Hoàng hôn buông tỏa · Đèn hoa chớm thắp' };
  if (hour >= 19 && hour < 21) return { name: 'Giờ Tuất', desc: 'Canh Một · Đêm về thanh vắng' };
  return { name: 'Giờ Hợi', desc: 'Canh Hai · Tọa thiền an giấc' };
}

/**
 * Tính toán giờ chuẩn xác tại Việt Nam (Asia/Ho_Chi_Minh, UTC+7)
 */
export function getVietnamTime(): VietnamTimeInfo {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '12', 10);
    const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);

    // QUY TẮC CỐT LÕI:
    // Từ 6h sáng -> 18h tối: SÁNG (Daytime / Light)
    // Từ 18h tối -> 6h sáng: TỐI (Nighttime / Dark)
    const isDaytime = hour >= 6 && hour < 18;
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const { name, desc } = getCanhGio(hour);

    return {
      hour,
      minute,
      timeString,
      isDaytime,
      canhName: name,
      canhDesc: desc,
    };
  } catch {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const vnTime = new Date(utc + 3600000 * 7);
    const hour = vnTime.getHours();
    const minute = vnTime.getMinutes();
    const isDaytime = hour >= 6 && hour < 18;
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const { name, desc } = getCanhGio(hour);

    return {
      hour,
      minute,
      timeString,
      isDaytime,
      canhName: name,
      canhDesc: desc,
    };
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    const saved = localStorage.getItem('vclh_theme_pref');
    if (saved === 'light' || saved === 'dark' || saved === 'auto') {
      return saved;
    }
    return 'auto'; // Mặc định tự động theo giờ Việt Nam
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const saved = localStorage.getItem('vclh_theme_accent');
    if (saved === 'emerald' || saved === 'amber' || saved === 'crimson' || saved === 'sapphire') {
      return saved;
    }
    return 'emerald';
  });

  const [vnTime, setVnTime] = useState<VietnamTimeInfo>(getVietnamTime());

  // Định kỳ cập nhật giờ Việt Nam mỗi 10 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setVnTime(getVietnamTime());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Tính toán theme thực tế áp dụng (resolvedTheme)
  const resolvedTheme: ResolvedTheme =
    preference === 'auto'
      ? vnTime.isDaytime
        ? 'light'
        : 'dark'
      : preference;

  // Đồng bộ class và data attributes vào <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    root.setAttribute('data-theme', resolvedTheme);
    root.setAttribute('data-accent', accentColor);
  }, [resolvedTheme, accentColor]);

  const setPreference = (pref: ThemePreference) => {
    setPreferenceState(pref);
    localStorage.setItem('vclh_theme_pref', pref);
  };

  const setAccentColor = (accent: AccentColor) => {
    setAccentColorState(accent);
    localStorage.setItem('vclh_theme_accent', accent);
  };

  const toggleTheme = () => {
    if (preference === 'auto') {
      // Đổi sang chế độ ngược lại
      setPreference(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else if (preference === 'dark') {
      setPreference('light');
    } else {
      setPreference('auto'); // Vòng lại auto
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        preference,
        resolvedTheme,
        setPreference,
        accentColor,
        setAccentColor,
        toggleTheme,
        vnTime,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
