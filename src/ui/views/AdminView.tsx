/**
 * AdminView Component
 * Bàn Quản Trị Hệ Thống:
 * - Thống kê tổng quan
 * - Quản lý bài viết (CRUD)
 * - Quản lý chuyên mục
 * - Quản lý thành viên (Khóa/Mở khóa)
 * - Xử lý tố cáo
 * - Bật/tắt module động (Philosophy, Community, Awakening, Cultivation, Simulation)
 * Vạn Cổ Luân Hồi
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { 
  ShieldAlert, BookOpen, Layers, Users, Flag, Cpu, 
  Plus, Trash2, CheckCircle, XCircle, ArrowLeft, RefreshCw, AlertTriangle,
  Tag, ShoppingBag, ExternalLink, Clock, Heart, Eye, MousePointer
} from 'lucide-react';

interface AdminViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'posts' | 'categories' | 'users' | 'reports' | 'modules' | 'advertising'>('stats');

  const [stats, setStats] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Quản lý Quảng Cáo, Tiếp Thị (Affiliate) & Quỹ Gieo Duyên
  const [adsList, setAdsList] = useState<any[]>([]);
  const [affiliateList, setAffiliateList] = useState<any[]>([]);
  const [supportersList, setSupportersList] = useState<any[]>([]);

  // Form Thêm Banner Quảng Cáo mới
  const [showAddBanner, setShowAddBanner] = useState(false);
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerSubtitle, setNewBannerSubtitle] = useState('');
  const [newBannerPlacement, setNewBannerPlacement] = useState<'header' | 'in_content' | 'footer' | 'bottom_bar'>('header');
  const [newBannerGroupId, setNewBannerGroupId] = useState('grp_header_main');
  const [newBannerTargetUrl, setNewBannerTargetUrl] = useState('');
  const [newBannerCta, setNewBannerCta] = useState('Khám Phá');
  const [newBannerBadge, setNewBannerBadge] = useState('Tiếp Thị Liên Kết');
  const [newBannerDelay, setNewBannerDelay] = useState(4);
  const [newBannerIsAffiliate, setNewBannerIsAffiliate] = useState(true);

  // Form Thêm Vật Phẩm Tiếp Thị Liên Kết (Affiliate) mới
  const [showAddAff, setShowAddAff] = useState(false);
  const [newAffTitle, setNewAffTitle] = useState('');
  const [newAffDesc, setNewAffDesc] = useState('');
  const [newAffCategory, setNewAffCategory] = useState<'sach_triet_ly' | 'tra_dao' | 'tram_huong' | 'chuoi_hat' | 'thien_dinh'>('sach_triet_ly');
  const [newAffProvider, setNewAffProvider] = useState('Shopee');
  const [newAffPrice, setNewAffPrice] = useState('185.000 đ');
  const [newAffUrl, setNewAffUrl] = useState('');
  const [newAffImage, setNewAffImage] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80');
  const [newAffCommission, setNewAffCommission] = useState('Hoa hồng 10% quỹ máy chủ');

  // Form Thêm bài viết mới
  const [showAddPost, setShowAddPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostSlug, setNewPostSlug] = useState('');
  const [newPostCategoryId, setNewPostCategoryId] = useState('');
  const [newPostExcerpt, setNewPostExcerpt] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [addPostLoading, setAddPostLoading] = useState(false);

  // Form Thêm chuyên mục mới
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, postsRes, catsRes, usersRes, repsRes, modsRes, adsRes, affRes, supRes] = await Promise.all([
        api.get('/api/v1/admin/dashboard'),
        api.get('/api/v1/admin/posts'),
        api.get('/api/v1/philosophy/categories'),
        api.get('/api/v1/admin/users'),
        api.get('/api/v1/admin/reports'),
        api.get('/api/v1/admin/modules'),
        api.get('/api/v1/advertising/banners'),
        api.get('/api/v1/advertising/affiliate-products'),
        api.get('/api/v1/advertising/supporters'),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (postsRes.success) setPosts(postsRes.data);
      if (catsRes.success) {
        setCategories(catsRes.data);
        if (catsRes.data.length > 0 && !newPostCategoryId) {
          setNewPostCategoryId(catsRes.data[0].id);
        }
      }
      if (usersRes.success) setUsers(usersRes.data);
      if (repsRes.success) setReports(repsRes.data);
      if (modsRes.success) setModules(modsRes.data);
      if (adsRes.success) setAdsList(adsRes.data?.banners || []);
      if (affRes.success) setAffiliateList(affRes.data || []);
      if (supRes.success) setSupportersList(supRes.data?.supporters || []);
    } catch (err) {
      console.error('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="font-cinzel text-xl text-slate-100 mb-2">Quyền Hạn Bị Giới Hạn</h2>
        <p className="text-xs text-slate-400 mb-6 font-lora">
          Khu vực Bàn Quản Trị chỉ dành cho các bậc Quản trị viên tối cao của Vạn Cổ Luân Hồi.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 bg-emerald-500 text-slate-950 font-semibold text-xs rounded-lg cursor-pointer"
        >
          Trở Về Trang Chủ
        </button>
      </div>
    );
  }

  // Handle Tạo bài viết mới
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle || !newPostContent || !newPostCategoryId) return;

    setAddPostLoading(true);
    try {
      const res = await api.post('/api/v1/admin/posts', {
        title: newPostTitle,
        slug: newPostSlug,
        categoryId: newPostCategoryId,
        excerpt: newPostExcerpt,
        content: newPostContent,
      });

      if (res.success) {
        setNewPostTitle('');
        setNewPostSlug('');
        setNewPostExcerpt('');
        setNewPostContent('');
        setShowAddPost(false);
        await loadData();
      } else {
        alert(res.error?.message || 'Không thể tạo bài viết.');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAddPostLoading(false);
    }
  };

  // Handle Xóa bài viết
  const handleDeletePost = async (postId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này vĩnh viễn?')) return;
    const res = await api.delete(`/api/v1/admin/posts/${postId}`);
    if (res.success) {
      await loadData();
    }
  };

  // Handle Thêm chuyên mục
  const handleCreateCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    const res = await api.post('/api/v1/admin/categories', {
      name: newCatName,
      description: newCatDesc,
    });
    if (res.success) {
      setNewCatName('');
      setNewCatDesc('');
      setShowAddCat(false);
      await loadData();
    }
  };

  // Handle Khóa/Mở khóa thành viên
  const handleToggleUserBan = async (userId: string) => {
    const res = await api.post(`/api/v1/admin/users/${userId}/toggle-ban`);
    if (res.success) {
      await loadData();
    } else {
      alert(res.error?.message);
    }
  };

  // Handle Xử lý tố cáo
  const handleResolveReport = async (reportId: string, action: 'dismiss' | 'delete_target') => {
    const res = await api.post(`/api/v1/admin/reports/${reportId}/resolve`, { action });
    if (res.success) {
      await loadData();
    }
  };

  // Handle Bật/Tắt module động
  const handleToggleModule = async (moduleId: string) => {
    const res = await api.patch(`/api/v1/admin/modules/${moduleId}/toggle`);
    if (res.success) {
      await loadData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      
      {/* Header Quản trị */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về trang chủ</span>
          </button>
          <h1 className="font-cinzel text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            <span>Bàn Quản Trị Hệ Thống</span>
          </h1>
          <p className="text-xs text-slate-400 font-lora mt-0.5">
            Quản lý nội dung, phân quyền thành viên, kiểm duyệt tố cáo và điều phối các module
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/[0.08] hover:border-emerald-500/40 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-stone-200 dark:border-white/[0.06]">
        {[
          { id: 'stats', label: 'Tổng Quan', icon: ShieldAlert },
          { id: 'posts', label: 'Bài Viết', icon: BookOpen },
          { id: 'categories', label: 'Chuyên Mục', icon: Layers },
          { id: 'users', label: 'Thành Viên', icon: Users },
          { id: 'reports', label: `Tố Cáo (${stats?.pendingReports || 0})`, icon: Flag },
          { id: 'modules', label: 'Quản Lý Module', icon: Cpu },
          { id: 'advertising', label: 'Quảng Cáo & Tiếp Thị (Affiliate)', icon: Tag },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 font-semibold'
                  : 'bg-white dark:bg-[#0E141D] text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200 border border-stone-200 dark:border-white/[0.04]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==============================================================
          TAB 1: TỔNG QUAN (STATS)
          ============================================================== */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-xl bg-[#0D1219] border border-white/[0.06]">
              <span className="text-[11px] text-slate-400 block mb-1">Tổng Bài Viết</span>
              <span className="font-cinzel text-2xl font-bold text-slate-100">{stats.totalPosts}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#0D1219] border border-white/[0.06]">
              <span className="text-[11px] text-slate-400 block mb-1">Lượt Đọc</span>
              <span className="font-cinzel text-2xl font-bold text-emerald-400">{stats.totalViews}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#0D1219] border border-white/[0.06]">
              <span className="text-[11px] text-slate-400 block mb-1">Lượt Đồng Cảm</span>
              <span className="font-cinzel text-2xl font-bold text-rose-400">{stats.totalLikes}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#0D1219] border border-white/[0.06]">
              <span className="text-[11px] text-slate-400 block mb-1">Thành Viên</span>
              <span className="font-cinzel text-2xl font-bold text-slate-100">{stats.totalUsers}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#0D1219] border border-white/[0.06]">
              <span className="text-[11px] text-slate-400 block mb-1">Bình Luận</span>
              <span className="font-cinzel text-2xl font-bold text-slate-100">{stats.totalComments}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#0D1219] border border-white/[0.06]">
              <span className="text-[11px] text-slate-400 block mb-1">Tố Cáo Chờ Duyệt</span>
              <span className={`font-cinzel text-2xl font-bold ${stats.pendingReports > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                {stats.pendingReports}
              </span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D1219] border border-white/[0.08] space-y-3">
            <h3 className="font-cinzel text-base font-semibold text-slate-100">
              Kiến Trúc Vận Hành Giai Đoạn 1
            </h3>
            <p className="text-xs text-slate-300 font-lora leading-relaxed">
              Hệ thống đang chạy ổn định với Core hạt nhân độc lập, kết nối lỏng lẻo tới Module Philosophy, Community và Admin. 
              Các module Giác Ngộ (Awakening), Tu Tiên (Cultivation) và Luân Hồi (Simulation) đang ở trạng thái chuẩn bị (Stub Shell) sẵn sàng cho Phase 2 mà không cần chỉnh sửa Core.
            </p>
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 2: QUẢN LÝ BÀI VIẾT
          ============================================================== */}
      {activeTab === 'posts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Danh sách ({posts.length}) bài viết</span>
            <button
              onClick={() => setShowAddPost(!showAddPost)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddPost ? 'Đóng Khung Nhập' : 'Chắp Bút Bài Mới'}</span>
            </button>
          </div>

          {/* Form thêm bài mới */}
          {showAddPost && (
            <form onSubmit={handleCreatePost} className="p-6 rounded-2xl bg-[#0E141D] border border-emerald-500/30 space-y-4">
              <h3 className="font-cinzel text-sm font-semibold text-emerald-400">Tạo Bài Luận Mới</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Tiêu đề bài viết</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Lòng Yên Gió Lặng"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-950 border border-white/[0.08] rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 font-lora"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Chuyên mục</label>
                  <select
                    value={newPostCategoryId}
                    onChange={(e) => setNewPostCategoryId(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-950 border border-white/[0.08] rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 font-sans-ui cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Tùy chọn đường dẫn URL (Slug - để trống sẽ tự sinh theo tiêu đề)</label>
                <input
                  type="text"
                  placeholder="long-yen-gio-lang"
                  value={newPostSlug}
                  onChange={(e) => setNewPostSlug(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-950 border border-white/[0.08] rounded-lg text-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Trích đoạn tóm lược</label>
                <textarea
                  rows={2}
                  value={newPostExcerpt}
                  onChange={(e) => setNewPostExcerpt(e.target.value)}
                  placeholder="Vài câu dẫn lối tâm đắc..."
                  className="w-full p-2.5 text-xs bg-slate-950 border border-white/[0.08] rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 font-lora"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Toàn văn bài viết</label>
                <textarea
                  rows={8}
                  required
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Nội dung sâu sắc... Mỗi đoạn cách nhau 2 lần xuống dòng."
                  className="w-full p-3 text-xs bg-slate-950 border border-white/[0.08] rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 font-lora leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPost(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={addPostLoading}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg cursor-pointer transition-colors"
                >
                  {addPostLoading ? 'Đang lưu...' : 'Xuất Bản Bài Viết'}
                </button>
              </div>
            </form>
          )}

          {/* Bảng bài viết */}
          <div className="rounded-xl border border-white/[0.06] bg-[#0D1219] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-sans-ui border-b border-white/[0.06]">
                  <tr>
                    <th className="p-3.5">Tiêu Đề</th>
                    <th className="p-3.5">Chuyên Mục</th>
                    <th className="p-3.5">Lượt Xem</th>
                    <th className="p-3.5">Đồng Cảm</th>
                    <th className="p-3.5">Ngày Đăng</th>
                    <th className="p-3.5 text-right">Tác Vụ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {posts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5 font-medium text-slate-200 max-w-xs truncate">
                        <button
                          onClick={() => onNavigate('post-detail', { slug: p.slug })}
                          className="hover:text-emerald-400 transition-colors text-left truncate block cursor-pointer"
                        >
                          {p.title}
                        </button>
                        <span className="text-[10px] text-slate-500 font-mono block">/{p.slug}</span>
                      </td>
                      <td className="p-3.5 text-emerald-400">{p.category_name}</td>
                      <td className="p-3.5 font-mono">{p.view_count}</td>
                      <td className="p-3.5 font-mono">{p.like_count}</td>
                      <td className="p-3.5 text-slate-400 font-sans-ui">
                        {new Date(p.published_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeletePost(p.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Xóa bài viết"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 3: CHUYÊN MỤC
          ============================================================== */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">7 Chuyên mục Bát Nhã khởi thủy</span>
            <button
              onClick={() => setShowAddCat(!showAddCat)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Chuyên Mục</span>
            </button>
          </div>

          {showAddCat && (
            <form onSubmit={handleCreateCat} className="p-5 rounded-xl bg-[#0E141D] border border-white/[0.08] space-y-3">
              <h4 className="text-xs font-semibold text-slate-200">Thêm chuyên mục mới</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Tên chuyên mục (Ví dụ: Thiền Trà)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="p-2 text-xs bg-slate-950 border border-white/[0.08] rounded-lg text-slate-200"
                />
                <input
                  type="text"
                  placeholder="Mô tả tóm tắt"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="p-2 text-xs bg-slate-950 border border-white/[0.08] rounded-lg text-slate-200"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddCat(false)} className="px-3 py-1 text-xs text-slate-400">Hủy</button>
                <button type="submit" className="px-4 py-1 text-xs bg-emerald-500 text-slate-950 font-semibold rounded">Lưu</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c) => (
              <div key={c.id} className="p-4 rounded-xl bg-[#0D1219] border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-cinzel text-sm font-semibold text-slate-200">{c.name}</h4>
                  <span className="text-[10px] text-emerald-400 font-mono">/{c.slug}</span>
                </div>
                <p className="text-xs text-slate-400 font-lora line-clamp-2">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 4: THÀNH VIÊN
          ============================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">Danh sách ({users.length}) tài khoản hệ thống</div>
          <div className="rounded-xl border border-white/[0.06] bg-[#0D1219] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-sans-ui border-b border-white/[0.06]">
                <tr>
                  <th className="p-3.5">Thành Viên</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Vai Trò</th>
                  <th className="p-3.5">Trạng Thái</th>
                  <th className="p-3.5 text-right">Khóa / Mở</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40">
                    <td className="p-3.5 flex items-center gap-2 font-medium text-slate-200">
                      <img src={u.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                      <span>{u.display_name}</span>
                    </td>
                    <td className="p-3.5 text-slate-400 font-mono">{u.email || 'OAuth Token'}</td>
                    <td className="p-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-sans-ui ${
                        u.role === 'admin' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`text-[10px] ${u.status === 'banned' ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {u.status === 'banned' ? 'Đã khóa' : 'Hoạt động'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserBan(u.id)}
                          className={`text-xs px-2.5 py-1 rounded cursor-pointer transition-colors ${
                            u.status === 'banned'
                              ? 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900'
                              : 'bg-rose-950 text-rose-300 hover:bg-rose-900'
                          }`}
                        >
                          {u.status === 'banned' ? 'Mở Khóa' : 'Khóa'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 5: DUYỆT TỐ CÁO (REPORTS)
          ============================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">Danh sách ({reports.length}) tố cáo từ đạo hữu</div>
          
          {reports.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-lora bg-[#0D1219] rounded-xl border border-white/[0.04]">
              Chưa có tố cáo vi phạm nào. Cõi thư quán hiện đang thanh tịnh.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <div key={r.id} className="p-4 rounded-xl bg-[#0D1219] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-amber-400 font-medium">Tố cáo {r.target_type === 'comment' ? 'Bình luận' : 'Bài viết'}</span>
                      <span className="text-slate-500">· Bởi {r.reporter_name}</span>
                      <span className="text-slate-500">· {new Date(r.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="text-xs font-lora text-slate-300">
                      Mục tiêu: <span className="text-slate-200">{r.target_summary}</span>
                    </div>
                    <div className="text-xs text-rose-300/90 font-lora italic">
                      Lý do: "{r.reason}"
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {r.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleResolveReport(r.id, 'delete_target')}
                          className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-500 text-white rounded-lg cursor-pointer"
                        >
                          Xóa Mục Vi Phạm
                        </button>
                        <button
                          onClick={() => handleResolveReport(r.id, 'dismiss')}
                          className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                        >
                          Bác Bỏ
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-500 font-sans-ui">
                        Đã xử lý ({r.status})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==============================================================
          TAB 7: QUẢNG CÁO & TIẾP THỊ LIÊN KẾT (AFFILIATE) & QUỸ GIEO DUYÊN
          ============================================================== */}
      {activeTab === 'advertising' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Thông tin định hướng */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-stone-700 dark:text-slate-300 font-reading leading-relaxed">
            <h4 className="font-bold text-emerald-800 dark:text-emerald-400 font-display mb-1 flex items-center gap-1.5 text-sm">
              <Tag className="w-4 h-4" />
              Kiếm Tiền Minh Bạch & Duy Trì Nền Tảng Qua Tiếp Thị Liên Kết
            </h4>
            Nền tảng hỗ trợ cài đặt các banner quảng cáo trượt ngang (Horizontal Carousel delay 3-5s) tại các vị trí Header, In-Content, Bottom Bar, Footer.
            Quản trị viên có thể cấu hình các đường dẫn Affiliate (Shopee, Tiki, Lazada, Trà quán, Sách cổ phong...) để kiếm hoa hồng trang trải chi phí máy chủ và chia sẻ những tác phẩm ý nghĩa tới cộng đồng.
          </div>

          {/* 1. QUẢN LÝ BANNER QUẢNG CÁO TRƯỢT NGANG */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-white/[0.06]">
              <div>
                <h3 className="font-display text-base font-bold text-stone-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Banner Quảng Cáo Trượt Ngang ({adsList.length})</span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-slate-400 font-reading">
                  1 Banner có thể chứa nhiều quảng cáo trượt ngang luân phiên sau 3-5 giây
                </p>
              </div>

              <button
                onClick={() => setShowAddBanner(!showAddBanner)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddBanner ? 'Đóng Form' : 'Thêm Banner Mới'}</span>
              </button>
            </div>

            {/* Form Thêm Banner Mới */}
            {showAddBanner && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newBannerTitle || !newBannerTargetUrl) return;
                  try {
                    const res = await api.post('/api/v1/advertising/admin/banners', {
                      title: newBannerTitle,
                      subtitle: newBannerSubtitle,
                      placement: newBannerPlacement,
                      group_id: newBannerGroupId,
                      target_url: newBannerTargetUrl,
                      cta_text: newBannerCta,
                      badge_text: newBannerBadge,
                      delay_seconds: Number(newBannerDelay) || 4,
                      is_affiliate: newBannerIsAffiliate ? 1 : 0,
                    });
                    if (res.success) {
                      setNewBannerTitle('');
                      setNewBannerSubtitle('');
                      setNewBannerTargetUrl('');
                      setShowAddBanner(false);
                      await loadData();
                    } else {
                      alert(res.error?.message || 'Không thể tạo banner');
                    }
                  } catch (err: any) {
                    alert(err.message);
                  }
                }}
                className="p-5 rounded-xl border border-emerald-500/30 bg-white dark:bg-[#0E1520] shadow-md space-y-4 text-xs font-sans-ui"
              >
                <h4 className="font-bold text-sm text-emerald-700 dark:text-emerald-400">
                  Tạo Mới Banner Quảng Cáo / Tiếp Thị
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-600 dark:text-slate-400 mb-1 font-medium">Tiêu Đề Quảng Cáo *</label>
                    <input
                      type="text"
                      required
                      value={newBannerTitle}
                      onChange={(e) => setNewBannerTitle(e.target.value)}
                      placeholder="Ví dụ: Tủ Sách Triết Lý Cổ Phong..."
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-white/10 bg-white dark:bg-slate-900 text-stone-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 dark:text-slate-400 mb-1 font-medium">Phụ Đề / Mô Tả Ngắn</label>
                    <input
                      type="text"
                      value={newBannerSubtitle}
                      onChange={(e) => setNewBannerSubtitle(e.target.value)}
                      placeholder="Đúc kết quy luật nhân sinh..."
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-white/10 bg-white dark:bg-slate-900 text-stone-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 dark:text-slate-400 mb-1 font-medium">Vị Trí Hiển Thị (Placement) *</label>
                    <select
                      value={newBannerPlacement}
                      onChange={(e: any) => {
                        const val = e.target.value;
                        setNewBannerPlacement(val);
                        setNewBannerGroupId(`grp_${val}`);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-white/10 bg-white dark:bg-slate-900 text-stone-900 dark:text-slate-100"
                    >
                      <option value="header">Header (Đầu trang - Announcement Bar)</option>
                      <option value="in_content">In-Content (Giữa trang chủ & bài viết)</option>
                      <option value="bottom_bar">Bottom Bar (Thanh nổi đáy trang)</option>
                      <option value="footer">Footer (Chân trang)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-600 dark:text-slate-400 mb-1 font-medium">Mã Nhóm Banner (Group ID)</label>
                    <input
                      type="text"
                      value={newBannerGroupId}
                      onChange={(e) => setNewBannerGroupId(e.target.value)}
                      placeholder="grp_header_main"
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-white/10 bg-white dark:bg-slate-900 text-stone-900 dark:text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 dark:text-slate-400 mb-1 font-medium">Đường Dẫn Đích (Target URL / Affiliate Link) *</label>
                    <input
                      type="text"
                      required
                      value={newBannerTargetUrl}
                      onChange={(e) => setNewBannerTargetUrl(e.target.value)}
                      placeholder="https://shopee.vn/... hoặc #ung-ho"
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-white/10 bg-white dark:bg-slate-900 text-stone-900 dark:text-slate-100 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-600 dark:text-slate-400 mb-1 font-medium">Nút Bấm (CTA)</label>
                      <input
                        type="text"
                        value={newBannerCta}
                        onChange={(e) => setNewBannerCta(e.target.value)}
                        placeholder="Khám Phá"
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-white/10 bg-white dark:bg-slate-900 text-stone-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 dark:text-slate-400 mb-1 font-medium">Thời Gian Trượt</label>
                      <select
                        value={newBannerDelay}
                        onChange={(e) => setNewBannerDelay(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-white/10 bg-white dark:bg-slate-900 text-stone-900 dark:text-slate-100"
                      >
                        <option value="3">3 giây (Trượt nhanh)</option>
                        <option value="4">4 giây (Chuẩn)</option>
                        <option value="5">5 giây (Thư thái)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-white/10">
                  <label className="flex items-center gap-2 cursor-pointer text-stone-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={newBannerIsAffiliate}
                      onChange={(e) => setNewBannerIsAffiliate(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Gắn nhãn Tiếp Thị Liên Kết (Affiliate)</span>
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddBanner(false)}
                      className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-white/10 text-stone-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-white/5 cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
                    >
                      Lưu Banner Mới
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Bảng Danh Sách Banner */}
            <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-white/[0.06] bg-white dark:bg-[#0D1219]">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-white/[0.02] border-b border-stone-200 dark:border-white/[0.06] text-stone-500 dark:text-slate-400">
                  <tr>
                    <th className="p-3">Tiêu Đề & Phụ Đề</th>
                    <th className="p-3">Vị Trí</th>
                    <th className="p-3">Nhóm (Group)</th>
                    <th className="p-3 text-center">Delay</th>
                    <th className="p-3 text-center">Lượt Xem / Click</th>
                    <th className="p-3 text-center">Trạng Thái</th>
                    <th className="p-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-white/[0.04]">
                  {adsList.map((ad) => (
                    <tr key={ad.id} className="hover:bg-stone-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 max-w-xs">
                        <div className="font-semibold text-stone-900 dark:text-slate-100 truncate">{ad.title}</div>
                        <div className="text-[11px] text-stone-500 dark:text-slate-400 truncate">{ad.subtitle || 'Không có phụ đề'}</div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate">{ad.target_url}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-stone-100 dark:bg-white/5 text-stone-700 dark:text-slate-300">
                          {ad.placement}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-stone-500 dark:text-slate-400">
                        {ad.group_id}
                      </td>
                      <td className="p-3 text-center font-mono font-medium">
                        {ad.delay_seconds}s
                      </td>
                      <td className="p-3 text-center">
                        <div className="font-mono text-stone-700 dark:text-slate-300">
                          {ad.views_count} / <strong className="text-emerald-600 dark:text-emerald-400">{ad.clicks_count}</strong>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={async () => {
                            try {
                              await api.put(`/api/v1/advertising/admin/banners/${ad.id}`, {
                                is_active: ad.is_active === 1 ? 0 : 1,
                              });
                              await loadData();
                            } catch (err: any) {
                              alert(err.message);
                            }
                          }}
                          className={`px-2.5 py-0.5 rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                            ad.is_active === 1
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-stone-200 dark:bg-slate-800 text-stone-500 dark:text-slate-400'
                          }`}
                        >
                          {ad.is_active === 1 ? 'Đang Chạy' : 'Tạm Dừng'}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={async () => {
                            if (!confirm('Xóa vĩnh viễn banner quảng cáo này?')) return;
                            try {
                              await api.delete(`/api/v1/advertising/admin/banners/${ad.id}`);
                              await loadData();
                            } catch (err: any) {
                              alert(err.message);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                          title="Xóa banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. QUẢN LÝ VẬT PHẨM TIẾP THỊ LIÊN KẾT (AFFILIATE PRODUCTS) */}
          <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-white/10">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-white/[0.06]">
              <div>
                <h3 className="font-display text-base font-bold text-stone-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Vật Phẩm Tiếp Thị Liên Kết ({affiliateList.length})</span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-slate-400 font-reading">
                  Sách triết lý, Trà đạo, Trầm hương, Chuỗi hạt có link affiliate Shopee, Tiki, Lazada...
                </p>
              </div>

              <button
                onClick={() => setShowAddAff(!showAddAff)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddAff ? 'Đóng Form' : 'Thêm Sản Phẩm Mới'}</span>
              </button>
            </div>

            {/* Form Thêm Sản Phẩm Mới */}
            {showAddAff && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newAffTitle || !newAffUrl) return;
                  try {
                    const res = await api.post('/api/v1/advertising/admin/affiliate-products', {
                      title: newAffTitle,
                      description: newAffDesc,
                      category: newAffCategory,
                      provider: newAffProvider,
                      price_text: newAffPrice,
                      image_url: newAffImage,
                      affiliate_url: newAffUrl,
                      commission_note: newAffCommission,
                      is_featured: 1,
                    });
                    if (res.success) {
                      setNewAffTitle('');
                      setNewAffDesc('');
                      setNewAffUrl('');
                      setShowAddAff(false);
                      await loadData();
                    } else {
                      alert(res.error?.message || 'Không thể thêm vật phẩm affiliate');
                    }
                  } catch (err: any) {
                    alert(err.message);
                  }
                }}
                className="p-5 rounded-xl border border-emerald-500/30 bg-white dark:bg-[#0E1520] shadow-md space-y-4 text-xs font-sans-ui"
              >
                <h4 className="font-bold text-sm text-emerald-700 dark:text-emerald-400">
                  Thêm Vật Phẩm Tiếp Thị Liên Kết Tuyển Chọn
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-stone-600 dark:text-slate-400 mb-1 font-medium">Tên Tác Phẩm / Vật Phẩm *</label>
                    <input
                      type="text"
                      required
                      value={newAffTitle}
                      onChange={(e) => setNewAffTitle(e.target.value)}
                      placeholder="Ví dụ: Đạo Đức Kinh (Bản Khắc Mộc Thư Pháp)..."
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-white/10 bg-white dark:bg-slate-900 text-stone-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 dark:text-slate-400 mb-1 font-medium">Chuyên Mục</label>
                    <select
                      value={newAffCategory}
                      onChange={(e: any) => setNewAffCategory(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-white/10 bg-white dark:bg-slate-900 text-stone-900 dark:text-slate-100"
                    >
                      <option value="sach_triet_ly">Sách Triết Lý</option>
                      <option value="tra_dao">Trà Đạo</option>
                      <option value="tram_huong">Trầm Hương</option>
                      <option value="chuoi_hat">Chuỗi Hạt</option>
                      <option value="thien_dinh">Thiền Định</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-600 dark:text-slate-400 mb-1 font-medium">Nhà Cung Cấp / Nền Tảng</label>
                    <input
                      type="text"
                      value={newAffProvider}
                      onChange={(e) => setNewAffProvider(e.target.value)}
                      placeholder="Shopee / Tiki / Lazada / Cổ Phong Đường"
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-white/10 bg-white dark:bg-slate-900 text-stone-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 dark:text-slate-400 mb-1 font-medium">Giá Tham Khảo</label>
                    <input
                      type="text"
                      value={newAffPrice}
                      onChange={(e) => setNewAffPrice(e.target.value)}
                      placeholder="185.000 đ"
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-white/10 bg-white dark:bg-slate-900 text-stone-900 dark:text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 dark:text-slate-400 mb-1 font-medium">Ghi Chú Hoa Hồng</label>
                    <input
                      type="text"
                      value={newAffCommission}
                      onChange={(e) => setNewAffCommission(e.target.value)}
                      placeholder="Hoa hồng 10% quỹ máy chủ"
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-white/10 bg-white dark:bg-slate-900 text-stone-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-stone-600 dark:text-slate-400 mb-1 font-medium">Đường Dẫn Affiliate (Có Mã Tiếp Thị) *</label>
                    <input
                      type="text"
                      required
                      value={newAffUrl}
                      onChange={(e) => setNewAffUrl(e.target.value)}
                      placeholder="https://shopee.vn/universal-link/..."
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-white/10 bg-white dark:bg-slate-900 text-stone-900 dark:text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 dark:text-slate-400 mb-1 font-medium">Ảnh Thumbnail URL</label>
                    <input
                      type="text"
                      value={newAffImage}
                      onChange={(e) => setNewAffImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-white/10 bg-white dark:bg-slate-900 text-stone-900 dark:text-slate-100 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-stone-600 dark:text-slate-400 mb-1 font-medium">Mô Tả Ngắn Tác Phẩm / Vật Phẩm</label>
                    <textarea
                      rows={2}
                      value={newAffDesc}
                      onChange={(e) => setNewAffDesc(e.target.value)}
                      placeholder="Tác phẩm tinh tuyển về tư tưởng vô vi..."
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-white/10 bg-white dark:bg-slate-900 text-stone-900 dark:text-slate-100 font-reading text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-stone-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAddAff(false)}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-white/10 text-stone-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-white/5 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
                  >
                    Thêm Vật Phẩm Mới
                  </button>
                </div>
              </form>
            )}

            {/* Grid Vật Phẩm Tiếp Thị */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {affiliateList.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-stone-200 dark:border-white/[0.06] bg-white dark:bg-[#0D1219] flex gap-3 items-center justify-between"
                >
                  <div className="w-14 h-14 rounded-lg bg-stone-100 dark:bg-slate-900 overflow-hidden shrink-0 border border-stone-200 dark:border-white/10">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0 text-xs">
                    <div className="font-semibold text-stone-900 dark:text-slate-100 truncate">{item.title}</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-slate-400 mt-0.5">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.price_text}</span>
                      <span>·</span>
                      <span>{item.provider}</span>
                      <span>·</span>
                      <span className="font-mono text-stone-400">{item.clicks_count} clicks</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={item.affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded text-stone-500 hover:text-emerald-600 transition-colors"
                      title="Kiểm tra liên kết"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={async () => {
                        if (!confirm('Xóa vật phẩm tiếp thị liên kết này?')) return;
                        try {
                          await api.delete(`/api/v1/advertising/admin/affiliate-products/${item.id}`);
                          await loadData();
                        } catch (err: any) {
                          alert(err.message);
                        }
                      }}
                      className="p-1.5 rounded text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Xóa vật phẩm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. QUẢN LÝ QUỸ ĐỒNG HÀNH & GIEO DUYÊN PHÁT TÂM */}
          <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-white/10">
            <div>
              <h3 className="font-display text-base font-bold text-stone-900 dark:text-slate-100 flex items-center gap-2">
                <Heart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Bảng Ghi Nhận Công Đức & Ủng Hộ Phát Triển ({supportersList.length})</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-slate-400 font-reading">
                Danh sách các đạo hữu đã phát tâm gieo duyên duy trì máy chủ và lưu tàng thư tịch
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {supportersList.map((sup) => (
                <div
                  key={sup.id}
                  className="p-3.5 rounded-xl border border-stone-200 dark:border-white/[0.06] bg-white dark:bg-[#0D1219] shadow-xs text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-stone-900 dark:text-slate-100">{sup.supporter_name}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium text-[10px]">
                      {sup.tier_name}
                    </span>
                  </div>
                  <p className="text-stone-600 dark:text-slate-300 font-reading italic">
                    "{sup.message}"
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-stone-400 dark:text-slate-500 mt-2 pt-2 border-t border-stone-100 dark:border-white/[0.04]">
                    <span>{new Date(sup.created_at).toLocaleDateString('vi-VN')}</span>
                    {sup.amount && (
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        +{sup.amount.toLocaleString('vi-VN')} đ
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ==============================================================
          TAB 6: QUẢN LÝ MODULE (FEATURE FLAGS)
          ============================================================== */}
      {activeTab === 'modules' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-white dark:bg-[#0E141D] border border-emerald-500/20 text-xs text-stone-700 dark:text-slate-300 font-reading leading-relaxed shadow-xs">
            Kiến trúc module độc lập cho phép Quản trị viên bật/tắt các phân hệ trong thời gian thực.
            Khi bước sang Phase 2, các module Giác Ngộ (Awakening), Tu Tiên (Cultivation) và Luân Hồi Simulator sẽ được kích hoạt mà không ảnh hưởng tới Core.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((mod) => (
              <div
                key={mod.module_id}
                className="p-5 rounded-xl bg-white dark:bg-[#0D1219] border border-stone-200 dark:border-white/[0.06] flex items-start justify-between gap-4 shadow-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-sm font-bold text-stone-900 dark:text-slate-200">{mod.name}</h4>
                    <span className="text-[10px] font-mono text-stone-400 dark:text-slate-500">v{mod.version}</span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-slate-400 font-reading leading-relaxed">{mod.description}</p>
                  
                  <div className="pt-2 text-[11px] text-stone-400 dark:text-slate-500 font-mono">
                    ID: {mod.module_id} · Trạng thái: {mod.is_enabled === 1 ? 'ĐANG BẬT' : 'ĐANG TẮT'}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleModule(mod.module_id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex-shrink-0 ${
                    mod.is_enabled === 1
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-stone-200 dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:bg-stone-300'
                  }`}
                >
                  {mod.is_enabled === 1 ? 'Đang Bật' : 'Bật Module'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
