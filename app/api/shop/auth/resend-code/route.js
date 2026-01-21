import { NextResponse } from 'next/server';
import { connectToDB } from '@/utils/database';
import ShopUser from '@/models/ShopUser';

// POST - إعادة إرسال رمز التحقق
export async function POST(request) {
  try {
    await connectToDB();
    
    const { phone } = await request.json();
    
    // التحقق من صحة البيانات
    if (!phone) {
      return NextResponse.json(
        { error: 'رقم الهاتف مطلوب' },
        { status: 400 }
      );
    }
    
    // تنظيف رقم الهاتف
    const cleanPhone = phone.replace(/\s+/g, '').trim();
    
    // البحث عن المستخدم
    const user = await ShopUser.findOne({ phone: cleanPhone });
    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }
    
    // التحقق من الحد الزمني لإعادة الإرسال (دقيقة واحدة)
    if (user.phoneVerification?.lastSentAt) {
      const timeSinceLastSent = Date.now() - user.phoneVerification.lastSentAt.getTime();
      if (timeSinceLastSent < 60000) { // دقيقة واحدة
        const remainingTime = Math.ceil((60000 - timeSinceLastSent) / 1000);
        return NextResponse.json(
          { error: `يرجى الانتظار ${remainingTime} ثانية قبل إعادة الإرسال` },
          { status: 429 }
        );
      }
    }
    
    // إنشاء رمز تحقق جديد
    const verificationCode = user.generateVerificationCode();
    await user.save();
    
    // هنا يمكن إضافة إرسال SMS برمز التحقق
    console.log(`رمز التحقق الجديد لـ ${cleanPhone}: ${verificationCode}`); // للاختبار فقط
    
    return NextResponse.json({
      success: true,
      message: 'تم إرسال رمز التحقق الجديد',
      verificationCode // للاختبار فقط - يجب إزالته في الإنتاج
    });
    
  } catch (error) {
    console.error('خطأ في إعادة إرسال الرمز:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}