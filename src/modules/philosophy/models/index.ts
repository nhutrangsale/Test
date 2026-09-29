/**
 * Philosophy Module Models & Types
 * Vạn Cổ Luân Hồi
 */

import { CategoryRow, PostRow } from '../../../core/database/index.js';

export interface CategoryDto extends CategoryRow {}

export interface PostDetailDto extends PostRow {
  category_name: string;
  category_slug: string;
  author_name: string;
  is_liked_by_me?: boolean;
  is_bookmarked_by_me?: boolean;
}

export interface PostListDto {
  posts: PostDetailDto[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PostFilterParams {
  categorySlug?: string;
  search?: string;
  sortBy?: 'newest' | 'popular' | 'views';
  page?: number;
  limit?: number;
}
