/**
 * HomeView Component
 * Trang chủ Vạn Cổ Luân Hồi:
 * 1. Hero / Câu triết lý nổi bật
 * 2. Chuyên mục Bát Nhã
 * 3. Banner quảng cáo trượt ngang (In-Content Carousel 3-5s)
 * 4. Bài viết mới nhất
 * 5. Tủ sách & Vật phẩm tiếp thị liên kết (Affiliate Showcase)
 * 6. Bài được quan tâm nhất
 * 7. Câu hỏi suy ngẫm trong ngày
 * 8. Khối đồng hành & gieo duyên phát triển
 * Vạn Cổ Luân Hồi
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { PostDetailDto, CategoryDto } from '../../modules/philosophy/models/index.js';
import { AdCarouselBanner } from '../components/AdCarouselBanner.js';
import { AffiliateShowcase } from '../components/AffiliateShowcase.js';
import { 
  Sparkles, Eye, Heart, ArrowRight, BookOpen, Send, 
  Compass, HeartHandshake, ShieldCheck 
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenDonationModal?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenDonationModal }) => {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [featuredPost, setFeaturedPost] = useState<PostDetailDto | null>(null);
  const [newPosts, setNewPosts] = useState<PostDetailDto[]>([]);
  const [popularPosts, setPopularPosts] = useState<PostDetailDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Câu hỏi suy ngẫm trong ngày
  const [reflectionInput, setReflectionInput] = useState('');
  const [hasReflected, setHasReflected] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, featRes, newRes, popRes] = await Promise.all([
          api.get<CategoryDto[]>('/api/v1/philosophy/categories'),
          api.get<{ leadPost: PostDetailDto | null; secondary: PostDetailDto[] }>('/api/v1/philosophy/posts/featured'),
          api.get<{ posts: PostDetailDto[] }>('/api/v1/philosophy/posts?sort=newest&limit=4'),
          api.get<{ posts: PostDetailDto[] }>('/api/v1/philosophy/posts?sort=popular&limit=4'),
        ]);

        if (catRes.success && catRes.data) setCategories(catRes.data);
        if (featRes.success && featRes.data?.leadPost) setFeaturedPost(featRes.data.leadPost);
        if (newRes.success && newRes.data?.posts) setNewPosts(newRes.data.posts);
        if (popRes.success && popRes.data?.posts) setPopularPosts(popRes.data.posts);
      } catch (err) {
        console.error('HomeView load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleReflectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionInput.trim()) return;
    setHasReflected(true);
  };

  return (
    <div className="space-y-14 sm:space-y-16 pb-12 animate-fade-in font-sans-ui">
      
      {/* ==============================================================
          1. HERO & CÂU TRIẾT LÝ NỔI BẬT (Thích ứng Sáng / Tối)
          ============================================================== */}
      <section className="relative overflow-hidden rounded-2xl border border-stone-200 dark:border-white/[0.08] bg-[#FAF8F3] dark:bg-[#0A0E14] shadow-sm">
        {/* Background Image Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_ancient_reincarnation_1790677370100.jpg"
            alt="Vạn Cổ Luân Hồi - Cảnh giới chiêm nghiệm"
            className="w-full h-full object-cover opacity-15 dark:opacity-25 filter blur-[0.5px]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F3] dark:from-[#07090D] via-[#FAF8F3]/80 dark:via-[#0B0F15]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 sm:py-18 text-center">
          
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold mb-4">
            <span>Chiêm Nghiệm Hôm Nay</span>
            <span aria-hidden="true">·</span>
            <span>Canh Giờ Tĩnh Lặng</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-wide text-stone-900 dark:text-slate-100 leading-tight mb-5 text-balance">
            “Gió lay ngọn trúc, gió đi trúc lại bình yên.”
          </h1>

          <p className="font-reading text-sm sm:text-base text-stone-700 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-7 italic">
            Vạn sự vô thường, mọi phiền não trên đời không do nghịch cảnh áp đặt, mà bởi tâm ta còn luyến tiếc chưa buông. Hãy lắng lòng để nhìn thấu nhân duyên.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {featuredPost && (
              <button
                onClick={() => onNavigate('post-detail', { slug: featuredPost.slug })}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm tracking-wide transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <span>Đọc bài luận: {featuredPost.title}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {onOpenDonationModal && (
              <button
                onClick={onOpenDonationModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-stone-300 dark:border-white/10 bg-white/80 dark:bg-white/5 hover:border-emerald-500/50 text-stone-700 dark:text-slate-200 font-medium text-xs sm:text-sm transition-all cursor-pointer"
              >
                <HeartHandshake className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Gieo Duyên Phát Tâm</span>
              </button>
            )}
          </div>

        </div>
      </section>

      {/* ==============================================================
          2. CHUYÊN MỤC BÁT NHÃ (7 Chuyên mục triết lý)
          ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between mb-6 pb-2 border-b border-stone-200 dark:border-white/[0.08]">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-stone-900 dark:text-slate-100">
              Chuyên Mục Triết Lý
            </h2>
            <p className="text-xs text-stone-500 dark:text-slate-400 font-reading mt-0.5">
              Bảy nẻo tư tưởng soi sáng vạn dặm hồng trần
            </p>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline transition-colors flex items-center gap-1 cursor-pointer font-semibold"
          >
            <span>Tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => onNavigate('explore', { category: cat.slug })}
              className="text-left p-4 rounded-xl bg-white dark:bg-[#0E141D] hover:bg-stone-50 dark:hover:bg-[#141C28] border border-stone-200 dark:border-white/[0.06] hover:border-emerald-500/40 shadow-xs transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">0{idx + 1}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/30 group-hover:bg-emerald-400 transition-colors" />
              </div>
              <h3 className="font-display text-base font-bold text-stone-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-stone-500 dark:text-slate-400 font-reading line-clamp-2 mt-1 leading-relaxed">
                {cat.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* ==============================================================
          3. BANNER QUẢNG CÁO TRƯỢT NGANG (In-Content Carousel 3-5s)
          ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdCarouselBanner
          placement="in_content"
          onNavigate={onNavigate}
          onOpenDonationModal={onOpenDonationModal}
        />
      </section>

      {/* ==============================================================
          4. BÀI VIẾT MỚI ĐĂNG
          ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between mb-6 pb-2 border-b border-stone-200 dark:border-white/[0.08]">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-stone-900 dark:text-slate-100">
              Bài Viết Mới Nhất
            </h2>
            <p className="text-xs text-stone-500 dark:text-slate-400 font-reading mt-0.5">
              Những dòng đàm đạo và giác ngộ vừa được chắp bút
            </p>
          </div>
          <button
            onClick={() => onNavigate('explore', { sort: 'newest' })}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline transition-colors flex items-center gap-1 cursor-pointer font-semibold"
          >
            <span>Xem thêm</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {newPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => onNavigate('post-detail', { slug: post.slug })}
              className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-white dark:bg-[#0D1219] hover:bg-stone-50 dark:hover:bg-[#121924] border border-stone-200 dark:border-white/[0.06] hover:border-emerald-500/40 shadow-xs transition-all cursor-pointer group"
            >
              {/* Image slot with safe fallback */}
              <div className="w-full sm:w-44 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-white/[0.05]">
                <img
                  src={post.cover_image || '/src/assets/images/hero_ancient_reincarnation_1790677370100.jpg'}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Text content */}
              <div className="flex flex-col justify-between flex-grow">
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-slate-400 mb-1.5 font-sans-ui">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{post.category_name}</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(post.published_at).toLocaleDateString('vi-VN')}</span>
                  </div>

                  <h3 className="font-display text-base font-bold text-stone-900 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-stone-600 dark:text-slate-400 font-reading line-clamp-2 mt-1.5 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-stone-400 dark:text-slate-500 mt-3 pt-2 border-t border-stone-100 dark:border-white/[0.04]">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{post.view_count}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" />
                    <span>{post.like_count}</span>
                  </span>
                  <span>·</span>
                  <span>{post.author_name}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ==============================================================
          5. AFFILIATE SHOWCASE (Tiếp thị liên kết: Sách, Trà đạo, Trầm hương)
          ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AffiliateShowcase
          limit={6}
          title="Tủ Sách Triết Lý & Trà Cụ Cổ Phong (Tiếp Thị Liên Kết)"
          showCategoryTabs={true}
        />
      </section>

      {/* ==============================================================
          6. BÀI ĐƯỢC QUAN TÂM NHẤT
          ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between mb-6 pb-2 border-b border-stone-200 dark:border-white/[0.08]">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-stone-900 dark:text-slate-100">
              Luận Bàn Tâm Điểm
            </h2>
            <p className="text-xs text-stone-500 dark:text-slate-400 font-reading mt-0.5">
              Những bài viết nhận được nhiều sự đồng điệu từ các đạo hữu
            </p>
          </div>
          <button
            onClick={() => onNavigate('explore', { sort: 'popular' })}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline transition-colors flex items-center gap-1 cursor-pointer font-semibold"
          >
            <span>Xem nhiều nhất</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularPosts.map((post, idx) => (
            <article
              key={post.id}
              onClick={() => onNavigate('post-detail', { slug: post.slug })}
              className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0D1219] hover:bg-stone-50 dark:hover:bg-[#121924] border border-stone-200 dark:border-white/[0.06] hover:border-emerald-500/40 shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <span className="font-display text-2xl font-bold text-stone-300 dark:text-slate-700 group-hover:text-emerald-500/60 transition-colors block mb-2">
                  0{idx + 1}
                </span>

                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                  {post.category_name}
                </div>

                <h3 className="font-display text-sm font-bold text-stone-900 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors line-clamp-3 leading-snug">
                  {post.title}
                </h3>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-400 dark:text-slate-500 mt-4 pt-3 border-t border-stone-100 dark:border-white/[0.04]">
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500/80" />
                  <span>{post.like_count} đồng cảm</span>
                </span>
                <span className="text-[11px]">{post.view_count} đọc</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ==============================================================
          7. CÂU HỎI SUY NGẪM TRONG NGÀY
          ============================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-stone-200 dark:border-emerald-900/30 bg-stone-100/80 dark:bg-[#0A0F15] p-6 sm:p-8 relative overflow-hidden shadow-xs">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />

          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold mb-3">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Vấn Đáp Nhân Sinh</span>
          </div>

          <h3 className="font-display text-lg sm:text-xl font-bold text-stone-900 dark:text-slate-100 mb-3">
            “Nếu ngày mai bắt đầu lại một kiếp sống mới, điều bạn muốn giữ lại trong tâm hồn là gì?”
          </h3>

          <p className="font-reading text-xs sm:text-sm text-stone-600 dark:text-slate-400 leading-relaxed mb-5">
            Mỗi ngày một câu hỏi để tự soi bóng mình nơi đáy giếng tâm can. Câu trả lời không dành cho bất kỳ ai khác, mà là một chiếc chìa khóa để khai mở sự an tịnh bên trong bạn.
          </p>

          {!hasReflected ? (
            <form onSubmit={handleReflectSubmit} className="space-y-3">
              <div className="relative">
                <textarea
                  rows={3}
                  value={reflectionInput}
                  onChange={(e) => setReflectionInput(e.target.value)}
                  placeholder="Ghi lại đôi dòng chiêm nghiệm của bạn..."
                  className="w-full p-3.5 text-xs bg-white dark:bg-slate-950 border border-stone-300 dark:border-white/[0.08] rounded-xl text-stone-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors font-reading resize-none shadow-xs"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!reflectionInput.trim()}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <span>Gửi Lòng Vào Gió</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-reading leading-relaxed animate-fade-in">
              <p className="font-semibold mb-1">Tâm niệm đã được lưu chuyển vào hư không:</p>
              <p className="italic text-stone-700 dark:text-slate-300">"{reflectionInput}"</p>
              <p className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400">
                Chúc đạo hữu một ngày tâm an tịnh, nhẹ bước qua những bộn bề nhân thế.
              </p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};
