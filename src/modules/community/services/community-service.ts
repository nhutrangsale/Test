/**
 * Community Service
 * Xử lý Like, Bookmark, Bình luận văn bản thuần, Tố cáo, Chặn người dùng và Chống spam
 * Vạn Cổ Luân Hồi
 */

import { coreDb, CommentRow, EngagementRow, ReportRow, UserBlockRow } from '../../../core/database/index.js';
import { coreEventBus } from '../../../core/events/index.js';
import { CoreSecurity } from '../../../core/security/index.js';
import { coreLogger } from '../../../core/logger/index.js';
import { CommentDto, BookmarkItemDto } from '../models/index.js';

export class CommunityService {
  /**
   * Bật / Tắt trạng thái Thích (Like) bài viết
   */
  public static toggleLike(userId: string, postId: string): { liked: boolean; count: number } {
    const post = coreDb.posts.find(p => p.id === postId);
    if (!post) throw new Error('Bài viết không tồn tại.');

    const existingIndex = coreDb.engagements.findIndex(
      e => e.user_id === userId && e.post_id === postId && e.type === 'like'
    );

    let liked = false;
    if (existingIndex >= 0) {
      // Bỏ thích
      coreDb.engagements.splice(existingIndex, 1);
      post.like_count = Math.max(0, post.like_count - 1);
      liked = false;
    } else {
      // Thích
      const engagement: EngagementRow = {
        id: `eng_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        user_id: userId,
        post_id: postId,
        type: 'like',
        created_at: Date.now(),
      };
      coreDb.engagements.push(engagement);
      post.like_count += 1;
      liked = true;
    }

    coreDb.save();
    coreEventBus.emit('philosophy.post_liked', { postId, userId, liked });

    return { liked, count: post.like_count };
  }

  /**
   * Bật / Tắt lưu trữ (Bookmark) bài viết
   */
  public static toggleBookmark(userId: string, postId: string): { bookmarked: boolean } {
    const post = coreDb.posts.find(p => p.id === postId);
    if (!post) throw new Error('Bài viết không tồn tại.');

    const existingIndex = coreDb.engagements.findIndex(
      e => e.user_id === userId && e.post_id === postId && e.type === 'bookmark'
    );

    let bookmarked = false;
    if (existingIndex >= 0) {
      coreDb.engagements.splice(existingIndex, 1);
      bookmarked = false;
    } else {
      coreDb.engagements.push({
        id: `bmk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        user_id: userId,
        post_id: postId,
        type: 'bookmark',
        created_at: Date.now(),
      });
      bookmarked = true;
    }

