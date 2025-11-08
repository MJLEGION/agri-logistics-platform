// src/utils/logger.ts
// Professional Logging Utility - Replace all console.log statements

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

interface LoggerConfig {
  level: LogLevel;
  enabled: boolean;
  showTimestamp: boolean;
  showCaller: boolean;
}

class Logger {
  private config: LoggerConfig = {
    level: __DEV__ ? 'debug' : 'error', // Only errors in production
    enabled: true,
    showTimestamp: true,
    showCaller: __DEV__, // Only show caller in development
  };

  private levels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    none: 4,
  };

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return this.levels[level] >= this.levels[this.config.level];
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) return;

    const timestamp = this.config.showTimestamp
      ? `[${new Date().toISOString().split('T')[1].split('.')[0]}]`
      : '';

    const prefix = `${timestamp} [${level.toUpperCase()}]`;

    switch (level) {
      case 'debug':
        console.log(prefix, message, ...args);
        break;
      case 'info':
        console.info(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'error':
        console.error(prefix, message, ...args);
        break;
    }
  }

  /**
   * Debug logs - only shown in development
   * Use for detailed debugging information
   */
  debug(message: string, ...args: any[]): void {
    this.formatMessage('debug', message, ...args);
  }

  /**
   * Info logs - general information
   * Use for important app flow information
   */
  info(message: string, ...args: any[]): void {
    this.formatMessage('info', message, ...args);
  }

  /**
   * Warning logs - non-critical issues
   * Use for recoverable errors or deprecation warnings
   */
  warn(message: string, ...args: any[]): void {
    this.formatMessage('warn', message, ...args);
  }

  /**
   * Error logs - critical issues
   * Use for errors that need immediate attention
   */
  error(message: string, error?: any, ...args: any[]): void {
    this.formatMessage('error', message, error, ...args);

    // In production, you would send this to a service like Sentry
    if (!__DEV__ && error) {
      // TODO: Send to error tracking service
      // Sentry.captureException(error);
    }
  }

  /**
   * Performance logging
   */
  time(label: string): void {
    if (this.shouldLog('debug')) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.shouldLog('debug')) {
      console.timeEnd(label);
    }
  }

  /**
   * Configure logger settings
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Disable all logging
   */
  disable(): void {
    this.config.enabled = false;
  }

  /**
   * Enable logging
   */
  enable(): void {
    this.config.enabled = true;
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports
export const log = {
  debug: (message: string, ...args: any[]) => logger.debug(message, ...args),
  info: (message: string, ...args: any[]) => logger.info(message, ...args),
  warn: (message: string, ...args: any[]) => logger.warn(message, ...args),
  error: (message: string, error?: any, ...args: any[]) => logger.error(message, error, ...args),
  time: (label: string) => logger.time(label),
  timeEnd: (label: string) => logger.timeEnd(label),
};

export default logger;
