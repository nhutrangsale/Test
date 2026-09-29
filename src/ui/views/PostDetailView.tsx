/**
 * PostDetailView Component
 * Trải nghiệm đọc bài chuẩn thư quán (Editorial Long-form Reading)
 * Tương tác Thích, Lưu bài, Bình luận văn bản thuần, Tố cáo
 * Vạn Cổ Luân Hồi
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { PostDetailDto } from '../../modules/philosophy/models/index.js';
import { CommentDto } from '../../modules/community/models/index.js';
import { AdCarouselBanner } from '../components/AdCarouselBanner.js';
import { Heart, Bookmark, Share2, MessageSquare, ArrowLeft, Trash2, Flag, CornerDownRight, Send, Check } from 'lucide-react';

interface PostDetailViewProps {
  slug: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenDonationModal?: () => void;
}

export const PostDetailView: React.FC<PostDetailViewProps> = ({ slug, onNavigate, onOpenDonationModal }) => {
  const { user, openAuthModal } = useAuth();

  const [post, setPost] = useState<PostDetailDto | null>(null);
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Engagement state
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  // Comment input
  const [commentText, setCommentText] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // Report modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'post' | 'comment'; id: string } | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Load post and comments
  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<PostDetailDto>(`/api/v1/philosophy/posts/by-slug/${slug}`);
        if (res.success && res.data) {
          setPost(res.data);
          setLiked(Boolean(res.data.is_liked_by_me));
          setLikeCount(res.data.like_count);
          setBookmarked(Boolean(res.data.is_bookmarked_by_me));

          // Load comments
          const cRes = await api.get<CommentDto[]>(`/api/v1/community/posts/${res.data.id}/comments`);
          if (cRes.success && cRes.data) {
            setComments(cRes.data);
          }
        } else {
          setError(res.error?.message || 'Không tìm thấy bài viết này.');
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải nội dung bài viết.');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  // Handle Like
  const handleLike = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (!post) return;

    // Optimistic update
    const nextLiked = !liked;
    const nextCount = nextLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
    setLiked(nextLiked);
    setLikeCount(nextCount);

    const res = await api.post<{ liked: boolean; count: number }>(`/api/v1/community/posts/${post.id}/like`);
    if (res.success && res.data) {
      setLiked(res.data.liked);
      setLikeCount(res.data.count);
    }
  };

  // Handle Bookmark
  const handleBookmark = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (!post) return;

    setBookmarked(!bookmarked);
    const res = await api.post<{ bookmarked: boolean }>(`/api/v1/community/posts/${post.id}/bookmark`);
    if (res.success && res.data) {
      setBookmarked(res.data.bookmarked);
    }
  };

  // Handle Share
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle Comment Submit
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!post || !commentText.trim()) return;

    setSubmittingComment(true);
    setCommentError(null);

    try {
      const res = await api.post<CommentDto>(`/api/v1/community/posts/${post.id}/comments`, {
        content: commentText,
        parentId: replyToId,
      });

      if (res.success && res.data) {
        setCommentText('');
        setReplyToId(null);
        // Reload comments
        const cRes = await api.get<CommentDto[]>(`/api/v1/community/posts/${post.id}/comments`);
        if (cRes.success && cRes.data) setComments(cRes.data);
      } else {
        setCommentError(res.error?.message || 'Không thể gửi bình luận.');
      }
    } catch (err: any) {
      setCommentError(err.message || 'Lỗi khi gửi bình luận.');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
    const res = await api.delete(`/api/v1/community/comments/${commentId}`);
    if (res.success && post) {
      const cRes = await api.get<CommentDto[]>(`/api/v1/community/posts/${post.id}/comments`);
      if (cRes.success && cRes.data) setComments(cRes.data);
    }
  };

  // Handle Report
  const handleOpenReport = (type: 'post' | 'comment', id: string) => {
    if (!user) {
      openAuthModal();
      return;
    }
    setReportTarget({ type, id });
    setReportReason('');
    setReportSuccess(false);
    setReportModalOpen(true);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTarget || !reportReason.trim()) return;

    const res = await api.post('/api/v1/community/reports', {
      targetType: reportTarget.type,
      targetId: reportTarget.id,
      reason: reportReason,
    });

    if (res.success) {
      setReportSuccess(true);
      setTimeout(() => setReportModalOpen(false), 1500);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-500 font-lora">
        Đang khai mở cổ thư...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <h2 className="font-cinzel text-xl text-slate-200 mb-2">Bài Viết Quy Ẩn</h2>
        <p className="text-xs text-slate-400 mb-6 font-lora">{error || 'Không tìm thấy nội dung yêu cầu.'}</p>
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 bg-emerald-500 text-slate-950 font-semibold text-xs rounded-lg cursor-pointer"
        >
          Trở Về Trang Chủ
        </button>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Nút quay lại & Chuyên mục breadcrumb */}
      <div className="flex items-center justify-between mb-8 pb-3 border-b border-white/[0.06]">
        <button
          onClick={() => onNavigate('explore')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Trở về Tàng Kinh Các</span>
        </button>

        {/* Zero-Pill metadata header */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-sans-ui">
          <span className="text-emerald-400 font-medium">{post.category_name}</span>
          <span aria-hidden="true">·</span>
          <span>{new Date(post.published_at).toLocaleDateString('vi-VN')}</span>
          <span aria-hidden="true">·</span>
          <span>{post.view_count} lượt đọc</span>
        </div>
      </div>

      {/* Tiêu đề bài viết chuẩn Editorial Typography */}
      <header className="mb-8 max-w-2xl">
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 dark:text-slate-100 leading-tight tracking-wide text-balance">
          {post.title}
        </h1>
        
        <p className="font-reading text-sm sm:text-base text-stone-700 dark:text-slate-300 italic mt-4 pl-4 border-l-2 border-emerald-600 dark:border-emerald-500/60 leading-relaxed">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-stone-200 dark:border-white/[0.04]">
          <div className="w-8 h-8 rounded-full border border-emerald-500/30 overflow-hidden bg-stone-200 dark:bg-slate-900">
            <img
              src="https://api.dicebear.com/7.x/bottts/svg?seed=vancodaonhan"
              alt={post.author_name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="text-xs font-semibold text-stone-800 dark:text-slate-200">{post.author_name}</div>
            <div className="text-[11px] text-stone-500 dark:text-slate-500">Tọa đàm triết học & chiêm nghiệm</div>
          </div>
        </div>
      </header>

      {/* Ảnh bìa bài viết */}
      {post.cover_image && (
        <div className="w-full h-64 sm:h-96 rounded-xl overflow-hidden mb-10 border border-stone-200 dark:border-white/[0.08] bg-stone-100 dark:bg-slate-950">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Nội dung bài viết (Tối ưu độ rộng đọc 68-75 ký tự, chữ Lora thanh thoát) */}
      <div className="max-w-2xl mx-auto space-y-6 text-stone-800 dark:text-slate-200 font-reading text-base sm:text-lg leading-relaxed sm:leading-loose">
        {post.content.split('\n\n').map((paragraph, index) => {
          if (index === 0) {
            // Drop cap ở đoạn đầu tiên
            return (
              <p
                key={index}
                className="first-letter:text-5xl first-letter:font-display first-letter:font-bold first-letter:text-emerald-600 dark:first-letter:text-emerald-400 first-letter:float-left first-letter:mr-3 first-letter:mt-1 text-stone-800 dark:text-slate-200"
              >
                {paragraph}
              </p>
            );
          }
          return <p key={index}>{paragraph}</p>;
        })}
      </div>

      {/* BANNER QUẢNG CÁO & GỢI Ý TRƯỢT NGANG GIỮA BÀI VIẾT (In-Content Carousel 3-5s) */}
      <div className="max-w-2xl mx-auto my-8">
        <AdCarouselBanner
          placement="in_content"
          onNavigate={onNavigate}
          onOpenDonationModal={onOpenDonationModal}
        />
      </div>

      {/* ==============================================================
          INTERACTION RIBBON (Thích, Lưu, Chia sẻ, Tố cáo)
          ============================================================== */}
      <div className="max-w-2xl mx-auto mt-10 pt-6 pb-6 border-y border-stone-200 dark:border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Nút Thích */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              liked
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-400 dark:border-rose-600/50 text-rose-700 dark:text-rose-300'
                : 'bg-white dark:bg-slate-900 border-stone-200 dark:border-white/[0.08] text-stone-700 dark:text-slate-300 hover:border-emerald-500/40'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{likeCount} Đồng cảm</span>
          </button>

          {/* Nút Lưu trữ */}
          <button
            onClick={handleBookmark}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              bookmarked
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-600/50 text-emerald-800 dark:text-emerald-300'
                : 'bg-white dark:bg-slate-900 border-stone-200 dark:border-white/[0.08] text-stone-700 dark:text-slate-300 hover:border-emerald-500/40'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-emerald-500 text-emerald-500 dark:fill-emerald-400 dark:text-emerald-400' : ''}`} />
            <span>{bookmarked ? 'Đã lưu' : 'Lưu bài'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút Chia sẻ */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-stone-200 dark:border-white/[0.08] hover:border-emerald-500/40 text-stone-700 dark:text-slate-300 text-xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-stone-500 dark:text-slate-400" />}
            <span>{copied ? 'Đã chép link' : 'Chia sẻ'}</span>
          </button>

          {/* Tố cáo bài viết */}
          <button
            onClick={() => handleOpenReport('post', post.id)}
            className="p-1.5 text-stone-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
            title="Tố cáo bài viết"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ==============================================================
          KHU VỰC BÌNH LUẬN & ĐÀM ĐẠO (Chỉ văn bản thuần)
          ============================================================== */}
      <section className="max-w-2xl mx-auto mt-10 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-stone-900 dark:text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Đàm Đạo & Chiêm Nghiệm ({comments.length})</span>
          </h3>
          <span className="text-xs text-stone-500 dark:text-slate-500 font-sans-ui">Thanh quy văn bản thuần</span>
        </div>

        {/* Khung nhập bình luận */}
        {user ? (
          <form onSubmit={handleCommentSubmit} className="space-y-3 p-4 rounded-xl bg-white dark:bg-[#0D1219] border border-stone-200 dark:border-white/[0.08] shadow-xs">
            {replyToId && (
              <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded border border-emerald-200 dark:border-emerald-900/30">
                <span>Đang hồi đáp bình luận của đạo hữu...</span>
                <button
                  type="button"
                  onClick={() => setReplyToId(null)}
                  className="text-stone-400 hover:text-stone-700 dark:hover:text-white cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            )}

            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Viết lời đàm đạo (Chỉ cho phép văn bản thuần, không dùng hình ảnh)..."
              className="w-full p-3 text-xs bg-stone-50 dark:bg-slate-950 border border-stone-300 dark:border-white/[0.08] rounded-lg text-stone-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors font-reading resize-none"
            />

            {commentError && (
              <p className="text-xs text-rose-500 dark:text-rose-400">{commentError}</p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-md transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <span>{submittingComment ? 'Đang gửi...' : 'Gửi Đàm Đạo'}</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 rounded-xl bg-white dark:bg-[#0D1219] border border-stone-200 dark:border-white/[0.06] text-center shadow-xs">
            <p className="text-xs text-stone-500 dark:text-slate-400 mb-2">Đăng nhập để tham gia đàm đạo cùng các đạo hữu.</p>
            <button
              onClick={openAuthModal}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-md cursor-pointer"
            >
              Đăng Nhập Ngay
            </button>
          </div>
        )}

        {/* Danh sách bình luận */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 rounded-xl bg-[#0D1219] border border-white/[0.05] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <img
                    src={comment.author_avatar}
                    alt={comment.author_name}
                    className="w-5 h-5 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="font-medium text-slate-200">{comment.author_name}</span>
                  {comment.author_role === 'admin' && (
                    <span className="text-[10px] text-amber-400 font-sans-ui">· Quản trị</span>
                  )}
                  <span className="text-[11px] text-slate-500 font-sans-ui">
                    · {new Date(comment.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {user && (
                    <button
                      onClick={() => setReplyToId(comment.id)}
                      className="text-slate-400 hover:text-emerald-400 text-[11px] cursor-pointer"
                    >
                      Hồi đáp
                    </button>
                  )}
                  {(comment.is_mine || user?.role === 'admin') && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                      title="Xóa bình luận"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenReport('comment', comment.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                    title="Tố cáo bình luận"
                  >
                    <Flag className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-lora leading-relaxed pl-7">
                {comment.content}
              </p>

              {/* Danh sách hồi đáp (Replies) */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 pl-6 pt-3 border-t border-white/[0.04] space-y-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <CornerDownRight className="w-3 h-3 text-emerald-500" />
                          <span className="font-medium">{reply.author_name}</span>
                          <span className="text-[10px] text-slate-500">
                            · {new Date(reply.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        {(reply.is_mine || user?.role === 'admin') && (
                          <button
                            onClick={() => handleDeleteComment(reply.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-lora leading-relaxed pl-4">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ==============================================================
          REPORT MODAL
          ============================================================== */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0E141D] border border-white/[0.1] rounded-xl p-6">
            <h3 className="font-cinzel text-base font-semibold text-slate-100 mb-2">
              Tố Cáo Vi Phạm Thanh Quy
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-lora">
              Báo cáo bài viết hoặc bình luận có nội dung rác, xúc phạm hoặc vi phạm tiêu chuẩn cộng đồng.
            </p>

            {reportSuccess ? (
              <p className="text-xs text-emerald-400 text-center py-4">
                Cảm tạ đạo hữu đã giữ gìn thanh tịnh cho thư quán. Tố cáo đã được ghi nhận.
              </p>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-3">
                <textarea
                  required
                  rows={3}
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Lý do tố cáo (tối thiểu 5 ký tự)..."
                  className="w-full p-2.5 text-xs bg-slate-950 border border-white/[0.08] rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 font-lora"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-500 text-white rounded cursor-pointer"
                  >
                    Gửi Tố Cáo
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </article>
  );
};
