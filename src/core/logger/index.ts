/**
 * Core Structured Logger
 * Ghi nhận nhật ký kiểm toán (Audit), lỗi (Error), cảnh báo (Warn) và hoạt động (Info)
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'AUDIT';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  context?: Record<string, unknown>;
}

class CoreLogger {
  private formatLog(level: LogLevel, module: string, message: string, context?: Record<string, unknown>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      context,
    };
  }

  public info(module: string, message: string, context?: Record<string, unknown>) {
    const entry = this.formatLog('INFO', module, message, context);
    console.log(`[${entry.timestamp}] [INFO] [${module}] ${message}`, context ? JSON.stringify(context) : '');
  }

  public warn(module: string, message: string, context?: Record<string, unknown>) {
    const entry = this.formatLog('WARN', module, message, context);
    console.warn(`[${entry.timestamp}] [WARN] [${module}] ${message}`, context ? JSON.stringify(context) : '');
  }

  public error(module: string, message: string, error?: unknown, context?: Record<string, unknown>) {
    const entry = this.formatLog('ERROR', module, message, {
      ...context,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
    });
    console.error(`[${entry.timestamp}] [ERROR] [${module}] ${message}`, entry.context);
  }

  public audit(module: string, action: string, userId?: string, details?: Record<string, unknown>) {
    const entry = this.formatLog('AUDIT', module, `Audit Action: ${action}`, { userId, ...details });
    console.info(`[${entry.timestamp}] [AUDIT] [${module}] User: ${userId || 'anonymous'} -> ${action}`, details || '');
  }
}

export const coreLogger = new CoreLogger();
