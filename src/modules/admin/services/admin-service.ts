/**
 * Admin Service
 * Quản trị nội dung, thành viên, duyệt tố cáo và cấu hình bật/tắt module
 * Vạn Cổ Luân Hồi
 */

import { coreDb, PostRow } from '../../../core/database/index.js';
import { coreModuleManager } from '../../../core/module-loader.js';
import { coreLogger } from '../../../core/logger/index.js';
import { CoreSecurity } from '../../../core/security/index.js';
import { PhilosophyService } from '../../philosophy/services/philosophy-service.js';

export class AdminService {
  /**
   * Thống kê tổng quan bảng điều khiển
   */
  public static getDashboardStats() {
    const totalPosts = coreDb.posts.length;
    const publishedPosts = coreDb.posts.filter(p => p.status === 'published').length;
    const totalUsers = coreDb.users.length;
    const totalComments = coreDb.comments.length;
    const pendingReports = coreDb.reports.filter(r => r.status === 'pending').length;
    const totalViews = coreDb.posts.reduce((sum, p) => sum + (p.view_count || 0), 0);
    const totalLikes = coreDb.posts.reduce((sum, p) => sum + (p.like_count || 0), 0);

    return {
      totalPosts,
      publishedPosts,
      totalUsers,
      totalComments,
      pendingReports,
      totalViews,
      totalLikes,
      categoriesCount: coreDb.categories.length,
      modulesCount: coreDb.moduleRegistry.length,
    };
  }

  /**
   * Quản lý bài viết (CRUD)
   */
  public static getAllPostsAdmin() {
    return coreDb.posts.map(post => {
      const cat = coreDb.categories.find(c => c.id === post.category_id);
      const author = coreDb.users.find(u => u.id === post.author_id);
      return {
        ...post,
        category_name: cat ? cat.name : 'Vạn Cổ Đạo',
        author_name: author ? author.display_name : 'Quản Trị Viên',
      };
    });
  }

  public static updatePost(postId: string, data: Partial<PostRow>): PostRow {
    const post = coreDb.posts.find(p => p.id === postId);
    if (!post) throw new Error('Không tìm thấy bài viết.');

    if (data.title) post.title = CoreSecurity.sanitizeText(data.title);
    if (data.excerpt) post.excerpt = CoreSecurity.sanitizeText(data.excerpt);
    if (data.content) post.content = data.content;
    if (data.category_id) post.category_id = data.category_id;
    if (data.status) post.status = data.status;
    if (data.cover_image) post.cover_image = data.cover_image;

    coreDb.save();
    coreLogger.audit('ADMIN', 'Post updated', undefined, { postId });
    return post;
  }

  public static deletePost(postId: string): boolean {
    const idx = coreDb.posts.findIndex(p => p.id === postId);
    if (idx === -1) throw new Error('Không tìm thấy bài viết.');

    coreDb.posts.splice(idx, 1);
    // Xóa liên quan comment và engagement
    (coreDb as any).data.comments = coreDb.comments.filter(c => c.post_id !== postId);
    (coreDb as any).data.engagements = coreDb.engagements.filter(e => e.post_id !== postId);

    coreDb.save();
    coreLogger.audit('ADMIN', 'Post deleted permanently', undefined, { postId });
    return true;
  }

  /**
   * Quản lý chuyên mục
   */
  public static createCategory(name: string, description: string, icon = 'Feather') {
    const cleanName = CoreSecurity.sanitizeText(name);
    const slug = PhilosophyService.generateSlug(cleanName);

    const exists = coreDb.categories.some(c => c.slug === slug);
    if (exists) throw new Error('Chuyên mục này đã tồn tại.');

    const newCat = {
      id: `cat_${Date.now()}`,
      name: cleanName,
      slug,
      description: CoreSecurity.sanitizeText(description),
      sort_order: coreDb.categories.length + 1,
      icon,
      is_active: 1,
    };

    coreDb.categories.push(newCat);
    coreDb.save();
    return newCat;
  }

  /**
   * Quản lý thành viên
   */
  public static getAllUsers() {
    return coreDb.users.map(({ password_hash, ...safeUser }) => safeUser);
  }

  public static toggleUserBan(userId: string): { isBanned: boolean } {
    const user = coreDb.users.find(u => u.id === userId);
    if (!user) throw new Error('Không tìm thấy thành viên.');
    if (user.role === 'admin') throw new Error('Không thể khóa tài khoản Quản trị viên tối cao.');

    user.status = user.status === 'banned' ? 'active' : 'banned';
    coreDb.save();

    coreLogger.audit('ADMIN', `User status set to ${user.status}`, undefined, { userId });
    return { isBanned: user.status === 'banned' };
  }

  /**
   * Quản lý Tố cáo
   */
  public static getReports() {
    return coreDb.reports.map(r => {
      const reporter = coreDb.users.find(u => u.id === r.reporter_id);
      let targetSummary = 'Mục đã bị xóa';

      if (r.target_type === 'comment') {
        const c = coreDb.comments.find(c => c.id === r.target_id);
        if (c) targetSummary = `Bình luận: "${c.content.substring(0, 50)}..."`;
      } else if (r.target_type === 'post') {
        const p = coreDb.posts.find(p => p.id === r.target_id);
        if (p) targetSummary = `Bài viết: "${p.title}"`;
      }

      return {
        ...r,
        reporter_name: reporter ? reporter.display_name : 'Vô danh',
        target_summary: targetSummary,
      };
    }).sort((a, b) => b.created_at - a.created_at);
  }

  public static resolveReport(reportId: string, action: 'dismiss' | 'delete_target'): boolean {
    const report = coreDb.reports.find(r => r.id === reportId);
    if (!report) throw new Error('Không tìm thấy bản ghi tố cáo.');

    if (action === 'delete_target') {
      if (report.target_type === 'comment') {
        const idx = coreDb.comments.findIndex(c => c.id === report.target_id);
        if (idx !== -1) coreDb.comments.splice(idx, 1);
      } else if (report.target_type === 'post') {
        const idx = coreDb.posts.findIndex(p => p.id === report.target_id);
        if (idx !== -1) coreDb.posts.splice(idx, 1);
      }
      report.status = 'resolved';
    } else {
      report.status = 'dismissed';
    }

    coreDb.save();
    coreLogger.audit('ADMIN', `Report ${reportId} resolved with action ${action}`);
    return true;
  }

  /**
   * Quản lý Modules
   */
  public static getModuleList() {
    return coreModuleManager.getAllModules();
  }

  public static toggleModule(moduleId: string): boolean {
    return coreModuleManager.toggleModule(moduleId);
  }
}
