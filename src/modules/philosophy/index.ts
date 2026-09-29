/**
 * Philosophy Module Entry Point
 * Vạn Cổ Luân Hồi
 */

import { AppModule } from '../../core/module-loader.js';
import { philosophyRouter } from './api/philosophy-router.js';
import { coreLogger } from '../../core/logger/index.js';

export const philosophyModule: AppModule = {
  id: 'philosophy',
  name: 'Triết Lý Nhân Sinh',
  version: '1.0.0',
  description: 'Module nội dung triết học cổ phong, 7 chuyên mục, SEO và chiêm nghiệm.',
  router: philosophyRouter,
  init: () => {
    coreLogger.info('PHILOSOPHY_MODULE', 'Philosophy module initialized with 7 core categories.');
  }
};
