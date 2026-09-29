/**
 * Advertising & Affiliate Module Entry Point
 * Vạn Cổ Luân Hồi
 */

import { AppModule } from '../../core/module-loader.js';
import { advertisingRouter } from './api/advertising-router.js';
import { coreLogger } from '../../core/logger/index.js';

export const advertisingModule: AppModule = {
  id: 'advertising',
  name: 'Quảng Cáo & Tiếp Thị (Affiliate)',
  version: '1.0.0',
  description: 'Quản lý banner quảng cáo trượt ngang đa vị trí (header, content, bottom, footer) và liên kết tiếp thị duy trì nền tảng.',
  router: advertisingRouter,
  init: () => {
    coreLogger.info('ADVERTISING_MODULE', 'Advertising & Affiliate module initialized with horizontal sliding carousel support.');
  }
};
