/**
 * Community API Router
 * Vạn Cổ Luân Hồi
 */

import { Router, Request, Response } from 'express';
import { CommunityService } from '../services/community-service.js';
import { CoreAuthService } from '../../../core/auth/index.js';
import { coreDb } from '../../../core/database/index.js';

export const communityRouter = Router();

// Middleware kiểm tra xác thực bắt buộc
const requireAuth = (req: Request, res: Response, next: () => void) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.cookies?.session_token as string);
  
  if (!token) {
    return res.status(401).json({ success: false, error: { message: 'Vui lòng đăng nhập để thực hiện tác vụ này.' } });
  }

  const user = CoreAuthService.validateSession(token);
  if (!user) {
    return res.status(401).json({ success: false, error: { message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.' } });
  }

  (req as any).user = user;
  next();
};

const optionalAuth = (req: Request, res: Response, next: () => void) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.cookies?.session_token as string);
  if (token) {
    const user = CoreAuthService.validateSession(token);
    if (user) {
      (req as any).user = user;
    }
  }
  next();
};

// Bật/tắt thích bài viết
communityRouter.post('/posts/:id/like', requireAuth, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const postId = req.params.id;
    const result = CommunityService.toggleLike(userId, postId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// Bật/tắt lưu trữ bài viết
communityRouter.post('/posts/:id/bookmark', requireAuth, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const postId = req.params.id;
    const result = CommunityService.toggleBookmark(userId, postId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// Lấy danh sách bình luận (Người chưa đăng nhập vẫn đọc được)
communityRouter.get('/posts/:id/comments', optionalAuth, (req: Request, res: Response) => {
  const currentUserId = (req as any).user?.id;
  const comments = CommunityService.getComments(req.params.id, currentUserId);
  res.json({ success: true, data: comments });
});

// Gửi bình luận mới (chỉ nhận văn bản thuần)
communityRouter.post('/posts/:id/comments', requireAuth, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const postId = req.params.id;
    const { content, parentId } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ success: false, error: { message: 'Nội dung bình luận không được để trống.' } });
    }

    const comment = CommunityService.addComment(userId, postId, content, parentId);
    res.json({ success: true, data: comment });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// Xóa bình luận
communityRouter.delete('/comments/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const commentId = req.params.id;
    CommunityService.deleteComment(userId, commentId);
    res.json({ success: true, message: 'Đã xóa bình luận thành công.' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// Gửi báo cáo / tố cáo vi phạm
communityRouter.post('/reports', requireAuth, (req: Request, res: Response) => {
  try {
    const reporterId = (req as any).user.id;
    const { targetType, targetId, reason } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ success: false, error: { message: 'Vui lòng điền đầy đủ thông tin tố cáo.' } });
    }

    const report = CommunityService.createReport(reporterId, targetType, targetId, reason);
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// Chặn người dùng
communityRouter.post('/users/:id/block', requireAuth, (req: Request, res: Response) => {
  try {
    const blockerId = (req as any).user.id;
    const blockedId = req.params.id;
    CommunityService.blockUser(blockerId, blockedId);
    res.json({ success: true, message: 'Đã chặn người dùng này thành công.' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

// Lấy danh sách bookmark của người dùng hiện tại
communityRouter.get('/bookmarks', requireAuth, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const bookmarks = CommunityService.getUserBookmarks(userId);
  res.json({ success: true, data: bookmarks });
});

// Lấy thông báo (hệ thống và tương tác cá nhân)
communityRouter.get('/notifications', optionalAuth, (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const list = coreDb.notifications
    .filter(n => n.user_id === 'all' || (userId && n.user_id === userId))
    .sort((a, b) => b.created_at - a.created_at);
  res.json({ success: true, data: list });
});

// Đánh dấu đã đọc thông báo
communityRouter.post('/notifications/:id/read', (req: Request, res: Response) => {
  const notif = coreDb.notifications.find(n => n.id === req.params.id);
  if (notif) {
    notif.is_read = 1;
    coreDb.save();
  }
  res.json({ success: true });
});
