import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import User from '@/models/User';
import { redirect } from 'next/navigation';

// التحقق من صحة الاشتراك
export async function checkSubscription() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return { valid: false, reason: 'not_authenticated' };
    }

    // جلب بيانات المستخدم المحدثة
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return { valid: false, reason: 'user_not_found' };
    }

    // تحديث حالة الاشتراك
    await user.updateSubscriptionStatus();

    // التحقق من حالة الاشتراك
    if (user.subscriptionStatus === 'suspended') {
      return { 
        valid: false, 
        reason: 'suspended',
        message: 'تم إيقاف اشتراكك. يرجى التواصل مع الدعم الفني.'
      };
    }

    if (user.subscriptionStatus === 'expired') {
      return { 
        valid: false, 
        reason: 'expired',
        message: 'انتهت صلاحية اشتراكك. يرجى تجديد الاشتراك للمتابعة.',
        daysExpired: Math.ceil((new Date() - user.subscriptionEnd) / (1000 * 60 * 60 * 24))
      };
    }

    // حساب الأيام المتبقية
    const daysRemaining = Math.ceil((user.subscriptionEnd - new Date()) / (1000 * 60 * 60 * 24));
    
    return { 
      valid: true, 
      user,
      daysRemaining,
      subscriptionType: user.subscriptionType,
      subscriptionEnd: user.subscriptionEnd
    };

  } catch (error) {
    console.error('خطأ في التحقق من الاشتراك:', error);
    return { valid: false, reason: 'error', message: 'حدث خطأ في النظام' };
  }
}

// مكون للتحقق من الاشتراك وإعادة التوجيه
export async function requireActiveSubscription() {
  const subscriptionCheck = await checkSubscription();
  
  if (!subscriptionCheck.valid) {
    if (subscriptionCheck.reason === 'not_authenticated') {
      redirect('/login');
    } else if (subscriptionCheck.reason === 'expired' || subscriptionCheck.reason === 'suspended') {
      redirect('/subscriber/subscription?expired=true');
    } else {
      redirect('/error');
    }
  }
  
  return subscriptionCheck;
}

// مكون تحذيري للاشتراك
export function SubscriptionWarning({ daysRemaining, subscriptionEnd }) {
  if (daysRemaining > 7) return null;
  
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;
  const isExpired = daysRemaining <= 0;
  
  if (isExpired) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <h3 className="font-medium text-red-400">انتهت صلاحية اشتراكك</h3>
        </div>
        <p className="text-sm text-gray-300 mt-1">
          انتهت صلاحية اشتراكك في {new Date(subscriptionEnd).toLocaleDateString('en-GB')}. 
          يرجى تجديد الاشتراك للمتابعة.
        </p>
        <a 
          href="/subscriber/subscription" 
          className="inline-block mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          تجديد الاشتراك الآن
        </a>
      </div>
    );
  }
  
  if (isExpiringSoon) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <h3 className="font-medium text-yellow-400">تنبيه: اشتراكك ينتهي قريباً</h3>
        </div>
        <p className="text-sm text-gray-300 mt-1">
          سينتهي اشتراكك خلال {daysRemaining} أيام في {new Date(subscriptionEnd).toLocaleDateString('en-GB')}. 
          ننصح بتجديد الاشتراك لتجنب انقطاع الخدمة.
        </p>
        <a 
          href="/subscriber/subscription" 
          className="inline-block mt-3 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          تجديد الاشتراك
        </a>
      </div>
    );
  }
  
  return null;
}