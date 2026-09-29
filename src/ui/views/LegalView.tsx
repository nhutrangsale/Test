/**
 * LegalView Component
 * Quy chuẩn thanh tịnh, tôn trọng tín ngưỡng, chính sách bảo mật, điều khoản và tiếp thị liên kết minh bạch
 * Vạn Cổ Luân Hồi
 */

import React, { useState } from 'react';
import { ShieldCheck, HeartHandshake, BookOpen, Lock, AlertTriangle, ArrowLeft, Tag, Heart } from 'lucide-react';

interface LegalViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ onNavigate }) => {
  const [activeSection, setActiveSection] = useState<'faith' | 'disclaimer' | 'terms' | 'privacy' | 'affiliate'>('faith');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-sans-ui">
      
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-white/[0.08] pb-4">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-2 cursor-pointer font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về trang chủ</span>
        </button>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-slate-100 flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <span>Quy Chuẩn Thanh Quy & Pháp Lý</span>
        </h1>
        <p className="text-xs text-stone-500 dark:text-slate-400 font-reading mt-1">
          Quy tắc ứng xử, tôn trọng tín ngưỡng, bảo mật quyền riêng tư và điều khoản nền tảng
        </p>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-stone-200 dark:border-white/[0.05]">
        {[
          { id: 'faith', label: 'Tôn Trọng Tín Ngưỡng', icon: HeartHandshake },
          { id: 'disclaimer', label: 'Tuyên Bố Triết Lý & Sáng Tác', icon: BookOpen },
          { id: 'terms', label: 'Điều Khoản Sử Dụng', icon: AlertTriangle },
          { id: 'privacy', label: 'Bảo Mật Quyền Riêng Tư', icon: Lock },
          { id: 'affiliate', label: 'Tiếp Thị & Gieo Duyên', icon: Tag },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                  : 'bg-white dark:bg-[#0E141D] text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200 border border-stone-200 dark:border-white/[0.04]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section 1: Tôn Trọng Tín Ngưỡng & Thanh Quy */}
      {activeSection === 'faith' && (
        <section className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0D1219] border border-stone-200 dark:border-white/[0.08] shadow-xs space-y-6 text-stone-700 dark:text-slate-300 font-reading text-xs sm:text-sm leading-relaxed">
          <div className="border-b border-stone-200 dark:border-white/[0.06] pb-3">
            <h2 className="font-display text-lg font-bold text-stone-900 dark:text-slate-100 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>1. Tôn Trọng Mọi Tôn Giáo, Tín Ngưỡng & Đức Tin</span>
            </h2>
          </div>

          <p>
            Vạn Cổ Luân Hồi được lập ra như một không gian tĩnh lặng dành cho những người tìm kiếm sự an nhiên, suy ngẫm nhân sinh và chiêm nghiệm đạo lý cổ phong. Nền tảng kiên quyết giữ vững nguyên tắc bình đẳng và hòa hợp tâm linh:
          </p>

          <ul className="space-y-3 list-disc pl-5">
            <li>
              <strong className="text-stone-900 dark:text-slate-100">Bình đẳng tín ngưỡng:</strong> Tôn trọng tuyệt đối mọi tôn giáo, tín ngưỡng, trường phái triết học và đức tin chân chính của tất cả mọi người.
            </li>
            <li>
              <strong className="text-stone-900 dark:text-slate-100">Nghiêm cấm công kích:</strong> Tuyệt đối không cho phép các hành vi phỉ báng, miệt thị, bài xích hoặc kích động xung đột tôn giáo, sắc tộc và niềm tin tâm linh dưới bất kỳ hình thức nào.
            </li>
            <li>
              <strong className="text-stone-900 dark:text-slate-100">Thanh quy ngôn từ:</strong> Không cho phép phát ngôn thù hận (hate speech), đe dọa, xúc phạm danh dự, quấy rối, rình rập, doxxing hoặc phát tán thông tin độc hại, trái pháp luật.
            </li>
            <li>
              <strong className="text-stone-900 dark:text-slate-100">Giữ gìn sự trang nghiêm:</strong> Mọi bình luận đàm đạo phải giữ phong thái nhã nhặn, hướng thiện và cầu thị, coi trọng sự thấu hiểu hơn là tranh cãi thắng thua.
            </li>
          </ul>
        </section>
      )}

      {/* Section 2: Tuyên Bố Triết Lý & Sáng Tác Hư Cấu */}
      {activeSection === 'disclaimer' && (
        <section className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0D1219] border border-stone-200 dark:border-white/[0.08] shadow-xs space-y-6 text-stone-700 dark:text-slate-300 font-reading text-xs sm:text-sm leading-relaxed">
          <div className="border-b border-stone-200 dark:border-white/[0.06] pb-3">
            <h2 className="font-display text-lg font-bold text-stone-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>2. Tuyên Bố Bản Chất Nội Dung & Phân Biệt Thực - Hư Cấu</span>
            </h2>
          </div>

          <p>
            Nhằm đảm bảo sự minh bạch và nhận thức đúng đắn của quý độc giả:
          </p>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-slate-950/70 border border-stone-200 dark:border-white/[0.06]">
              <h3 className="font-bold text-stone-900 dark:text-slate-200 mb-1 font-display">Nội Dung Chiêm Nghiệm & Văn Học Cổ Phong</h3>
              <p className="text-stone-600 dark:text-slate-400 text-xs">
                Các bài viết, khái niệm về "Luân Hồi", "Vận Mệnh", "Tu Tâm", hay sau này là "Giác Ngộ" và "Tu Tiên" mang tính chất triết học nhân sinh, ẩn dụ tu tâm hoặc phóng tác văn học hư cấu theo phong cách cổ phong.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 dark:bg-slate-950/70 border border-stone-200 dark:border-white/[0.06]">
              <h3 className="font-bold text-stone-900 dark:text-slate-200 mb-1 font-display">Không Phải Tư Vấn Chuyên Môn</h3>
              <p className="text-stone-600 dark:text-slate-400 text-xs">
                Nội dung trên nền tảng không đại diện cho các chỉ định y tế, tâm lý trị liệu lâm sàng, tư vấn tài chính hay luật pháp thực tế. Khi gặp các vấn đề sức khỏe hoặc pháp lý trong cuộc sống đời thực, quý độc giả luôn cần tìm đến các chuyên gia có chứng chỉ chuyên môn.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Section 3: Điều Khoản Sử Dụng */}
      {activeSection === 'terms' && (
        <section className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0D1219] border border-stone-200 dark:border-white/[0.08] shadow-xs space-y-6 text-stone-700 dark:text-slate-300 font-reading text-xs sm:text-sm leading-relaxed">
          <div className="border-b border-stone-200 dark:border-white/[0.06] pb-3">
            <h2 className="font-display text-lg font-bold text-stone-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>3. Điều Khoản Sử Dụng Dịch Vụ</span>
            </h2>
          </div>

          <p>
            Khi truy cập và sử dụng nền tảng Vạn Cổ Luân Hồi, bạn đồng ý tuân thủ các điều khoản sau:
          </p>

          <ul className="space-y-3 list-disc pl-5">
            <li>
              <strong>Đọc và chia sẻ:</strong> Bạn được tự do đọc, tra cứu và chia sẻ liên kết các bài viết với tinh thần lan tỏa điều thiện và tri thức bổ ích.
            </li>
            <li>
              <strong>Quyền hạn tài khoản:</strong> Bạn chịu trách nhiệm bảo mật thông tin đăng nhập cá nhân. Nền tảng có quyền tạm khóa hoặc chấm dứt vĩnh viễn quyền truy cập của bất kỳ tài khoản nào vi phạm thanh quy hoặc có hành vi gian lận, phá hoại.
            </li>
            <li>
              <strong>Quy chuẩn đàm đạo:</strong> Chỉ được phép gửi bình luận dạng văn bản thuần túy. Mọi hành vi cố tình chèn mã độc, liên kết độc hại, quảng cáo cờ bạc hoặc công cụ spam đều bị xử lý ngay lập tức.
            </li>
          </ul>
        </section>
      )}

