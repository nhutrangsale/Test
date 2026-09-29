/**
 * Awakening Module (Hệ Thống Giác Ngộ - Stub Shell cho Phase 2)
 * Minh họa cơ chế cắm thêm module vào Core Event Bus mà không cần sửa Core
 * Vạn Cổ Luân Hồi
 */

import { AppModule, coreModuleManager } from '../../core/module-loader.js';
import { coreEventBus } from '../../core/events/index.js';
import { coreLogger } from '../../core/logger/index.js';

export const awakeningModule: AppModule = {
  id: 'awakening',
  name: 'Hệ Thống Giác Ngộ',
  version: '2.0.0-alpha',
  description: 'Tích lũy Điểm Ngộ Tính và khai mở chân tâm khi chiêm nghiệm triết lý (Phase 2).',
  init: () => {
    // Đăng ký lắng nghe sự kiện từ Philosophy Module mà không import trực tiếp
    coreEventBus.on('philosophy.post_viewed', async (data) => {
      if (!coreModuleManager.isEnabled('awakening')) return;
      
      coreLogger.info('AWAKENING_MODULE', `[Giác Ngộ Phase 2] User ${data.userId || 'Guest'} đang chiêm nghiệm bài viết ${data.postId}. Tích lũy căn cơ ngộ đạo.`);
      
      // Giả định tính điểm ngộ đạo khi đạt điều kiện
      if (data.userId) {
        coreEventBus.emit('awakening.enlightened', {
          userId: data.userId,
          realm: 'Sơ Ngộ Chân Lý',
          score: 10,
        });
      }
    });

    coreLogger.info('AWAKENING_MODULE', 'Awakening module listeners ready for Phase 2 activation.');
  }
};
