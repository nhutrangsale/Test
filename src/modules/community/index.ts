/**
 * Community Module Entry Point
 * Vạn Cổ Luân Hồi
 */

import { AppModule } from '../../core/module-loader.js';
import { communityRouter } from './api/community-router.js';
import { coreLogger } from '../../core/logger/index.js';

export const communityModule: AppModule = {
  id: 'community',
  name: 'Cộng Đồng Đàm Đạo',
  version: '1.0.0',
  description: 'Tương tác like, bookmark, bình luận văn bản thuần, báo cáo vi phạm và chống spam.',
  router: communityRouter,
  init: () => {
    coreLogger.info('COMMUNITY_MODULE', 'Community module initialized with anti-spam & text-only comment rules.');
  }
};
