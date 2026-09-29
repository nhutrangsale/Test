/**
 * Core Typed Asynchronous Event Bus
 * Đảm bảo các module hoàn toàn tách biệt, không phụ thuộc cứng
 */

import { coreLogger } from '../logger/index.js';

export interface CoreEventMap {
  'user.registered': { userId: string; email?: string; provider?: string };
  'user.logged_in': { userId: string; provider: string };
  'user.blocked': { blockerId: string; blockedId: string };
  
  'philosophy.post_created': { postId: string; authorId: string; category: string };
  'philosophy.post_viewed': { postId: string; userId?: string; categoryId: string };
  'philosophy.post_liked': { postId: string; userId: string; liked: boolean };
  
  'community.comment_added': { commentId: string; postId: string; userId: string };
  'community.report_submitted': { reportId: string; reporterId: string; targetId: string };
  
  'system.module_toggled': { moduleId: string; isEnabled: boolean };

  // Phase 2 extension events
  'awakening.enlightened': { userId: string; realm: string; score: number };
  'cultivation.breakthrough': { userId: string; level: number };
}

type EventKey = keyof CoreEventMap;
type EventHandler<K extends EventKey> = (payload: CoreEventMap[K]) => void | Promise<void>;

class CoreEventBus {
  private listeners: Map<EventKey, Set<EventHandler<any>>> = new Map();

  public on<K extends EventKey>(event: K, handler: EventHandler<K>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Trả về hàm hủy đăng ký (unsubscribe)
    return () => this.off(event, handler);
  }

  public off<K extends EventKey>(event: K, handler: EventHandler<K>): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  public async emit<K extends EventKey>(event: K, payload: CoreEventMap[K]): Promise<void> {
    coreLogger.info('CORE_EVENTS', `Emitting event: ${String(event)}`, { payload });
    
    const handlers = this.listeners.get(event);
    if (!handlers || handlers.size === 0) {
      return;
    }

    const promises = Array.from(handlers).map(async (handler) => {
      try {
        await handler(payload);
      } catch (err) {
        coreLogger.error('CORE_EVENTS', `Error executing listener for event: ${String(event)}`, err);
      }
    });

    await Promise.allSettled(promises);
  }
}

export const coreEventBus = new CoreEventBus();
