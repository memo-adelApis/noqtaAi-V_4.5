import { NextResponse } from 'next/server';
import { connectToDB } from '@/utils/database';
import ShopUser from '@/models/ShopUser';

// POST - التحقق من رمز التحقق
export async function POST(request) {
  try {
    await connectToDB();
    
    const { phone, code } = await request.json();
    
    // التحقق من صحة البيانات
    if (!phone || !code) {
      return NextResponse.json(
        { error: 'رقم الهاتف ورمز التحقق مطلوبان' },
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
    
    // التحقق من الرمز
    const verificationResult = user.verifyCode(code);
    
    if (!verificationResult.success) {
      await user.save(); // حفظ عدد المحاولات
      return NextResponse.json(
        { error: verificationResult.message },
        { status: 400 }
      );
    }
    
    // حفظ التحقق وإنشاء token
    await user.save();
    const token = user.generateAuthToken();
    
    return NextResponse.json({
      success: true,
      message: 'تم التحقق بنجاح',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        isVerified: true
      }
    });
    
  } catch (error) {
    console.error('خطأ في التحقق:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}