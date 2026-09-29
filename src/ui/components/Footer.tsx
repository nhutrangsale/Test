/**
 * Footer Component
 * Phong cách Cổ Phong Hắc Sắc Ngọc Bích / Bạch Ngọc
 * Tích hợp Banner tiếp thị liên kết minh bạch & Quỹ gieo duyên phát triển
 * Vạn Cổ Luân Hồi
 */

import React from 'react';
import { AdCarouselBanner } from './AdCarouselBanner.js';
import { HeartHandshake, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenDonationModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenDonationModal }) => {
  return (
    <footer className="w-full bg-[#F4F1E8] dark:bg-[#06080B] border-t border-stone-200 dark:border-white/[0.06] pt-10 pb-24 md:pb-12 text-stone-600 dark:text-slate-400 text-xs font-sans-ui transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Banner Footer Cam Kết Minh Bạch / Quảng Cáo Trượt Ngang */}
        <AdCarouselBanner
          placement="footer"
          onNavigate={onNavigate}
          onOpenDonationModal={onOpenDonationModal}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Cột 1: Giới thiệu */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-bold text-stone-900 dark:text-slate-200">
                Vạn Cổ Luân Hồi
              </span>
            </div>
            <p className="text-stone-600 dark:text-slate-400 leading-relaxed font-reading text-xs max-w-md">
              Nơi lắng đọng những dòng suy ngẫm về kiếp nhân sinh, tình duyên, vận mệnh và nẻo về thanh tịnh giữa hồng trần vạn biến.
            </p>
            <div className="pt-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-reading italic">
              "Trà cạn duyên chưa cạn · Trăng tàn đạo chẳng tàn."
            </div>

            {/* Nút Gieo Duyên Trợ Lực Nền Tảng */}
            {onOpenDonationModal && (
              <div className="pt-2">
                <button
                  onClick={onOpenDonationModal}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors cursor-pointer"
                >
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>Ủng Hộ Nền Tảng (Gieo Duyên)</span>
                </button>
              </div>
            )}
          </div>

          {/* Cột 2: Chuyên mục Triết lý */}
          <div>
            <h4 className="text-stone-900 dark:text-slate-200 font-display text-xs font-bold uppercase tracking-wider mb-3">
              Chuyên Mục
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('explore', { category: 'nhan-sinh' })}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Nhân Sinh Chiêm Nghiệm
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('explore', { category: 'tinh-duyen' })}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Tình Duyên Hồng Trần
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('explore', { category: 'van-menh' })}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Vận Mệnh & Định Số
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('explore', { category: 'nhan-qua' })}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Nhân Quả Muôn Đời
                </button>
              </li>
            </ul>
          </div>

          {/* Cột 3: Tọa Thiền & Đạo Cảnh */}
          <div>
            <h4 className="text-stone-900 dark:text-slate-200 font-display text-xs font-bold uppercase tracking-wider mb-3">
              Đạo Cảnh & Pháp Lý
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('explore', { category: 'luan-hoi' })}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Luân Hồi Chuyển Kiếp
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('explore', { category: 'tam-dao' })}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Tâm Đạo Bất Biến
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('legal')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer font-medium"
                >
                  Quy Chuẩn & Tôn Trọng Tín Ngưỡng
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('legal')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Chính Sách Tiếp Thị & Quyền Riêng Tư
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bản quyền & Cam kết */}
        <div className="pt-6 border-t border-stone-200 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500 dark:text-slate-500 font-reading">
          <div>
            © {new Date().getFullYear()} Vạn Cổ Luân Hồi. Mọi quyền bảo lưu.
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Nội dung chiêm nghiệm & tôn trọng mọi tôn giáo, tín ngưỡng</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
