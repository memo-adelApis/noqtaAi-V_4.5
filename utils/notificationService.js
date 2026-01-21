import { connectToDB } from "@/utils/database";
import Notification from '@/models/Notification';
import LoginLog from '@/models/LoginLog';
import User from '@/models/User';

/**
 * خدمة الإشعارات الشاملة
 */
export class NotificationService {
  
  /**
   * إرسال إشعار يدوي
   */
  static async sendNotification(userId, title, message, options = {}) {
    await connectToDB();
    
    try {
      const notification = await Notification.create({
        userId,
        title,
        message,
        type: options.type || 'info',
        priority: options.priority || 'medium',
        category: options.category || 'general',
        metadata: options.metadata || {},
        expiresAt: options.expiresAt || null,
        scheduledFor: options.scheduledFor || null,
        isSent: options.scheduledFor ? false : true
      });

      return { success: true, notificationId: notification._id };
    } catch (error) {
      console.error('Error sending notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * إرسال إشعار لجميع المستخدمين
   */
  static async broadcastNotification(title, message, options = {}) {
    await connectToDB();
    
    try {
      let query = { isActive: true };
      
      // تحديد المستهدفين حسب الدور
      if (options.targetRole) {
        if (Array.isArray(options.targetRole)) {
          query.role = { $in: options.targetRole };
        } else {
          query.role = options.targetRole;
        }
      }

      // إذا كان المرسل مالك، يمكنه إرسال لموظفيه فقط
      if (options.senderId && options.senderRole === 'owner') {
        const sender = await User.findById(options.senderId);
        if (sender && sender.mainAccountId) {
          // المالك يرسل لموظفي حسابه الرئيسي
          query.mainAccountId = sender.mainAccountId;
        } else {
          // المالك يرسل لموظفيه
          query.mainAccountId = options.senderId;
        }
      }

      // إذا كان المرسل مدير، يمكنه إرسال لفرعه فقط
      if (options.senderId && options.senderRole === 'manager') {
        const sender = await User.findById(options.senderId);
        if (sender && sender.branchId) {
          query.branchId = sender.branchId;
        }
      }

      const users = await User.find(query).select('_id');

      const notifications = users.map(user => ({
        userId: user._id,
        title,
        message,
        type: options.type || 'info',
        priority: options.priority || 'medium',
        category: options.category || 'general',
        metadata: options.metadata || {}
      }));

      await Notification.insertMany(notifications);
      
      return { success: true, count: notifications.length };
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * إرسال إشعار لفرع محدد
   */
  static async sendToBranch(branchId, title, message, options = {}) {
    await connectToDB();
    
    try {
      const users = await User.find({ 
        branchId: branchId,
        isActive: true 
      }).select('_id');

      const notifications = users.map(user => ({
        userId: user._id,
        title,
        message,
        type: options.type || 'info',
        priority: options.priority || 'medium',
        category: options.category || 'general',
        metadata: { ...options.metadata, branchId }
      }));

      await Notification.insertMany(notifications);
      
      return { success: true, count: notifications.length };
    } catch (error) {
      console.error('Error sending to branch:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * إرسال إشعار لدور محدد في المؤسسة
   */
  static async sendToRole(mainAccountId, role, title, message, options = {}) {
    await connectToDB();
    
    try {
      const users = await User.find({ 
        mainAccountId: mainAccountId,
        role: role,
        isActive: true 
      }).select('_id');

      const notifications = users.map(user => ({
        userId: user._id,
        title,
        message,
        type: options.type || 'info',
        priority: options.priority || 'medium',
        category: options.category || 'general',
        metadata: { ...options.metadata, targetRole: role }
      }));

      await Notification.insertMany(notifications);
      
      return { success: true, count: notifications.length };
    } catch (error) {
      console.error('Error sending to role:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * إشعار تحذير انتهاء الاشتراك
   */
  static async checkSubscriptionExpiry() {
    await connectToDB();
    
    try {
      const now = new Date();
      const warningDate = new Date();
      warningDate.setDate(warningDate.getDate() + 7); // تحذير قبل 7 أيام

      // البحث عن الاشتراكات التي تنتهي خلال 7 أيام
      const expiringUsers = await User.find({
        role: 'subscriber',
        'subscription.isActive': true,
        'subscription.endDate': {
          $gte: now,
          $lte: warningDate
        }
      });

      let sentCount = 0;

      for (const user of expiringUsers) {
        const daysLeft = Math.ceil(
          (new Date(user.subscription.endDate) - now) / (1000 * 60 * 60 * 24)
        );

        // التحقق من عدم إرسال إشعار مماثل مؤخراً
        const existingNotification = await Notification.findOne({
          userId: user._id,
          autoType: 'subscription_expiry_warning',
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // آخر 24 ساعة
        });

        if (!existingNotification) {
          await Notification.createAutoNotification(
            user._id,
            'subscription_expiry_warning',
            { 
              daysLeft,
              endDate: user.subscription.endDate.toLocaleDateString('ar-EG'),
              plan: user.subscription.plan
            }
          );
          sentCount++;
        }
      }

      // البحث عن الاشتراكات المنتهية
      const expiredUsers = await User.find({
        role: 'subscriber',
        'subscription.endDate': { $lt: now },
        'subscription.isActive': true
      });

      for (const user of expiredUsers) {
        // تحديث حالة الاشتراك
        await User.findByIdAndUpdate(user._id, {
          'subscription.isActive': false,
          'subscription.isExpired': true
        });

        // إرسال إشعار انتهاء الاشتراك
        const existingExpiredNotification = await Notification.findOne({
          userId: user._id,
          autoType: 'subscription_expired',
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (!existingExpiredNotification) {
          await Notification.createAutoNotification(
            user._id,
            'subscription_expired',
            { 
              plan: user.subscription.plan,
              endDate: user.subscription.endDate.toLocaleDateString('ar-EG')
            }
          );
          sentCount++;
        }
      }

      return { success: true, sentCount, expiringCount: expiringUsers.length, expiredCount: expiredUsers.length };
    } catch (error) {
      console.error('Error checking subscription expiry:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * إشعار تحذير الحدود
   */
  static async checkLimitsAndNotify(userId, limitType, current, limit) {
    await connectToDB();
    
    try {
      const percentage = (current / limit) * 100;
      
      // تحذير عند 80%
      if (percentage >= 80 && percentage < 100) {
        const existingWarning = await Notification.findOne({
          userId,
          autoType: 'limit_warning',
          'metadata.limitType': limitType,
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (!existingWarning) {
          await Notification.createAutoNotification(
            userId,
            'limit_warning',
            { limitType, current, limit, percentage: Math.round(percentage) }
          );
        }
      }
      
      // إشعار تجاوز الحد عند 100%
      if (percentage >= 100) {
        const existingExceeded = await Notification.findOne({
          userId,
          autoType: 'limit_exceeded',
          'metadata.limitType': limitType,
          createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // آخر ساعة
        });

        if (!existingExceeded) {
          await Notification.createAutoNotification(
            userId,
            'limit_exceeded',
            { limitType, current, limit, percentage: Math.round(percentage) }
          );
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error checking limits:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * إشعار تسجيل دخول جديد
   */
  static async notifyNewLogin(userId, loginData) {
    await connectToDB();
    
    try {
      // إرسال إشعار للمستخدم
      await Notification.createAutoNotification(
        userId,
        'login_alert',
        {
          location: loginData.location || 'غير محدد',
          device: loginData.device || 'غير محدد',
          ipAddress: loginData.ipAddress,
          time: new Date().toLocaleString('ar-EG')
        }
      );

      // إرسال إشعار للمدير
      const admin = await User.findOne({ role: 'admin' });
      if (admin) {
        const user = await User.findById(userId);
        await this.sendNotification(
          admin._id,
          'تسجيل دخول جديد في النظام',
          `قام المستخدم ${user.name} (${user.email}) بتسجيل الدخول من ${loginData.location}`,
          {
            type: 'security',
            priority: 'medium',
            category: 'security',
            metadata: loginData
          }
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error notifying new login:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * إشعار ترحيب للمستخدمين الجدد
   */
  static async sendWelcomeNotification(userId) {
    await connectToDB();
    
    try {
      await Notification.createAutoNotification(userId, 'welcome_message');
      return { success: true };
    } catch (error) {
      console.error('Error sending welcome notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * إشعار تفعيل الاشتراك
   */
  static async notifySubscriptionActivated(userId, subscriptionData) {
    await connectToDB();
    
    try {
      await Notification.createAutoNotification(
        userId,
        'subscription_activated',
        {
          plan: subscriptionData.plan,
          endDate: subscriptionData.endDate,
          features: subscriptionData.features || []
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Error notifying subscription activation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * تنظيف الإشعارات المنتهية الصلاحية
   */
  static async cleanupExpiredNotifications() {
    await connectToDB();
    
    try {
      const result = await Notification.cleanupExpired();
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * الحصول على إحصائيات الإشعارات
   */
  static async getNotificationStats(userId = null) {
    await connectToDB();
    
    try {
      const matchQuery = userId ? { userId } : {};
      
      const stats = await Notification.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            unreadCount: {
              $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
            }
          }
        }
      ]);

      const totalStats = await Notification.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
            archived: { $sum: { $cond: [{ $eq: ['$isArchived', true] }, 1, 0] } }
          }
        }
      ]);

      return {
        success: true,
        byType: stats,
        total: totalStats[0] || { total: 0, unread: 0, archived: 0 }
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return { success: false, error: error.message };
    }
  }
}

/**
 * خدمة تسجيل الدخول والأمان
 */
export class LoginLogService {
  
  /**
   * تسجيل محاولة دخول
   */
  static async logLoginAttempt(email, status, request, userId = null, failureReason = null) {
    await connectToDB();
    
    try {
      const ipAddress = this.getClientIP(request);
      
      // التعامل مع user-agent بنفس طريقة headers
      let userAgent = '';
      if (request?.headers) {
        if (typeof request.headers.get === 'function') {
          userAgent = request.headers.get('user-agent') || '';
        } else {
          userAgent = request.headers['user-agent'] || '';
        }
      }
      
      const deviceInfo = this.parseUserAgent(userAgent);
      
      const logEntry = await LoginLog.create({
        userId,
        email: email.toLowerCase(),
        status,
        ipAddress,
        userAgent,
        device: deviceInfo,
        failureReason,
        location: await this.getLocationFromIP(ipAddress)
      });

      // إرسال إشعارات حسب نوع المحاولة
      if (status === 'success' && userId) {
        await NotificationService.notifyNewLogin(userId, {
          location: logEntry.getLocationString(),
          device: `${deviceInfo.browser} على ${deviceInfo.os}`,
          ipAddress
        });
      } else if (status === 'failed') {
        await this.checkSuspiciousActivity(email, ipAddress);
      }

      return { success: true, logId: logEntry._id };
    } catch (error) {
      console.error('Error logging login attempt:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * التحقق من النشاط المشبوه
   */
  static async checkSuspiciousActivity(email, ipAddress) {
    try {
      const failedAttempts = await LoginLog.getFailedAttempts(email, 1); // آخر ساعة
      
      if (failedAttempts >= 5) {
        // إرسال تحذير للمديرين
        const admins = await User.find({ role: 'admin' });
        
        for (const admin of admins) {
          await NotificationService.sendNotification(
            admin._id,
            'تحذير أمني: محاولات دخول مشبوهة',
            `تم رصد ${failedAttempts} محاولة دخول فاشلة للبريد ${email} من IP: ${ipAddress}`,
            {
              type: 'security',
              priority: 'urgent',
              category: 'security',
              metadata: { email, ipAddress, failedAttempts }
            }
          );
        }
      }
    } catch (error) {
      console.error('Error checking suspicious activity:', error);
    }
  }

  /**
   * الحصول على IP العميل
   */
  static getClientIP(request) {
    try {
      // التعامل مع أنواع مختلفة من الـ headers
      const headers = request?.headers;
      
      if (!headers) {
        return 'unknown';
      }
      
      let forwarded, realIP, remoteAddr;
      
      if (typeof headers.get === 'function') {
        // Headers API (Fetch API)
        forwarded = headers.get('x-forwarded-for');
        realIP = headers.get('x-real-ip');
        remoteAddr = headers.get('remote-addr');
      } else {
        // Object headers (Node.js/NextAuth)
        forwarded = headers['x-forwarded-for'] || headers.forwarded;
        realIP = headers['x-real-ip'] || headers['x-client-ip'];
        remoteAddr = headers['remote-addr'] || headers.connection?.remoteAddress;
      }
      
      if (forwarded) {
        return forwarded.split(',')[0].trim();
      }
      
      return realIP || remoteAddr || 'localhost';
    } catch (error) {
      console.warn('خطأ في الحصول على IP العميل:', error.message);
      return 'unknown';
    }
  }

  /**
   * تحليل User Agent
   */
  static parseUserAgent(userAgent) {
    const device = {
      type: 'desktop',
      os: 'unknown',
      browser: 'unknown'
    };

    if (!userAgent) return device;

    // تحديد نوع الجهاز
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      device.type = /iPad/.test(userAgent) ? 'tablet' : 'mobile';
    }

    // تحديد نظام التشغيل
    if (/Windows/.test(userAgent)) device.os = 'Windows';
    else if (/Mac OS/.test(userAgent)) device.os = 'macOS';
    else if (/Linux/.test(userAgent)) device.os = 'Linux';
    else if (/Android/.test(userAgent)) device.os = 'Android';
    else if (/iPhone|iPad/.test(userAgent)) device.os = 'iOS';

    // تحديد المتصفح
    if (/Chrome/.test(userAgent)) device.browser = 'Chrome';
    else if (/Firefox/.test(userAgent)) device.browser = 'Firefox';
    else if (/Safari/.test(userAgent)) device.browser = 'Safari';
    else if (/Edge/.test(userAgent)) device.browser = 'Edge';

    return device;
  }

  /**
   * الحصول على الموقع من IP (مبسط)
   */
  static async getLocationFromIP(ipAddress) {
    // يمكن دمج خدمة خارجية هنا مثل ipapi.co
    return {
      country: null,
      city: null,
      region: null
    };
  }

  /**
   * الحصول على إحصائيات تسجيل الدخول
   */
  static async getLoginStats(days = 30) {
    await connectToDB();
    
    try {
      const stats = await LoginLog.getLoginStats(days);
      
      // إحصائيات إضافية
      const topFailedIPs = await LoginLog.aggregate([
        {
          $match: {
            status: 'failed',
            createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: '$ipAddress',
            count: { $sum: 1 },
            emails: { $addToSet: '$email' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      return {
        success: true,
        stats,
        topFailedIPs,
        period: `${days} days`
      };
    } catch (error) {
      console.error('Error getting login stats:', error);
      return { success: false, error: error.message };
    }
  }
}