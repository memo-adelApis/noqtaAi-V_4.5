import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import User from '@/models/User';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

// توليد كلمة سر عشوائية
function generateTempPassword(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(request) {
  try {
    await connectToDB();
    
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'subscriber') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriberId = new mongoose.Types.ObjectId(session.user.id);
    const body = await request.json();
    const { userId } = body;

    // التحقق من أن المستخدم تابع للمشترك
    const targetUser = await User.findOne({ 
      _id: userId,
      mainAccountId: subscriberId
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // توليد كلمة سر مؤقتة
    const tempPassword = generateTempPassword();

    // تحديث كلمة السر
    targetUser.password = tempPassword;
    await targetUser.save();

    // إعداد nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'adelvip222222@gmail.com',
        pass: '1234567890mmmm@@@@'
      }
    });

    // إرسال البريد
    const mailOptions = {
      from: 'adelvip222222@gmail.com',
      to: targetUser.email,
      subject: 'كلمة المرور المؤقتة - نظام الإدارة',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2563eb; text-align: center;">كلمة المرور المؤقتة</h2>
            <p style="font-size: 16px; color: #333;">مرحباً <strong>${targetUser.name}</strong>،</p>
            <p style="font-size: 16px; color: #333;">تم إنشاء كلمة مرور مؤقتة لحسابك:</p>
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="font-size: 14px; color: #666; margin-bottom: 10px;">كلمة المرور المؤقتة:</p>
              <p style="font-size: 24px; font-weight: bold; color: #2563eb; letter-spacing: 2px; font-family: monospace;">${tempPassword}</p>
            </div>
            <p style="font-size: 14px; color: #666;">
              <strong>ملاحظة هامة:</strong> يرجى تغيير كلمة المرور بعد تسجيل الدخول لأول مرة لضمان أمان حسابك.
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="font-size: 12px; color: #999;">
                هذا البريد تم إرساله تلقائياً، يرجى عدم الرد عليه.
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: 'تم إرسال كلمة السر المؤقتة بنجاح',
      tempPassword // للعرض في التنبيه (يمكن إزالته في الإنتاج)
    });

  } catch (error) {
    console.error('Error sending password:', error);
    return NextResponse.json({ 
      error: 'حدث خطأ في إرسال البريد الإلكتروني',
      details: error.message 
    }, { status: 500 });
  }
}
