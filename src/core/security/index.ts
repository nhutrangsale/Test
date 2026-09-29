/**
 * Core Security & Anti-Spam Protection Engine
 * Vạn Cổ Luân Hồi
 */

import { coreLogger } from '../logger/index.js';

// Danh sách từ ngữ tục tĩu / xúc phạm / quảng cáo độc hại cần lọc
const SPAM_KEYWORDS = [
  'hack', 'casino', 'betting', 'cờ bạc', 'lừa đảo', 'mua bán nick', 'spam bot',
  'tài xỉu', 'xóc đĩa', 'viagra', 'doxxing'
];

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export class CoreSecurity {
  /**
   * Khử độc văn bản đầu vào (Sanitize against XSS & Injection)
   */
  public static sanitizeText(input: unknown): string {
    if (typeof input !== 'string') return '';
    return input
      .trim()
      .replace(/[<>]/g, '') // Loại bỏ thẻ HTML thô
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
  }

  /**
   * Kiểm tra và làm sạch nội dung bài viết / bình luận
   */
  public static validateContent(content: string, minLength = 2, maxLength = 5000): { isValid: boolean; sanitized: string; error?: string } {
    const sanitized = this.sanitizeText(content);
    if (sanitized.length < minLength) {
      return { isValid: false, sanitized, error: `Nội dung tối thiểu phải từ ${minLength} ký tự.` };
    }
    if (sanitized.length > maxLength) {
      return { isValid: false, sanitized, error: `Nội dung không được vượt quá ${maxLength} ký tự.` };
    }

    // Kiểm tra từ khóa rác / thô tục
    const lower = sanitized.toLowerCase();
    for (const keyword of SPAM_KEYWORDS) {
      if (lower.includes(keyword)) {
        return { isValid: false, sanitized, error: 'Nội dung chứa từ ngữ vi phạm thanh quy hoặc dấu hiệu rác.' };
      }
    }

    return { isValid: true, sanitized };
  }

  /**
   * Kiểm soát tần suất yêu cầu (Rate Limiting)
   */
  public static checkRateLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetAt) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (record.count >= limit) {
      coreLogger.warn('SECURITY', `Rate limit exceeded for key: ${key}`, { count: record.count, limit });
      return false;
    }

    record.count += 1;
    return true;
  }

  /**
   * Kiểm tra định dạng Email hợp lệ
   */
  public static isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /**
   * Kiểm tra độ an toàn mật khẩu
   */
  public static validatePassword(password: string): { isValid: boolean; error?: string } {
    if (!password || password.length < 6) {
      return { isValid: false, error: 'Mật khẩu phải chứa ít nhất 6 ký tự.' };
    }
    return { isValid: true };
  }
}

export const sanitizeText = (input: unknown): string => CoreSecurity.sanitizeText(input);
