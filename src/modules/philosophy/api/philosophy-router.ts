/**
 * Philosophy API Router
 * Vạn Cổ Luân Hồi
 */

import { Router, Request, Response } from 'express';
import { PhilosophyService } from '../services/philosophy-service.js';
import { CoreAuthService } from '../../../core/auth/index.js';

export const philosophyRouter = Router();

// Middleware lấy user hiện tại từ token nếu có (không bắt buộc đăng nhập để xem)
const extractUser = (req: Request): string | undefined => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.cookies?.session_token as string);
  if (!token) return undefined;
  const session = CoreAuthService.validateSession(token);
  return session ? session.id : undefined;
};

// Lấy danh sách 7 chuyên mục
philosophyRouter.get('/categories', (req: Request, res: Response) => {
  const categories = PhilosophyService.getCategories();
  res.json({ success: true, data: categories });
});

// Lấy thông tin chuyên mục theo slug
philosophyRouter.get('/categories/:slug', (req: Request, res: Response) => {
  const cat = PhilosophyService.getCategoryBySlug(req.params.slug);
  if (!cat) {
    return res.status(404).json({ success: false, error: { message: 'Không tìm thấy chuyên mục này.' } });
  }
  res.json({ success: true, data: cat });
});

// Lấy danh sách bài viết (phân trang, lọc, tìm kiếm)
philosophyRouter.get('/posts', (req: Request, res: Response) => {
  const currentUserId = extractUser(req);
  const categorySlug = req.query.category as string | undefined;
  const search = req.query.q as string | undefined;
  const sortBy = (req.query.sort as 'newest' | 'popular' | 'views') || 'newest';
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;

  const result = PhilosophyService.getPosts({
    categorySlug,
    search,
    sortBy,
    page,
    limit,
  }, currentUserId);

  res.json({ success: true, data: result });
});

// Lấy bài viết tiêu biểu cho trang chủ
philosophyRouter.get('/posts/featured', (req: Request, res: Response) => {
  const currentUserId = extractUser(req);
  const featured = PhilosophyService.getFeaturedPosts(currentUserId);
  res.json({ success: true, data: featured });
});

// Lấy bài viết theo slug SEO
philosophyRouter.get('/posts/by-slug/:slug', (req: Request, res: Response) => {
  const currentUserId = extractUser(req);
  const post = PhilosophyService.getPostBySlug(req.params.slug, currentUserId);
  if (!post) {
    return res.status(404).json({ success: false, error: { message: 'Bài viết không tồn tại hoặc đã quy ẩn.' } });
  }
  res.json({ success: true, data: post });
});
