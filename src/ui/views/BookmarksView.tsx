/**
 * BookmarksView Component
 * Tủ sách tu tâm - Bộ sưu tập bài viết đã lưu của người dùng
 * Vạn Cổ Luân Hồi
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { BookmarkItemDto } from '../../modules/community/models/index.js';
import { Bookmark, ArrowRight, BookOpen } from 'lucide-react';

interface BookmarksViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({ onNavigate }) => {
  const { user, openAuthModal } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkItemDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchBookmarks = async () => {
      setLoading(true);
      try {
        const res = await api.get<BookmarkItemDto[]>('/api/v1/community/bookmarks');
        if (res.success && res.data) {
          setBookmarks(res.data);
        }
      } catch (err) {
        console.error('Bookmarks load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-emerald-500/40 bg-emerald-950/20 mb-4">
          <Bookmark className="w-5 h-5 text-emerald-400" />
        </div>
        <h2 className="font-cinzel text-xl font-semibold text-slate-100 mb-2">Tủ Sách Tu Tâm</h2>
        <p className="text-xs text-slate-400 font-lora mb-6 leading-relaxed">
          Đăng nhập để gom nhặt những áng văn chiêm nghiệm vào tủ sách cá nhân và tĩnh tâm đọc lại bất kỳ lúc nào.
        </p>
        <button
          onClick={openAuthModal}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
        >
          Đăng Nhập Ngay
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      <div className="border-b border-white/[0.08] pb-4">
        <h1 className="font-cinzel text-2xl font-semibold text-slate-100 flex items-center gap-2.5">
          <Bookmark className="w-5 h-5 text-emerald-400" />
          <span>Tủ Sách Đã Lưu ({bookmarks.length})</span>
        </h1>
        <p className="text-xs text-slate-400 font-lora mt-1">
          Những bài học triết lý và hạt giống thiện lành đã tích lũy trong tâm khảm
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500 font-lora">
          Đang lật mở tủ sách...
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="py-16 text-center rounded-xl bg-[#0D1219] border border-white/[0.05] p-8">
          <p className="text-sm text-slate-300 font-lora mb-2">Tủ sách hiện chưa có bài viết nào.</p>
          <p className="text-xs text-slate-500 mb-4">Hãy dạo quanh Tàng Kinh Các để lưu lại những bài luận tâm đắc.</p>
          <button
            onClick={() => onNavigate('explore')}
            className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium hover:bg-emerald-500/30 transition-colors cursor-pointer"
          >
            Khám Phá Bài Viết
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((item) => (
            <article
              key={item.post_id}
              onClick={() => onNavigate('post-detail', { slug: item.slug })}
              className="p-5 rounded-xl bg-[#0D1219] hover:bg-[#121924] border border-white/[0.06] hover:border-emerald-500/30 transition-all cursor-pointer group flex items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-sans-ui">
                  <span className="text-emerald-400 font-medium">{item.category_name}</span>
                  <span>·</span>
                  <span>Đã lưu {new Date(item.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
                <h3 className="font-lora text-base font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 font-lora line-clamp-1 mt-1">
                  {item.excerpt}
                </p>
              </div>

              <div className="flex-shrink-0 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all">
                <ArrowRight className="w-5 h-5" />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
