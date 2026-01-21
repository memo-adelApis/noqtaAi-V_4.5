import { NextResponse } from 'next/server';
import { connectToDB } from '@/utils/database';
import ShopUser from '@/models/ShopUser';
import Shop from '@/models/Shop';

// POST - تسجيل مستخدم جديد
export async function POST(request) {
  try {
    await connectToDB();
    
    const { name, phone, password, shopName } = await request.json();
    
    // التحقق من صحة البيانات
    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: 'الاسم ورقم الهاتف وكلمة المرور مطلوبة' },
        { status: 400 }
      );
    }
    
    // التحقق من قوة كلمة المرور
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      );
    }
    
    // تنظيف رقم الهاتف
    const cleanPhone = phone.replace(/\s+/g, '').trim();
    
    // التحقق من صحة رقم الهاتف
    if (!/^[0-9+\-()]+$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'رقم الهاتف غير صحيح' },
        { status: 400 }
      );
    }
    
    // البحث عن المتجر إذا تم تحديده
    let shop = null;
    if (shopName) {
      shop = await Shop.findOne({ 
        uniqueName: shopName.toLowerCase(),
        status: 'active'
      });
    }
    
    // التحقق من عدم وجود المستخدم مسبقاً
    const existingUser = await ShopUser.findOne({ phone: cleanPhone });
    if (existingUser) {
      return NextResponse.json(
        { error: 'رقم الهاتف مسجل مسبقاً' },
        { status: 400 }
      );
    }
    
    // إنشاء المستخدم الجديد
    const newUser = new ShopUser({
      name: name.trim(),
      phone: cleanPhone,
      password: password,
      registrationType: 'phone',
      shopId: shop?._id,
      ownerId: shop?.subscriberId
    });
    
    // إنشاء رمز التحقق
    const verificationCode = newUser.generateVerificationCode();
    
    await newUser.save();
    
    // هنا يمكن إضافة إرسال SMS برمز التحقق
    // await sendSMS(cleanPhone, `رمز التحقق الخاص بك: ${verificationCode}`);
    
    console.log(`رمز التحقق لـ ${cleanPhone}: ${verificationCode}`); // للاختبار فقط
    
    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح. تم إرسال رمز التحقق إلى هاتفك',
      userId: newUser._id,
      phone: cleanPhone,
      verificationCode // للاختبار فقط - يجب إزالته في الإنتاج
    }, { status: 201 });
    
  } catch (error) {
    console.error('خطأ في تسجيل المستخدم:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'رقم الهاتف مسجل مسبقاً' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}