/**
 * Admin API Router
 * Vạn Cổ Luân Hồi
 */

import { Router, Request, Response } from 'express';
import { AdminService } from '../services/admin-service.js';
import { PhilosophyService } from '../../philosophy/services/philosophy-service.js';
import { CoreAuthService } from '../../../core/auth/index.js';

export const adminRouter = Router();

// Middleware bắt buộc vai trò Admin
const requireAdmin = (req: Request, res: Response, next: () => void) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.cookies?.session_token as string);

  if (!token) {
    return res.status(401).json({ success: false, error: { message: 'Yêu cầu quyền Quản trị viên để truy cập.' } });
  }

  const user = CoreAuthService.validateSession(token);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, error: { message: 'Truy cập bị từ chối. Bạn không có quyền Quản trị viên.' } });
  }

  (req as any).user = user;
  next();
};

adminRouter.use(requireAdmin);

// Thống kê tổng quan
adminRouter.get('/dashboard', (req: Request, res: Response) => {
  const stats = AdminService.getDashboardStats();
  res.json({ success: true, data: stats });
});

// Danh sách tất cả bài viết
adminRouter.get('/posts', (req: Request, res: Response) => {
  const posts = AdminService.getAllPostsAdmin();
  res.json({ success: true, data: posts });
});

// Thêm bài viết mới
adminRouter.post('/posts', (req: Request, res: Response) => {
  try {
    const authorId = (req as any).user.id;
    const { title, slug, excerpt, content, categoryId, coverImage } = req.body;

    if (!title || !content || !categoryId) {
      return res.status(400).json({ success: false, error: { message: 'Vui lòng nhập đầy đủ tiêu đề, nội dung và chuyên mục.' } });
    }

    const post = PhilosophyService.createPost({
      title,
      slug,
      excerpt: excerpt || title,
      content,
      categoryId,
      coverImage,
      authorId,
    });

    res.json({ success: true, data: post });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// Cập nhật bài viết
adminRouter.put('/posts/:id', (req: Request, res: Response) => {
  try {
    const updated = AdminService.updatePost(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// Xóa bài viết
adminRouter.delete('/posts/:id', (req: Request, res: Response) => {
  try {
    AdminService.deletePost(req.params.id);
    res.json({ success: true, message: 'Đã xóa bài viết vĩnh viễn.' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// Thêm chuyên mục mới
adminRouter.post('/categories', (req: Request, res: Response) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) return res.status(400).json({ success: false, error: { message: 'Tên chuyên mục là bắt buộc.' } });
    const cat = AdminService.createCategory(name, description || '', icon);
    res.json({ success: true, data: cat });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// Danh sách thành viên
adminRouter.get('/users', (req: Request, res: Response) => {
  const users = AdminService.getAllUsers();
  res.json({ success: true, data: users });
});

// Khóa / Mở khóa thành viên
adminRouter.post('/users/:id/toggle-ban', (req: Request, res: Response) => {
  try {
    const result = AdminService.toggleUserBan(req.params.id);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// Danh sách tố cáo
adminRouter.get('/reports', (req: Request, res: Response) => {
  const reports = AdminService.getReports();
  res.json({ success: true, data: reports });
});

// Xử lý tố cáo
adminRouter.post('/reports/:id/resolve', (req: Request, res: Response) => {
  try {
    const { action } = req.body;
    AdminService.resolveReport(req.params.id, action || 'dismiss');
    res.json({ success: true, message: 'Đã xử lý tố cáo thành công.' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// Danh sách Modules
adminRouter.get('/modules', (req: Request, res: Response) => {
  const modules = AdminService.getModuleList();
  res.json({ success: true, data: modules });
});

// Bật / Tắt module
adminRouter.patch('/modules/:id/toggle', (req: Request, res: Response) => {
  try {
    const isEnabled = AdminService.toggleModule(req.params.id);
    res.json({ success: true, data: { moduleId: req.params.id, isEnabled } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});
