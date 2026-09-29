/**
 * Life Experience View (Trải Nghiệm Nhân Sinh)
 * Đổi mới từ module Tu Tiên sang Trải Nghiệm Nhân Sinh phong cách Cổ Phong Luân Hồi
 * Vạn Cổ Luân Hồi
 */

import React from 'react';
import { LifeExperienceGame } from '../components/LifeExperienceGame.js';
import { Sparkles, Compass, Feather, RotateCw, ExternalLink, HeartHandshake } from 'lucide-react';

interface LifeExperienceViewProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenDonationModal?: () => void;
  onOpenFloatingPopup?: () => void;
}

export const LifeExperienceView: React.FC<LifeExperienceViewProps> = ({
  onNavigate,
  onOpenDonationModal,
  onOpenFloatingPopup,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Hero Header */}
      <div className="relative p-6 sm:p-8 rounded-2xl bg-stone-900 text-white border border-emerald-500/30 overflow-hidden shadow-xl">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Trải Nghiệm Nhân Sinh · Luân Hồi Kỳ Cuộc
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white">
            Một Đời Trôi Qua Như Bóng Câu Qua Cửa Sổ
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 font-reading leading-relaxed">
            Dấn thân vào hành trình mô phỏng cuộc đời theo thời gian thực (Real-time Life Simulator). 
            Từ ấu thơ cắp sách, bôn ba lập nghiệp, đối mặt biến cố vô thường, hành thiện tích đức đến ngày quy nguyên Bát Nhã luân hồi.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {onOpenFloatingPopup && (
              <button
                onClick={onOpenFloatingPopup}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                Bật Cửa Sổ Nổi Tự Do Di Chuyển
              </button>
            )}
            {onOpenDonationModal && (
              <button
                onClick={onOpenDonationModal}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-medium transition-colors border border-white/10 cursor-pointer"
              >
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                Gieo Duyên Ủng Hộ Phát Triển
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Interactive Game Area */}
      <div className="py-2">
        <LifeExperienceGame isPopup={false} />
      </div>

      {/* Philosophy Footnotes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-stone-200 dark:border-white/[0.08]">
        <div className="p-4 rounded-xl bg-stone-100/70 dark:bg-[#0D121A] border border-stone-200 dark:border-white/[0.06] space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <Feather className="w-4 h-4" /> Nhân Quả Luân Hồi
          </div>
          <p className="text-[11px] text-stone-600 dark:text-slate-400 font-reading leading-relaxed">
            Mỗi lựa chọn hành thiện, đọc sách hay bôn ba đều tạo nên nghiệp duyên kiếp này và phước báo chuyển hóa sang kiếp sau.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-stone-100/70 dark:bg-[#0D121A] border border-stone-200 dark:border-white/[0.06] space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <RotateCw className="w-4 h-4" /> Thời Gian Tự Hành
          </div>
          <p className="text-[11px] text-stone-600 dark:text-slate-400 font-reading leading-relaxed">
            Bạn có thể bật chế độ Tự Hành để thời gian tự trôi theo nhịp điệu realtime, hoặc bấm thủ công từng năm để ngẫm sự đời.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-stone-100/70 dark:bg-[#0D121A] border border-stone-200 dark:border-white/[0.06] space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <Compass className="w-4 h-4" /> Cửa Sổ Nổi Tiện Ích
          </div>
          <p className="text-[11px] text-stone-600 dark:text-slate-400 font-reading leading-relaxed">
            Cửa sổ nổi cho phép kéo thả di chuyển tự do khắp màn hình, vừa đọc sách chiêm nghiệm vừa theo dõi dòng đời nhân sinh.
          </p>
        </div>
      </div>
    </div>
  );
};
