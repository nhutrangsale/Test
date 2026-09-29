/**
 * ExploreView Component
 * Khám phá bài viết triết lý theo chuyên mục, từ khóa và tiêu chí sắp xếp
 * Vạn Cổ Luân Hồi
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { PostDetailDto, CategoryDto } from '../../modules/philosophy/models/index.js';
import { AdCarouselBanner } from '../components/AdCarouselBanner.js';
import { Search, Heart, Eye, Filter, ArrowRight } from 'lucide-react';

interface ExploreViewProps {
  initialCategory?: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenDonationModal?: () => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ 
  initialCategory, 
  onNavigate,
  onOpenDonationModal 
}) => {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'views'>('newest');
  const [posts, setPosts] = useState<PostDetailDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Lấy categories
  useEffect(() => {
    api.get<CategoryDto[]>('/api/v1/philosophy/categories').then(res => {
      if (res.success && res.data) setCategories(res.data);
    });
  }, []);

  // Fetch posts theo filter
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const catParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : '';
        const searchParam = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : '';
        const sortParam = `&sort=${sortBy}`;

        const res = await api.get<{ posts: PostDetailDto[] }>(
          `/api/v1/philosophy/posts?limit=20${catParam}${searchParam}${sortParam}`
        );

        if (res.success && res.data?.posts) {
          setPosts(res.data.posts);
        }
      } catch (err) {
        console.error('Explore fetch posts error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in font-sans-ui">
      
      {/* Tiêu đề & Giới thiệu */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-slate-100">
          Tàng Kinh Các
        </h1>
        <p className="text-xs text-stone-500 dark:text-slate-400 font-reading mt-1 max-w-xl">
          Tra cứu và chọn lọc những áng văn triết học nhân sinh, quy luật vận mệnh và nẻo về đạo tâm.
        </p>
      </div>

      {/* Thanh tìm kiếm & bộ lọc */}
      <div className="space-y-4">
        {/* Input Tìm kiếm */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề, nhân duyên, số kiếp, tĩnh lặng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-[#0D1219] border border-stone-200 dark:border-white/[0.08] rounded-xl text-stone-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors font-reading shadow-xs"
          />
        </div>

        {/* Thanh chuyển Chuyên mục (Segmented Tabs) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-[#0E141D] text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200 border border-stone-200 dark:border-white/[0.04]'
            }`}
          >
            Tất Cả
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.slug)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === c.slug
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'bg-white dark:bg-[#0E141D] text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200 border border-stone-200 dark:border-white/[0.04]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Tiêu chí sắp xếp */}
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-slate-400 pt-1 border-t border-stone-200 dark:border-white/[0.04]">
          <span>Tìm thấy <strong className="text-stone-900 dark:text-slate-200 font-mono font-bold">{posts.length}</strong> bài viết</span>
          
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-500">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white dark:bg-[#0E141D] border border-stone-200 dark:border-white/[0.08] rounded px-2.5 py-1 text-stone-800 dark:text-slate-300 text-xs focus:outline-none cursor-pointer"
            >
              <option value="newest">Mới Nhất</option>
              <option value="popular">Được Quan Tâm</option>
              <option value="views">Lượt Xem Nhiều</option>
            </select>
          </div>
        </div>
      </div>

      {/* Banner Quảng Cáo & Tiếp Thị (In-Content Carousel 3-5s) */}
      <AdCarouselBanner
        placement="in_content"
        onNavigate={onNavigate}
        onOpenDonationModal={onOpenDonationModal}
      />

      {/* Danh sách bài viết */}
      {loading ? (
        <div className="py-16 text-center text-xs text-stone-500 dark:text-slate-500 font-reading">
          Đang lật mở thư tịch...
        </div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center rounded-xl bg-white dark:bg-[#0D1219] border border-stone-200 dark:border-white/[0.04] p-8 shadow-xs">
          <p className="text-sm text-stone-800 dark:text-slate-300 font-reading mb-1">Chưa tìm thấy bài viết phù hợp.</p>
          <p className="text-xs text-stone-500">Hãy thử tìm kiếm với từ khóa khác hoặc chuyển chuyên mục.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <article
              key={post.id}
              onClick={() => onNavigate('post-detail', { slug: post.slug })}
              className="flex flex-col justify-between p-5 rounded-xl bg-white dark:bg-[#0D1219] hover:bg-stone-50 dark:hover:bg-[#121924] border border-stone-200 dark:border-white/[0.06] hover:border-emerald-500/40 shadow-xs transition-all cursor-pointer group"
            >
              <div>
                <div className="w-full h-40 rounded-lg overflow-hidden mb-4 bg-stone-100 dark:bg-slate-950 border border-stone-200 dark:border-white/[0.05]">
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

                {/* Metadata */}
                <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-slate-400 mb-1.5 font-sans-ui">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{post.category_name}</span>
                  <span aria-hidden="true">·</span>
                  <span>{new Date(post.published_at).toLocaleDateString('vi-VN')}</span>
                </div>

                <h2 className="font-display text-base font-bold text-stone-900 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h2>

                <p className="text-xs text-stone-600 dark:text-slate-400 font-reading line-clamp-2 mt-2 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-400 dark:text-slate-500 mt-5 pt-3 border-t border-stone-100 dark:border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" />
                    <span>{post.like_count}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{post.view_count}</span>
                  </span>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                  Đọc tiếp <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

    </div>
  );
};
