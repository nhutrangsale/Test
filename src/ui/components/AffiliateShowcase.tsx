/**
 * AffiliateShowcase Component
 * Trưng bày các tác phẩm sách triết học, trà cụ, trầm hương, chuỗi hạt
 * liên kết tiếp thị (Shopee, Tiki, Lazada...) giúp tạo nguồn thu duy trì máy chủ
 * Vạn Cổ Luân Hồi
 */

import React, { useState, useEffect } from 'react';
import { ExternalLink, Tag, Star, Sparkles, ShoppingBag, BookOpen } from 'lucide-react';

export interface AffiliateProduct {
  id: string;
  title: string;
  description: string;
  category: 'sach_triet_ly' | 'tra_dao' | 'tram_huong' | 'chuoi_hat' | 'thien_dinh' | 'khac';
  provider: string;
  price_text: string;
  rating?: number;
  image_url: string;
  affiliate_url: string;
  commission_note?: string;
  is_featured: number;
  clicks_count: number;
}

interface AffiliateShowcaseProps {
  limit?: number;
  categoryFilter?: string;
  title?: string;
  showCategoryTabs?: boolean;
}

export const AffiliateShowcase: React.FC<AffiliateShowcaseProps> = ({
  limit = 6,
  categoryFilter = 'all',
  title = 'Tàng Thư & Vật Phẩm Hữu Duyên (Tiếp Thị Liên Kết)',
  showCategoryTabs = true,
}) => {
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFilter);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAffiliate = async () => {
      try {
        const query = selectedCategory !== 'all' ? `?category=${selectedCategory}` : '';
        const res = await fetch(`/api/v1/advertising/affiliate-products${query}`);
        const data = await res.json();
        if (data.success && data.data) {
          setProducts(data.data);
        }
      } catch (err) {
        console.error('Error fetching affiliate products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAffiliate();
  }, [selectedCategory]);

  const handleProductClick = async (product: AffiliateProduct) => {
    try {
      fetch(`/api/v1/advertising/affiliate-products/${product.id}/click`, { method: 'POST' });
    } catch {}
    window.open(product.affiliate_url, '_blank', 'noopener,noreferrer');
  };

  const categories = [
    { id: 'all', label: 'Tất Cả' },
    { id: 'sach_triet_ly', label: 'Sách Triết Lý' },
    { id: 'tra_dao', label: 'Trà Đạo' },
    { id: 'tram_huong', label: 'Trầm Hương' },
    { id: 'chuoi_hat', label: 'Chuỗi Hạt' },
    { id: 'thien_dinh', label: 'Thiền Định' },
  ];

  if (isLoading || products.length === 0) {
    return null;
  }

  const displayedProducts = limit ? products.slice(0, limit) : products;

  return (
    <section className="my-10 rounded-2xl border border-stone-200 dark:border-white/10 bg-white/70 dark:bg-[#0D1219]/80 p-5 sm:p-7 shadow-xs">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6 pb-4 border-b border-stone-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-sans-ui">
              Tiếp Thị Liên Kết Minh Bạch
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-display text-stone-900 dark:text-slate-100">
            {title}
          </h2>
          <p className="text-xs text-stone-500 dark:text-slate-400 font-reading mt-0.5">
            Các vật phẩm được tuyển chọn kỹ càng. Hoa hồng phát sinh được tái đầu tư 100% vào việc duy trì máy chủ.
          </p>
        </div>

        {/* Category Tabs */}
        {showCategoryTabs && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid of Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {displayedProducts.map((p) => (
          <div
            key={p.id}
            onClick={() => handleProductClick(p)}
            className="group rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-[#121922] p-3.5 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer"
          >
            <div>
              {/* Image thumbnail */}
              <div className="w-full h-36 rounded-lg overflow-hidden bg-stone-100 dark:bg-slate-900 mb-3 relative">
                <img
                  src={p.image_url}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-black/60 backdrop-blur-sm text-white border border-white/20">
                  {p.provider}
                </span>
                {p.commission_note && (
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-600/90 text-white backdrop-blur-xs">
                    Ủng hộ máy chủ
                  </span>
                )}
              </div>

              {/* Title & Desc */}
              <h3 className="font-display font-bold text-sm text-stone-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 mb-1">
                {p.title}
              </h3>
              <p className="font-reading text-xs text-stone-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {p.description}
              </p>
            </div>

            {/* Bottom price & CTA */}
            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100 dark:border-white/[0.04]">
              <div>
                <span className="text-[10px] text-stone-400 dark:text-slate-500 block uppercase">Giá tham khảo</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {p.price_text}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-stone-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                <span>Xem Ngay</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
};
