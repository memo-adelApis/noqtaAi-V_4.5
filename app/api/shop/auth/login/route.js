import { NextResponse } from 'next/server';
import { connectToDB } from '@/utils/database';
import ShopUser from '@/models/ShopUser';

// POST - تسجيل دخول مستخدم موجود
export async function POST(request) {
  try {
    await connectToDB();
    
    const { phone, password } = await request.json();
    
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
        { error: 'رقم الهاتف غير مسجل' },
        { status: 404 }
      );
    }
    
    // التحقق من قفل الحساب
    if (user.isLocked) {
      return NextResponse.json(
        { error: 'الحساب مقفل مؤقتاً. حاول مرة أخرى لاحقاً' },
        { status: 423 }
      );
    }
    
    // التحقق من حالة الحساب
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'الحساب غير نشط' },
        { status: 403 }
      );
    }
    
    // إذا كان المستخدم مؤكد، يجب استخدام كلمة المرور
    if (user.isVerified) {
      if (!password) {
        return NextResponse.json(
          { error: 'كلمة المرور مطلوبة للحسابات المؤكدة' },
          { status: 400 }
        );
      }
      
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        await user.incLoginAttempts();
        return NextResponse.json(
          { error: 'كلمة المرور غير صحيحة' },
          { status: 401 }
        );
      }
    } else {
      // المستخدم غير مؤكد - يمكن تسجيل الدخول بكلمة المرور أو رمز التحقق
      if (password) {
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
          await user.incLoginAttempts();
          return NextResponse.json(
            { error: 'كلمة المرور غير صحيحة' },
            { status: 401 }
          );
        }
      } else {
        // تسجيل دخول بدون كلمة مرور - إرسال رمز تحقق
        const verificationCode = user.generateVerificationCode();
        await user.save();
        
        // هنا يمكن إضافة إرسال SMS برمز التحقق
        console.log(`رمز التحقق لـ ${cleanPhone}: ${verificationCode}`); // للاختبار فقط
        
        return NextResponse.json({
          success: true,
          requiresVerification: true,
          message: 'تم إرسال رمز التحقق إلى هاتفك',
          phone: cleanPhone,
          verificationCode // للاختبار فقط - يجب إزالته في الإنتاج
        });
      }
    }
    
    // تسجيل دخول ناجح
    await user.resetLoginAttempts();
    const token = user.generateAuthToken();
    
    return NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        isVerified: user.phoneVerification?.isVerified || false
      }
    });
    
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}