/**
 * Philosophy Service
 * Xử lý nghiệp vụ bài viết triết lý, chuyên mục và tối ưu URL SEO
 * Vạn Cổ Luân Hồi
 */

import { coreDb, PostRow } from '../../../core/database/index.js';
import { coreEventBus } from '../../../core/events/index.js';
import { CoreSecurity } from '../../../core/security/index.js';
import { CategoryDto, PostDetailDto, PostFilterParams, PostListDto } from '../models/index.js';

export class PhilosophyService {
  /**
   * Lấy danh sách chuyên mục triết lý
   */
  public static getCategories(): CategoryDto[] {
    return coreDb.categories
      .filter(c => c.is_active === 1)
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  /**
   * Lấy chi tiết chuyên mục theo slug
   */
  public static getCategoryBySlug(slug: string): CategoryDto | null {
    const cat = coreDb.categories.find(c => c.slug === slug.trim().toLowerCase());
    return cat || null;
  }

  /**
   * Lấy danh sách bài viết theo bộ lọc và phân trang
   */
  public static getPosts(params: PostFilterParams = {}, currentUserId?: string): PostListDto {
    const { categorySlug, search, sortBy = 'newest', page = 1, limit = 10 } = params;

    let filtered = coreDb.posts.filter(p => p.status === 'published');

    if (categorySlug) {
      const cat = coreDb.categories.find(c => c.slug === categorySlug);
      if (cat) {
        filtered = filtered.filter(p => p.category_id === cat.id);
      }
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.excerpt.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
      );
    }

    // Sắp xếp
    if (sortBy === 'popular') {
      filtered.sort((a, b) => (b.like_count + b.view_count * 0.1) - (a.like_count + a.view_count * 0.1));
    } else if (sortBy === 'views') {
      filtered.sort((a, b) => b.view_count - a.view_count);
    } else {
      // Mới nhất mặc định
      filtered.sort((a, b) => b.published_at - a.published_at);
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const pagedRows = filtered.slice(startIndex, startIndex + limit);

    const posts: PostDetailDto[] = pagedRows.map(post => this.enrichPost(post, currentUserId));

    return {
      posts,
      total,
      page,
      totalPages,
    };
  }

  /**
   * Lấy bài viết tiêu biểu cho trang chủ
   */
  public static getFeaturedPosts(currentUserId?: string): { leadPost: PostDetailDto | null; secondary: PostDetailDto[] } {
    const published = coreDb.posts
      .filter(p => p.status === 'published')
      .sort((a, b) => (b.like_count * 2 + b.view_count) - (a.like_count * 2 + a.view_count));

    if (published.length === 0) {
      return { leadPost: null, secondary: [] };
    }

    const leadPost = this.enrichPost(published[0], currentUserId);
    const secondary = published.slice(1, 4).map(p => this.enrichPost(p, currentUserId));

    return { leadPost, secondary };
  }

  /**
   * Lấy chi tiết bài viết qua Slug (SEO URL)
   */
  public static getPostBySlug(slug: string, currentUserId?: string): PostDetailDto | null {
    const cleanSlug = slug.trim().toLowerCase();
    const post = coreDb.posts.find(p => p.slug === cleanSlug && p.status === 'published');
    if (!post) return null;

    // Tăng lượt xem
    post.view_count += 1;
    coreDb.save();

    // Phát sự kiện lên Event Bus
    coreEventBus.emit('philosophy.post_viewed', {
      postId: post.id,
      userId: currentUserId,
      categoryId: post.category_id,
    });

    return this.enrichPost(post, currentUserId);
  }

  /**
   * Bổ sung thông tin danh mục, tác giả và trạng thái tương tác của user
   */
  private static enrichPost(post: PostRow, currentUserId?: string): PostDetailDto {
    const category = coreDb.categories.find(c => c.id === post.category_id);
    const author = coreDb.users.find(u => u.id === post.author_id);

    let is_liked_by_me = false;
    let is_bookmarked_by_me = false;

    if (currentUserId) {
      is_liked_by_me = coreDb.engagements.some(
        e => e.user_id === currentUserId && e.post_id === post.id && e.type === 'like'
      );
      is_bookmarked_by_me = coreDb.engagements.some(
        e => e.user_id === currentUserId && e.post_id === post.id && e.type === 'bookmark'
      );
    }

    return {
      ...post,
      category_name: category ? category.name : 'Vạn Cổ Đạo',
      category_slug: category ? category.slug : 'nhan-sinh',
      author_name: author ? author.display_name : 'Vạn Cổ Đạo Nhân',
      is_liked_by_me,
      is_bookmarked_by_me,
    };
  }

  /**
   * Tạo slug thân thiện SEO
   */
  public static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  /**
   * Tạo bài viết mới (Admin)
   */
  public static createPost(data: {
    title: string;
    slug?: string;
    excerpt: string;
    content: string;
    categoryId: string;
    coverImage?: string;
    authorId: string;
  }): PostRow {
    const slug = data.slug && data.slug.trim() 
      ? this.generateSlug(data.slug) 
      : this.generateSlug(data.title);

    const newPost: PostRow = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: CoreSecurity.sanitizeText(data.title),
      slug: slug || `bai-viet-${Date.now()}`,
      excerpt: CoreSecurity.sanitizeText(data.excerpt),
      content: data.content,
      category_id: data.categoryId,
      cover_image: data.coverImage || '/src/assets/images/hero_ancient_reincarnation_1790677370100.jpg',
      author_id: data.authorId,
      published_at: Date.now(),
      status: 'published',
      view_count: 0,
      like_count: 0,
    };

    coreDb.posts.unshift(newPost);
    coreDb.save();

    coreEventBus.emit('philosophy.post_created', {
      postId: newPost.id,
      authorId: newPost.author_id,
      category: newPost.category_id,
    });

    return newPost;
  }
}
