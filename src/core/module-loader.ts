/**
 * Core Dynamic Module Loader & Registry
 * Cho phép cắm thêm (plug-and-play) module mới mà không sửa Core
 * Vạn Cổ Luân Hồi
 */

import { coreDb } from './database/index.js';
import { coreLogger } from './logger/index.js';
import { coreEventBus } from './events/index.js';

export interface AppModule {
  id: string;
  name: string;
  version: string;
  description: string;
  init: () => void | Promise<void>;
  router?: any;
}

class CoreModuleManager {
  private registeredModules = new Map<string, AppModule>();

  public register(module: AppModule) {
    this.registeredModules.set(module.id, module);
    coreLogger.info('MODULE_LOADER', `Registered module: [${module.id}] v${module.version}`);

    // Đảm bảo module có bản ghi trong registry DB
    const existing = coreDb.moduleRegistry.find(m => m.module_id === module.id);
    if (!existing) {
      coreDb.moduleRegistry.push({
        module_id: module.id,
        name: module.name,
        version: module.version,
        is_enabled: 1,
        description: module.description,
      });
      coreDb.save();
    }
  }

  public isEnabled(moduleId: string): boolean {
    const reg = coreDb.moduleRegistry.find(m => m.module_id === moduleId);
    return reg ? reg.is_enabled === 1 : false;
  }

  public toggleModule(moduleId: string, enable?: boolean): boolean {
    const reg = coreDb.moduleRegistry.find(m => m.module_id === moduleId);
    if (!reg) return false;

    const newState = enable !== undefined ? (enable ? 1 : 0) : (reg.is_enabled === 1 ? 0 : 1);
    reg.is_enabled = newState;
    coreDb.save();

    coreEventBus.emit('system.module_toggled', { moduleId, isEnabled: newState === 1 });
    coreLogger.audit('MODULE_LOADER', `Module [${moduleId}] status changed to ${newState === 1 ? 'ENABLED' : 'DISABLED'}`);
    return newState === 1;
  }

  public getAllModules() {
    return coreDb.moduleRegistry.map(reg => {
      const isRegistered = this.registeredModules.has(reg.module_id);
      return {
        ...reg,
        is_registered_in_runtime: isRegistered,
      };
    });
  }

  public async initializeAll() {
    coreLogger.info('MODULE_LOADER', 'Initializing all enabled modules...');
    for (const [id, mod] of this.registeredModules.entries()) {
      if (this.isEnabled(id)) {
        try {
          await mod.init();
          coreLogger.info('MODULE_LOADER', `Module [${id}] initialized successfully.`);
        } catch (err) {
          coreLogger.error('MODULE_LOADER', `Failed to initialize module [${id}]`, err);
        }
      } else {
        coreLogger.info('MODULE_LOADER', `Module [${id}] is currently DISABLED in registry.`);
      }
    }
  }
}

export const coreModuleManager = new CoreModuleManager();
