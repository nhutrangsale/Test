/**
 * SearchModal Component
 * Cửa sổ tìm kiếm nhanh bài viết và chuyên mục
 * Vạn Cổ Luân Hồi
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { PostDetailDto } from '../../modules/philosophy/models/index.js';
import { Search, X, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, params?: any) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PostDetailDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get<{ posts: PostDetailDto[] }>(`/api/v1/philosophy/posts?q=${encodeURIComponent(query)}&limit=5`);
        if (res.success && res.data?.posts) {
          setResults(res.data.posts);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-[#0D1219] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08]">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Tìm kiếm đạo lý, số kiếp, nhân duyên, tĩnh lặng..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-lora"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-3 space-y-2">
          {loading && (
            <div className="py-6 text-center text-xs text-slate-500 font-lora">
              Đang tra cứu tàng kinh các...
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-500 font-lora">
              Không tìm thấy bài viết nào chứa từ khóa "{query}".
            </div>
          )}

          {!loading && results.map((post) => (
            <button
              key={post.id}
              onClick={() => {
                onClose();
                onNavigate('post-detail', { slug: post.slug });
              }}
              className="w-full text-left p-3 rounded-xl bg-slate-950/50 hover:bg-slate-900 border border-white/[0.04] hover:border-emerald-500/30 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <span className="text-[11px] text-emerald-400 block mb-0.5 font-sans-ui">{post.category_name}</span>
                <h4 className="font-lora text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors">
                  {post.title}
                </h4>
                <p className="text-[11px] text-slate-500 font-lora line-clamp-1 mt-0.5">
                  {post.excerpt}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
            </button>
          ))}

          {query.length < 2 && (
            <div className="py-8 text-center text-xs text-slate-500 font-lora">
              Nhập tối thiểu 2 ký tự để bắt đầu tìm kiếm
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
