/**
 * نظام Logging للمشروع
 * يدعم مستويات مختلفة من اللوجات ويمكن دمجه مع خدمات خارجية
 */

const isDev = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * تنسيق الرسالة مع timestamp
 */
function formatMessage(level, message, data) {
  const timestamp = new Date().toISOString();
  return {
    timestamp,
    level,
    message,
    data,
    environment: process.env.NODE_ENV
  };
}

/**
 * إرسال اللوج إلى خدمة خارجية (مثل Sentry)
 */
async function sendToExternalService(logData) {
  if (!isProduction) return;
  
  // يمكنك إضافة كود لإرسال اللوجات إلى:
  // - Sentry
  // - LogRocket
  // - Datadog
  // - CloudWatch
  
  // مثال:
  // if (process.env.SENTRY_DSN) {
  //   Sentry.captureMessage(logData.message, {
  //     level: logData.level,
  //     extra: logData.data
  //   });
  // }
}

export const logger = {
  /**
   * معلومات عامة
   */
  info: (message, data = {}) => {
    const logData = formatMessage('info', message, data);
    
    if (isDev) {
      console.log(`ℹ️ [INFO] ${message}`, data);
    }
    
    if (isProduction) {
      console.log(JSON.stringify(logData));
    }
  },
  
  /**
   * أخطاء
   */
  error: (message, error = {}) => {
    const logData = formatMessage('error', message, {
      error: error.message || error,
      stack: error.stack,
      ...error
    });
    
    console.error(`❌ [ERROR] ${message}`, error);
    
    if (isProduction) {
      console.error(JSON.stringify(logData));
      sendToExternalService(logData);
    }
  },
  
  /**
   * تحذيرات
   */
  warn: (message, data = {}) => {
    const logData = formatMessage('warn', message, data);
    
    console.warn(`⚠️ [WARN] ${message}`, data);
    
    if (isProduction) {
      console.warn(JSON.stringify(logData));
    }
  },
  
  /**
   * معلومات تطوير (فقط في development)
   */
  debug: (message, data = {}) => {
    if (isDev) {
      console.debug(`🐛 [DEBUG] ${message}`, data);
    }
  },
  
  /**
   * نجاح العمليات
   */
  success: (message, data = {}) => {
    const logData = formatMessage('success', message, data);
    
    if (isDev) {
      console.log(`✅ [SUCCESS] ${message}`, data);
    }
    
    if (isProduction) {
      console.log(JSON.stringify(logData));
    }
  },
  
  /**
   * طلبات API
   */
  api: (method, path, status, duration, data = {}) => {
    const logData = formatMessage('api', `${method} ${path}`, {
      method,
      path,
      status,
      duration: `${duration}ms`,
      ...data
    });
    
    if (isDev) {
      const statusEmoji = status >= 200 && status < 300 ? '✅' : 
                         status >= 400 && status < 500 ? '⚠️' : '❌';
      console.log(`${statusEmoji} [API] ${method} ${path} - ${status} (${duration}ms)`);
    }
    
    if (isProduction) {
      console.log(JSON.stringify(logData));
    }
  },
  
  /**
   * قاعدة البيانات
   */
  db: (operation, collection, duration, data = {}) => {
    const logData = formatMessage('database', `${operation} on ${collection}`, {
      operation,
      collection,
      duration: `${duration}ms`,
      ...data
    });
    
    if (isDev) {
      console.log(`💾 [DB] ${operation} on ${collection} (${duration}ms)`);
    }
    
    if (isProduction && duration > 1000) {
      // تسجيل الاستعلامات البطيئة فقط
      console.warn(JSON.stringify(logData));
    }
  },
  
  /**
   * أمان
   */
  security: (event, data = {}) => {
    const logData = formatMessage('security', event, data);
    
    console.warn(`🔒 [SECURITY] ${event}`, data);
    
    if (isProduction) {
      console.warn(JSON.stringify(logData));
      sendToExternalService(logData);
    }
  }
};

/**
 * مثال على الاستخدام:
 * 
 * import { logger } from '@/app/lib/logger';
 * 
 * // معلومات عامة
 * logger.info('User logged in', { userId: '123' });
 * 
 * // أخطاء
 * try {
 *   // code
 * } catch (error) {
 *   logger.error('Failed to process payment', error);
 * }
 * 
 * // API
 * const start = Date.now();
 * // ... process request
 * logger.api('POST', '/api/invoices', 201, Date.now() - start);
 * 
 * // أمان
 * logger.security('Failed login attempt', { ip, email });
 */

export default logger;
