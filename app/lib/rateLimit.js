import { NextResponse } from 'next/server';

const rateLimit = new Map();

/**
 * Rate Limiter للحماية من الهجمات
 * @param {Object} options - خيارات التحديد
 * @param {number} options.interval - الفترة الزمنية بالميلي ثانية (افتراضي: 60 ثانية)
 * @param {number} options.uniqueTokenPerInterval - عدد الـ tokens الفريدة (افتراضي: 500)
 */
export function rateLimiter(options = {}) {
  const {
    interval = 60 * 1000, // 1 دقيقة
    uniqueTokenPerInterval = 500,
  } = options;

  return {
    check: (limit, token) =>
      new Promise((resolve, reject) => {
        const tokenCount = rateLimit.get(token) || [0];
        
        if (tokenCount[0] === 0) {
          rateLimit.set(token, [1, Date.now() + interval]);
          resolve();
        } else if (tokenCount[0] < limit) {
          tokenCount[0]++;
          resolve();
        } else {
          const resetTime = tokenCount[1];
          const now = Date.now();
          
          if (now > resetTime) {
            rateLimit.set(token, [1, Date.now() + interval]);
            resolve();
          } else {
            const timeLeft = Math.ceil((resetTime - now) / 1000);
            reject({
              error: 'Rate limit exceeded',
              retryAfter: timeLeft
            });
          }
        }

        // تنظيف الذاكرة
        if (rateLimit.size > uniqueTokenPerInterval) {
          const now = Date.now();
          for (const [key, value] of rateLimit.entries()) {
            if (now > value[1]) {
              rateLimit.delete(key);
            }
          }
        }
      }),
  };
}

/**
 * Middleware للـ Rate Limiting في API routes
 * @param {Request} request - الطلب
 * @param {Function} handler - المعالج
 * @param {number} limit - الحد الأقصى للطلبات (افتراضي: 10)
 */
export async function withRateLimit(request, handler, limit = 10) {
  const limiter = rateLimiter({
    interval: 60 * 1000, // 1 دقيقة
  });
  
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'anonymous';

  try {
    await limiter.check(limit, ip);
    return await handler(request);
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'تم تجاوز الحد المسموح من الطلبات',
        message: 'حاول مرة أخرى بعد دقيقة',
        retryAfter: error.retryAfter || 60
      },
      { 
        status: 429,
        headers: {
          'Retry-After': String(error.retryAfter || 60)
        }
      }
    );
  }
}

/**
 * مثال على الاستخدام في API route:
 * 
 * import { withRateLimit } from '@/app/lib/rateLimit';
 * 
 * export async function POST(request) {
 *   return withRateLimit(request, async (req) => {
 *     // معالجة الطلب هنا
 *     return NextResponse.json({ success: true });
 *   }, 5); // 5 طلبات في الدقيقة
 * }
 */