    coreDb.save();
    return { bookmarked };
  }

  /**
   * Lấy danh sách bình luận của bài viết (lọc người dùng bị chặn)
   */
  public static getComments(postId: string, currentUserId?: string): CommentDto[] {
    // Lấy danh sách người bị người xem chặn
    const blockedUserIds = currentUserId
      ? coreDb.userBlocks.filter(b => b.blocker_id === currentUserId).map(b => b.blocked_id)
      : [];

    const rawComments = coreDb.comments.filter(
      c => c.post_id === postId && c.status === 'active' && !blockedUserIds.includes(c.user_id)
    );

    const commentMap = new Map<string, CommentDto>();
    const topLevel: CommentDto[] = [];

    // Bước 1: Tạo map các comment
    for (const c of rawComments) {
      const author = coreDb.users.find(u => u.id === c.user_id);
      const dto: CommentDto = {
        ...c,
        author_name: author ? author.display_name : 'Đạo Hữu',
        author_avatar: author ? author.avatar_url : 'https://api.dicebear.com/7.x/bottts/svg?seed=guest',
        author_role: author ? author.role : 'user',
        is_mine: currentUserId ? c.user_id === currentUserId : false,
        replies: [],
      };
      commentMap.set(c.id, dto);
    }

    // Bước 2: Tổ chức cây phân cấp (Replies)
    for (const dto of commentMap.values()) {
      if (dto.parent_id && commentMap.has(dto.parent_id)) {
        commentMap.get(dto.parent_id)!.replies!.push(dto);
      } else {
        topLevel.push(dto);
      }
    }

    // Sắp xếp mới nhất lên đầu
    return topLevel.sort((a, b) => b.created_at - a.created_at);
  }

  /**
   * Thêm bình luận văn bản thuần mới (chống spam, giới hạn tần suất)
   */
  public static addComment(userId: string, postId: string, content: string, parentId?: string | null): CommentDto {
    const post = coreDb.posts.find(p => p.id === postId);
    if (!post) throw new Error('Bài viết không tồn tại.');

    // Rate limiting: tối đa 5 comment / phút cho mỗi user
    const rateOk = CoreSecurity.checkRateLimit(`comment_${userId}`, 5, 60 * 1000);
    if (!rateOk) {
      throw new Error('Bạn đang gửi bình luận quá nhanh. Hãy tịnh tâm chờ 1 phút.');
    }

    // Kiểm tra & làm sạch văn bản (chỉ cho phép văn bản thuần)
    const validation = CoreSecurity.validateContent(content, 2, 800);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Nội dung bình luận không hợp lệ.');
    }

    // Kiểm tra parentId nếu có
    if (parentId) {
      const parent = coreDb.comments.find(c => c.id === parentId && c.post_id === postId);
      if (!parent) throw new Error('Không tìm thấy bình luận gốc để hồi đáp.');
    }

    const newComment: CommentRow = {
      id: `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      post_id: postId,
      user_id: userId,
      parent_id: parentId || null,
      content: validation.sanitized,
      status: 'active',
      created_at: Date.now(),
    };

    coreDb.comments.push(newComment);
    coreDb.save();

    coreEventBus.emit('community.comment_added', {
      commentId: newComment.id,
      postId,
      userId,
    });

    const author = coreDb.users.find(u => u.id === userId);
    return {
      ...newComment,
      author_name: author ? author.display_name : 'Đạo Hữu',
      author_avatar: author ? author.avatar_url : 'https://api.dicebear.com/7.x/bottts/svg?seed=guest',
      author_role: author ? author.role : 'user',
      is_mine: true,
      replies: [],
    };
  }

  /**
   * Xóa bình luận (chỉ tác giả hoặc admin)
   */
  public static deleteComment(userId: string, commentId: string): boolean {
    const commentIndex = coreDb.comments.findIndex(c => c.id === commentId);
    if (commentIndex === 0 && coreDb.comments.length === 0) return false;
    if (commentIndex === -1) throw new Error('Không tìm thấy bình luận.');

    const comment = coreDb.comments[commentIndex];
    const user = coreDb.users.find(u => u.id === userId);

    const isAuthor = comment.user_id === userId;
    const isAdmin = user && (user.role === 'admin' || user.role === 'moderator');

    if (!isAuthor && !isAdmin) {
      throw new Error('Bạn không có quyền xóa bình luận này.');
    }

    coreDb.comments.splice(commentIndex, 1);
    coreDb.save();

    coreLogger.audit('COMMUNITY', 'Comment deleted', userId, { commentId });
    return true;
  }

  /**
   * Tố cáo nội dung vi phạm
   */
  public static createReport(reporterId: string, targetType: 'post' | 'comment', targetId: string, reason: string): ReportRow {
    const cleanReason = CoreSecurity.sanitizeText(reason);
    if (!cleanReason || cleanReason.length < 5) {
      throw new Error('Vui lòng nêu rõ lý do tố cáo tối thiểu 5 ký tự.');
    }

    const report: ReportRow = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      reporter_id: reporterId,
      target_type: targetType,
      target_id: targetId,
      reason: cleanReason,
      status: 'pending',
      created_at: Date.now(),
    };

    coreDb.reports.push(report);
    coreDb.save();

    coreEventBus.emit('community.report_submitted', {
      reportId: report.id,
      reporterId,
      targetId,
    });

    coreLogger.audit('COMMUNITY', 'Report submitted', reporterId, { targetType, targetId, reason: cleanReason });
    return report;
  }

  /**
   * Chặn người dùng khác
   */
  public static blockUser(blockerId: string, blockedId: string): boolean {
    if (blockerId === blockedId) {
      throw new Error('Không thể tự chặn chính mình.');
    }

    const alreadyBlocked = coreDb.userBlocks.some(
      b => b.blocker_id === blockerId && b.blocked_id === blockedId
    );

    if (alreadyBlocked) {
      return true;
    }

    const blockRecord: UserBlockRow = {
      id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      blocker_id: blockerId,
      blocked_id: blockedId,
      created_at: Date.now(),
    };

    coreDb.userBlocks.push(blockRecord);
    coreDb.save();

    coreEventBus.emit('user.blocked', { blockerId, blockedId });
    return true;
  }

  /**
   * Lấy danh sách bài viết đã bookmark của người dùng
   */
  public static getUserBookmarks(userId: string): BookmarkItemDto[] {
    const bookmarkEngagements = coreDb.engagements
      .filter(e => e.user_id === userId && e.type === 'bookmark')
      .sort((a, b) => b.created_at - a.created_at);

    const items: BookmarkItemDto[] = [];
    for (const b of bookmarkEngagements) {
      const post = coreDb.posts.find(p => p.id === b.post_id && p.status === 'published');
      if (post) {
        const cat = coreDb.categories.find(c => c.id === post.category_id);
        items.push({
          post_id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          category_name: cat ? cat.name : 'Vạn Cổ Đạo',
          created_at: b.created_at,
        });
      }
    }

    return items;
  }
}
