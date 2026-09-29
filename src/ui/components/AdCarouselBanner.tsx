/**
 * AdCarouselBanner Component
 * Banner quảng cáo & tiếp thị dạng trượt ngang (Horizontal Sliding Carousel)
 * - Tự động trượt sau 3-5 giây (delay tùy biến theo cấu hình banner)
 * - 1 container banner có thể chứa nhiều quảng cáo bên trong
 * - Hỗ trợ các vị trí: Header, In-Content, Footer, Sidebar, Bottom Bar
 * - Tự động tạm dừng khi rê chuột hoặc chạm tay
 * - Nút điều hướng trước/sau, chấm chỉ số phân trang
 * - Nút đóng / thu gọn cho banner đáy (bottom_bar) hoặc header
 * - Thẩm mỹ Cổ Phong Hắc Sắc Ngọc Bích / Bạch Ngọc tinh tế, chuẩn xác
 * Vạn Cổ Luân Hồi
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, X, HeartHandshake, Sparkles, BookOpen } from 'lucide-react';

export interface AdBannerItem {
  id: string;
  title: string;
  subtitle?: string;
  placement: 'header' | 'in_content' | 'footer' | 'sidebar' | 'bottom_bar';
  group_id: string;
  image_url?: string;
  target_url: string;
  cta_text?: string;
  badge_text?: string;
  sponsor_name?: string;
  affiliate_tag?: string;
  is_affiliate: number;
  delay_seconds: number;
  is_active: number;
  views_count: number;
  clicks_count: number;
}

interface AdCarouselBannerProps {
  placement: 'header' | 'in_content' | 'footer' | 'sidebar' | 'bottom_bar';
  className?: string;
  onNavigate?: (view: string, params?: any) => void;
  onOpenDonationModal?: () => void;
  onOpenAuthModal?: () => void;
}

export const AdCarouselBanner: React.FC<AdCarouselBannerProps> = ({
  placement,
  className = '',
  onNavigate,
  onOpenDonationModal,
  onOpenAuthModal,
}) => {
  const [banners, setBanners] = useState<AdBannerItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef<any>(null);

  // Tải danh sách banner theo vị trí
  useEffect(() => {
    // Kiểm tra xem người dùng đã đóng banner này trong phiên chưa
    const dismissedKey = `vclh_ad_dismissed_${placement}`;
    if (sessionStorage.getItem(dismissedKey) === 'true') {
      setIsDismissed(true);
      setIsLoading(false);
      return;
    }

    const fetchBanners = async () => {
      try {
        const res = await fetch(`/api/v1/advertising/banners?placement=${placement}`);
        const data = await res.json();
        if (data.success && data.data?.banners) {
          setBanners(data.data.banners);
        }
      } catch (err) {
        console.warn('Could not load banners for placement:', placement, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, [placement]);

  // Bộ đếm thời gian tự động trượt ngang (delay từ 3s - 5s theo cấu hình của banner hiện tại)
  useEffect(() => {
    if (banners.length <= 1 || isPaused || isDismissed) return;

    const currentBanner = banners[currentIndex];
    const delayMs = (currentBanner?.delay_seconds || 4) * 1000;

    timerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [banners, currentIndex, isPaused, isDismissed]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    sessionStorage.setItem(`vclh_ad_dismissed_${placement}`, 'true');
  };

  const handleBannerClick = async (banner: AdBannerItem) => {
    // Ghi nhận lượt click
    try {
      fetch(`/api/v1/advertising/banners/${banner.id}/click`, { method: 'POST' });
    } catch {}

    // Điều hướng theo target_url
    if (banner.target_url === '#ung-ho') {
      if (onOpenDonationModal) {
        onOpenDonationModal();
      }
      return;
    }

    if (banner.target_url === '#auth-modal') {
      if (onOpenAuthModal) {
        onOpenAuthModal();
      }
      return;
    }

    if (banner.target_url.startsWith('/')) {
      if (onNavigate) {
        if (banner.target_url.startsWith('/bai-viet/')) {
          const slug = banner.target_url.replace('/bai-viet/', '');
          onNavigate('post-detail', { slug });
        } else if (banner.target_url.startsWith('/kham-pha')) {
          onNavigate('explore');
        } else if (banner.target_url === '/dieu-khoan') {
          onNavigate('legal');
        } else {
          onNavigate('home');
        }
      } else {
        window.location.href = banner.target_url;
      }
    } else {
      window.open(banner.target_url, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading || isDismissed || banners.length === 0) {
    return null;
  }

  const activeBanner = banners[currentIndex];

  // -------------------------------------------------------------
  // 1. GIAO DIỆN HEADER TOP ANNOUNCEMENT BANNER
  // -------------------------------------------------------------
  if (placement === 'header') {
    return (
      <aside
        aria-label="Thông báo và gợi ý từ ban biên tập"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className={`w-full bg-gradient-to-r from-emerald-950/20 via-emerald-900/15 to-emerald-950/20 dark:from-emerald-950/40 dark:via-slate-900/80 dark:to-emerald-950/40 border-b border-emerald-500/20 text-stone-800 dark:text-slate-200 text-xs py-2 px-3 relative overflow-hidden transition-all duration-300 ${className}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Badge & Prev Control */}
          <div className="flex items-center gap-2 shrink-0">
            {banners.length > 1 && (
              <button
                onClick={handlePrev}
                className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors text-stone-600 dark:text-slate-400 cursor-pointer"
                title="Quảng cáo trước"
                aria-label="Quảng cáo trước"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}

            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              {activeBanner.badge_text || (activeBanner.is_affiliate ? 'Tiếp Thị Liên Kết' : 'Tài Trợ')}
            </span>
          </div>

          {/* Slide Text Content */}
          <div 
            onClick={() => handleBannerClick(activeBanner)}
            className="flex-1 text-center cursor-pointer truncate hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <span className="font-semibold mr-1.5 font-display text-[11px] sm:text-xs text-stone-900 dark:text-slate-100">
              {activeBanner.title}
            </span>
            {activeBanner.subtitle && (
              <span className="hidden md:inline text-stone-600 dark:text-slate-400 text-[11px] font-reading">
                — {activeBanner.subtitle}
              </span>
            )}
          </div>

          {/* Right Action & Dismiss */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleBannerClick(activeBanner)}
              className="px-2.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{activeBanner.cta_text || 'Xem Ngay'}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>

            {banners.length > 1 && (
              <button
                onClick={handleNext}
                className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors text-stone-600 dark:text-slate-400 cursor-pointer"
                title="Quảng cáo tiếp theo"
                aria-label="Quảng cáo tiếp theo"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleDismiss}
              className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="Tạm ẩn thông báo"
              aria-label="Tạm ẩn thông báo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Indicators bar if multiple */}
        {banners.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 pb-0.5">
            {banners.map((_, i) => (
              <span
                key={i}
                className={`h-0.5 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'w-4 bg-emerald-500' : 'w-1 bg-black/10 dark:bg-white/10'
                }`}
              />
            ))}
          </div>
        )}
      </aside>
    );
  }

  // -------------------------------------------------------------
  // 2. GIAO DIỆN IN-CONTENT / GIỮA BÀI VIẾT HOẶC TRANG KHÁM PHÁ
  // -------------------------------------------------------------
  if (placement === 'in_content') {
    return (
      <aside
        aria-label="Gợi ý sách và vật phẩm triết học cổ phong"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className={`my-6 rounded-xl border border-stone-200 dark:border-white/10 bg-white/90 dark:bg-[#0E1520] p-4 sm:p-5 relative shadow-sm overflow-hidden group transition-all duration-300 ${className}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                {activeBanner.badge_text || 'Gợi Ý Đạo Hữu'}
              </span>
              {activeBanner.sponsor_name && (
                <span className="text-[11px] text-stone-500 dark:text-slate-400">
                  bởi {activeBanner.sponsor_name}
                </span>
              )}
            </div>

            <h3 
              onClick={() => handleBannerClick(activeBanner)}
              className="text-base sm:text-lg font-bold font-display text-stone-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              {activeBanner.title}
            </h3>

            {activeBanner.subtitle && (
              <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-400 font-reading mt-1 line-clamp-2">
                {activeBanner.subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0">
            <button
              onClick={() => handleBannerClick(activeBanner)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <span>{activeBanner.cta_text || 'Tìm Hiểu Thêm'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {banners.length > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrev}
                  className="p-1.5 rounded-lg border border-stone-200 dark:border-white/10 hover:bg-stone-100 dark:hover:bg-white/5 text-stone-600 dark:text-slate-400 cursor-pointer"
                  aria-label="Banner trước"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1.5 rounded-lg border border-stone-200 dark:border-white/10 hover:bg-stone-100 dark:hover:bg-white/5 text-stone-600 dark:text-slate-400 cursor-pointer"
                  aria-label="Banner tiếp theo"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Indicators */}
        {banners.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-3 pt-2 border-t border-stone-100 dark:border-white/[0.04]">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentIndex ? 'w-5 bg-emerald-500' : 'w-1.5 bg-stone-300 dark:bg-slate-700'
                }`}
                aria-label={`Chuyển tới slide quảng cáo ${i + 1}`}
              />
            ))}
          </div>
        )}
      </aside>
    );
  }

  // -------------------------------------------------------------
  // 3. GIAO DIỆN BOTTOM FLOATING BAR (Thanh nổi đáy trang)
  // -------------------------------------------------------------
  if (placement === 'bottom_bar') {
    return (
      <aside
        aria-label="Thanh thông điệp đồng hành nổi đáy trang"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="fixed bottom-16 lg:bottom-0 left-0 right-0 z-25 bg-[#FAF8F3]/95 dark:bg-[#0B0F15]/95 backdrop-blur-md border-t border-emerald-500/20 shadow-2xl py-2 px-3 sm:px-6 transition-all duration-300"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shrink-0">
              {activeBanner.badge_text || 'Đồng Đạo'}
            </span>

            <div 
              onClick={() => handleBannerClick(activeBanner)}
              className="cursor-pointer truncate hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <strong className="font-display text-stone-900 dark:text-slate-100 mr-1.5 font-bold">
                {activeBanner.title}
              </strong>
              {activeBanner.subtitle && (
                <span className="text-stone-600 dark:text-slate-400 font-reading hidden md:inline text-[11px]">
                  — {activeBanner.subtitle}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {banners.length > 1 && (
              <div className="flex items-center gap-0.5 hidden sm:flex">
                <button
                  onClick={handlePrev}
                  className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded text-stone-500 dark:text-slate-400 cursor-pointer"
                  aria-label="Trước"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono text-stone-400 px-1">
                  {currentIndex + 1}/{banners.length}
                </span>
                <button
                  onClick={handleNext}
                  className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded text-stone-500 dark:text-slate-400 cursor-pointer"
                  aria-label="Tiếp"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={() => handleBannerClick(activeBanner)}
              className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{activeBanner.cta_text || 'Xem'}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>

            <button
              onClick={handleDismiss}
              className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="Đóng thanh thông điệp"
              aria-label="Đóng thanh thông điệp"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </aside>
    );
  }

  // -------------------------------------------------------------
  // 4. GIAO DIỆN FOOTER BANNER
  // -------------------------------------------------------------
  return (
    <aside
      aria-label="Thông tin cam kết tiếp thị liên kết minh bạch"
      className={`rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50/70 dark:bg-white/[0.02] p-4 text-xs ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            {activeBanner.badge_text || 'Cam Kết VCLH'}
          </span>
          <span className="font-semibold text-stone-900 dark:text-slate-200 font-display">
            {activeBanner.title}
          </span>
        </div>

        <button
          onClick={() => handleBannerClick(activeBanner)}
          className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium text-[11px] flex items-center gap-1 cursor-pointer shrink-0"
        >
          <span>{activeBanner.cta_text || 'Chi Tiết'}</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {activeBanner.subtitle && (
        <p className="text-[11px] text-stone-600 dark:text-slate-400 font-reading mt-1.5">
          {activeBanner.subtitle}
        </p>
      )}
    </aside>
  );
};
