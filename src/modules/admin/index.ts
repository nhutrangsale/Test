/**
 * Admin Module Entry Point
 * Vạn Cổ Luân Hồi
 */

import { AppModule } from '../../core/module-loader.js';
import { adminRouter } from './api/admin-router.js';
import { coreLogger } from '../../core/logger/index.js';

export const adminModule: AppModule = {
  id: 'admin',
  name: 'Bàn Quản Trị',
  version: '1.0.0',
  description: 'Quản trị bài viết, danh mục, thành viên và bật/tắt module.',
  router: adminRouter,
  init: () => {
    coreLogger.info('ADMIN_MODULE', 'Admin module initialized with security audit guard.');
  }
};
