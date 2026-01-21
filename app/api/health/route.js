import { NextResponse } from 'next/server';
import { connectToDB } from '@/utils/database';
import mongoose from 'mongoose';

/**
 * Health Check Endpoint
 * يستخدم للتحقق من صحة التطبيق والخدمات المرتبطة به
 * 
 * GET /api/health
 */
export async function GET() {
  const startTime = Date.now();
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    checks: {}
  };

  try {
    // 1. فحص قاعدة البيانات
    const dbStart = Date.now();
    await connectToDB();
    
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 
                     dbState === 2 ? 'connecting' : 
                     dbState === 3 ? 'disconnecting' : 'disconnected';
    
    health.checks.database = {
      status: dbState === 1 ? 'healthy' : 'unhealthy',
      state: dbStatus,
      responseTime: `${Date.now() - dbStart}ms`
    };

    // 2. فحص الذاكرة
    const memoryUsage = process.memoryUsage();
    health.checks.memory = {
      status: 'healthy',
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`
    };

    // 3. فحص CPU
    const cpuUsage = process.cpuUsage();
    health.checks.cpu = {
      status: 'healthy',
      user: `${Math.round(cpuUsage.user / 1000)}ms`,
      system: `${Math.round(cpuUsage.system / 1000)}ms`
    };

    // 4. وقت الاستجابة الكلي
    health.responseTime = `${Date.now() - startTime}ms`;

    // تحديد الحالة العامة
    const allHealthy = Object.values(health.checks).every(
      check => check.status === 'healthy'
    );
    
    health.status = allHealthy ? 'healthy' : 'degraded';

    return NextResponse.json(health, {
      status: allHealthy ? 200 : 503
    });

  } catch (error) {
    health.status = 'unhealthy';
    health.error = error.message;
    health.checks.database = {
      status: 'unhealthy',
      error: error.message
    };

    return NextResponse.json(health, { status: 503 });
  }
}

/**
 * مثال على الاستجابة:
 * 
 * {
 *   "status": "healthy",
 *   "timestamp": "2024-01-16T10:30:00.000Z",
 *   "uptime": 3600,
 *   "environment": "production",
 *   "version": "1.0.0",
 *   "checks": {
 *     "database": {
 *       "status": "healthy",
 *       "state": "connected",
 *       "responseTime": "15ms"
 *     },
 *     "memory": {
 *       "status": "healthy",
 *       "heapUsed": "120MB",
 *       "heapTotal": "256MB",
 *       "rss": "180MB"
 *     },
 *     "cpu": {
 *       "status": "healthy",
 *       "user": "1500ms",
 *       "system": "500ms"
 *     }
 *   },
 *   "responseTime": "20ms"
 * }
 */
