/**
 * Community Module Models & Types
 * Vạn Cổ Luân Hồi
 */

import { CommentRow, ReportRow } from '../../../core/database/index.js';

export interface CommentDto extends CommentRow {
  author_name: string;
  author_avatar: string;
  author_role: string;
  is_mine: boolean;
  replies?: CommentDto[];
}

export interface ReportCreateDto {
  targetType: 'post' | 'comment';
  targetId: string;
  reason: string;
}

export interface BookmarkItemDto {
  post_id: string;
  title: string;
  slug: string;
  excerpt: string;
  category_name: string;
  created_at: number;
}