      {/* Section 4: Chính Sách Bảo Mật Dữ Liệu */}
      {activeSection === 'privacy' && (
        <section className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0D1219] border border-stone-200 dark:border-white/[0.08] shadow-xs space-y-6 text-stone-700 dark:text-slate-300 font-reading text-xs sm:text-sm leading-relaxed">
          <div className="border-b border-stone-200 dark:border-white/[0.06] pb-3">
            <h2 className="font-display text-lg font-bold text-stone-900 dark:text-slate-100 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>4. Chính Sách Bảo Mật Quyền Riêng Tư (Privacy Policy)</span>
            </h2>
          </div>

          <p>
            Chúng tôi cam kết tôn trọng và bảo vệ tuyệt đối sự riêng tư của người dùng:
          </p>

          <ul className="space-y-3 list-disc pl-5">
            <li>
              <strong>Bảo mật mật khẩu:</strong> Mọi mật khẩu tài khoản đều được mã hóa một chiều qua thuật toán bcrypt với salt bảo mật cao. Nền tảng tuyệt đối không lưu trữ mật khẩu dưới dạng văn bản thô.
            </li>
            <li>
              <strong>Xác thực liên kết an toàn:</strong> Khi bạn đăng nhập qua Google hoặc TikTok Login Kit v2, chúng tôi chỉ tiếp nhận các định danh công khai cơ bản (Open ID, Tên hiển thị, Ảnh đại diện) phục vụ việc định danh tài khoản, không can thiệp vào dữ liệu cá nhân ngoài phạm vi.
            </li>
            <li>
              <strong>Không kinh doanh dữ liệu:</strong> Vạn Cổ Luân Hồi không bao giờ bán, cho thuê hay thương mại hóa thông tin cá nhân của bạn cho bên thứ ba.
            </li>
          </ul>
        </section>
      )}

      {/* Section 5: Minh Bạch Tiếp Thị & Gieo Duyên */}
      {activeSection === 'affiliate' && (
        <section className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0D1219] border border-stone-200 dark:border-white/[0.08] shadow-xs space-y-6 text-stone-700 dark:text-slate-300 font-reading text-xs sm:text-sm leading-relaxed">
          <div className="border-b border-stone-200 dark:border-white/[0.06] pb-3">
            <h2 className="font-display text-lg font-bold text-stone-900 dark:text-slate-100 flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>5. Minh Bạch Tiếp Thị Liên Kết & Quỹ Gieo Duyên Đồng Hành</span>
            </h2>
          </div>

          <p>
            Để duy trì máy chủ tốc độ cao, giữ nền tảng hoạt động ổn định và hỗ trợ đội ngũ biên dịch thư tịch cổ phong:
          </p>

          <ul className="space-y-3 list-disc pl-5">
            <li>
              <strong className="text-stone-900 dark:text-slate-100">Tiếp thị liên kết (Affiliate):</strong> Một số đường dẫn giới thiệu sách, trà cụ, trầm hương liên kết tới các nền tảng thương mại điện tử (Shopee, Tiki, Lazada...). Khi bạn đặt mua qua liên kết này, nền tảng nhận được một phần hoa hồng nhỏ mà bạn không phải chịu thêm bất kỳ chi phí nào.
            </li>
            <li>
              <strong className="text-stone-900 dark:text-slate-100">Cam kết chất lượng:</strong> Ban biên tập chỉ giới thiệu những đầu sách và sản phẩm có phẩm chất tốt, phù hợp với phong thái chiêm nghiệm, tuyệt đối không chèn quảng cáo cờ bạc, lừa đảo hay nội dung rác.
            </li>
            <li>
              <strong className="text-stone-900 dark:text-slate-100">Quỹ Gieo Duyên tự nguyện:</strong> Mọi khoản trợ duyên từ quý độc giả qua quét mã VietQR ngân hàng hay MoMo đều được tiếp nhận với lòng tri ân sâu sắc và sử dụng 100% cho mục đích duy trì nền tảng.
            </li>
          </ul>
        </section>
      )}

    </div>
  );
};
