/**
 * PM2 Ecosystem Configuration
 * ملف إعدادات PM2 لإدارة التطبيق في الإنتاج
 * 
 * الاستخدام:
 * pm2 start ecosystem.config.js
 * pm2 restart ecosystem.config.js
 * pm2 stop ecosystem.config.js
 * pm2 delete ecosystem.config.js
 */

module.exports = {
  apps: [
    {
      // اسم التطبيق
      name: 'invoice-system',
      
      // الأمر المراد تشغيله
      script: 'npm',
      args: 'start',
      
      // عدد النسخ (instances)
      // 'max' = عدد CPU cores
      // أو رقم محدد مثل 2, 4
      instances: 'max',
      
      // وضع التشغيل
      // 'cluster' = توزيع الحمل على عدة نسخ
      // 'fork' = نسخة واحدة فقط
      exec_mode: 'cluster',
      
      // متغيرات البيئة
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      
      // إعادة التشغيل التلقائي
      autorestart: true,
      
      // عدد محاولات إعادة التشغيل
      max_restarts: 10,
      
      // الحد الأدنى من الوقت بين إعادة التشغيل (ms)
      min_uptime: '10s',
      
      // الحد الأقصى لاستخدام الذاكرة (إعادة التشغيل عند تجاوزه)
      max_memory_restart: '500M',
      
      // مراقبة التغييرات في الملفات (false في الإنتاج)
      watch: false,
      
      // الملفات المستثناة من المراقبة
      ignore_watch: [
        'node_modules',
        '.next',
        'logs',
        '*.log'
      ],
      
      // ملفات اللوجات
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      
      // تنسيق الوقت في اللوجات
      time: true,
      
      // دمج اللوجات من جميع النسخ
      merge_logs: true,
      
      // استراتيجية إعادة التشغيل
      // 'exponential_backoff_restart_delay' = زيادة الوقت بين المحاولات
      exp_backoff_restart_delay: 100,
      
      // Kill timeout (ms)
      kill_timeout: 5000,
      
      // Listen timeout (ms)
      listen_timeout: 10000,
      
      // Cron لإعادة التشغيل الدوري (اختياري)
      // cron_restart: '0 0 * * *', // كل يوم عند منتصف الليل
      
      // Environment-specific settings
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3001
      }
    }
  ],
  
  // إعدادات النشر (Deploy)
  deploy: {
    production: {
      // المستخدم على السيرفر
      user: 'ubuntu',
      
      // عنوان السيرفر
      host: 'your-server-ip',
      
      // المنفذ SSH
      port: '22',
      
      // المفتاح الخاص SSH
      key: '~/.ssh/id_rsa',
      
      // مستودع Git
      repo: 'git@github.com:username/repo.git',
      
      // الفرع
      ref: 'origin/main',
      
      // المسار على السيرفر
      path: '/var/www/invoice-system',
      
      // الأوامر قبل النشر (على الجهاز المحلي)
      'pre-deploy-local': 'echo "Starting deployment..."',
      
      // الأوامر بعد النشر (على السيرفر)
      'post-deploy': 'npm ci && npm run build && pm2 reload ecosystem.config.js --env production',
      
      // الأوامر قبل الإعداد
      'pre-setup': 'echo "Setting up..."',
      
      // Environment variables
      env: {
        NODE_ENV: 'production'
      }
    },
    
    staging: {
      user: 'ubuntu',
      host: 'staging-server-ip',
      port: '22',
      key: '~/.ssh/id_rsa',
      repo: 'git@github.com:username/repo.git',
      ref: 'origin/develop',
      path: '/var/www/invoice-system-staging',
      'post-deploy': 'npm ci && npm run build && pm2 reload ecosystem.config.js --env staging',
      env: {
        NODE_ENV: 'staging'
      }
    }
  }
};

/**
 * أوامر PM2 المفيدة:
 * 
 * # بدء التطبيق
 * pm2 start ecosystem.config.js
 * 
 * # إعادة التشغيل
 * pm2 restart invoice-system
 * 
 * # إيقاف
 * pm2 stop invoice-system
 * 
 * # حذف
 * pm2 delete invoice-system
 * 
 * # عرض الحالة
 * pm2 status
 * 
 * # عرض اللوجات
 * pm2 logs invoice-system
 * 
 * # مراقبة الأداء
 * pm2 monit
 * 
 * # حفظ الإعدادات
 * pm2 save
 * 
 * # تفعيل البدء التلقائي
 * pm2 startup
 * 
 * # النشر
 * pm2 deploy production setup
 * pm2 deploy production
 * pm2 deploy production update
 */
