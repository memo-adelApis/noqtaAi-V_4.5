'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Payment from '@/models/Payment';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// تأكيد الدفعة وتفعيل الاشتراك
export async function verifyPayment(formData) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      throw new Error('غير مصرح لك بهذا الإجراء');
    }

    const paymentId = formData.get('paymentId');
    const notes = formData.get('notes') || '';

    // العثور على الدفعة
    const payment = await Payment.findById(paymentId).populate('userId');
    
    if (!payment) {
      throw new Error('الدفعة غير موجودة');
    }

    if (payment.status !== 'pending') {
      throw new Error('هذه الدفعة تم معالجتها مسبقاً');
    }

    // تأكيد الدفعة وتفعيل المستخدم
    await payment.verify(session.user.id, notes);

    // إرسال إشعار للمستخدم
    await Notification.create({
      userId: payment.userId._id,
      title: '🎉 تم تأكيد اشتراكك بنجاح!',
      message: `تم تأكيد دفعتك بمبلغ ${payment.amount} ${payment.currency} وتفعيل اشتراكك ${
        payment.subscriptionType === 'monthly' ? 'الشهري' : 
        payment.subscriptionType === 'quarterly' ? 'الربع سنوي' : 'السنوي'
      }. مرحباً بك في خدماتنا!`,
      type: 'success',
      isRead: false
    });

    revalidatePath('/admin/payments');
    revalidatePath('/admin/users');
    
    return { success: true, message: 'تم تأكيد الدفعة وتفعيل الاشتراك بنجاح' };

  } catch (error) {
    console.error('خطأ في تأكيد الدفعة:', error);
    return { success: false, message: error.message };
  }
}

// رفض الدفعة
export async function rejectPayment(formData) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      throw new Error('غير مصرح لك بهذا الإجراء');
    }

    const paymentId = formData.get('paymentId');
    const notes = formData.get('notes') || 'لم يتم تحديد سبب الرفض';

    // العثور على الدفعة
    const payment = await Payment.findById(paymentId).populate('userId');
    
    if (!payment) {
      throw new Error('الدفعة غير موجودة');
    }

    if (payment.status !== 'pending') {
      throw new Error('هذه الدفعة تم معالجتها مسبقاً');
    }

    // رفض الدفعة
    await payment.reject(session.user.id, notes);

    // إرسال إشعار للمستخدم
    await Notification.create({
      userId: payment.userId._id,
      title: '❌ تم رفض دفعتك',
      message: `نأسف، تم رفض دفعتك بمبلغ ${payment.amount} ${payment.currency}. السبب: ${notes}. يرجى التواصل مع الدعم الفني لمزيد من المعلومات.`,
      type: 'warning',
      isRead: false
    });

    revalidatePath('/admin/payments');
    
    return { success: true, message: 'تم رفض الدفعة' };

  } catch (error) {
    console.error('خطأ في رفض الدفعة:', error);
    return { success: false, message: error.message };
  }
}

// إنشاء دفعة جديدة (للمستخدمين)
export async function createPayment(formData) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    const amount = parseFloat(formData.get('amount'));
    const currency = formData.get('currency') || 'SAR';
    const transactionId = formData.get('transactionId');
    const paymentMethod = formData.get('paymentMethod');
    const subscriptionType = formData.get('subscriptionType');
    const bankName = formData.get('bankName');
    const accountNumber = formData.get('accountNumber');

    // التحقق من البيانات المطلوبة
    if (!amount || !transactionId || !paymentMethod || !subscriptionType) {
      throw new Error('جميع الحقول مطلوبة');
    }

    // التحقق من عدم وجود رقم عملية مكرر
    const existingPayment = await Payment.findOne({ transactionId });
    if (existingPayment) {
      throw new Error('رقم العملية مستخدم مسبقاً');
    }

    // حساب تواريخ الاشتراك
    const startDate = new Date();
    const payment = new Payment({
      userId: session.user.id,
      amount,
      currency,
      transactionId,
      paymentMethod,
      subscriptionType,
      subscriptionPeriod: {
        startDate,
        endDate: new Date() // سيتم حسابها في الموديل
      },
      metadata: {
        bankName,
        accountNumber,
        ipAddress: formData.get('ipAddress'),
        userAgent: formData.get('userAgent')
      }
    });

    // حساب تاريخ الانتهاء
    payment.subscriptionPeriod.endDate = payment.calculateEndDate(startDate, subscriptionType);

    await payment.save();

    // إرسال إشعار للمدراء
    const admins = await User.find({ role: 'admin' }).select('_id');
    
    for (const admin of admins) {
      await Notification.create({
        userId: admin._id,
        title: '💳 دفعة جديدة في الانتظار',
        message: `دفعة جديدة من ${session.user.name} بمبلغ ${amount} ${currency} تحتاج للمراجعة والتأكيد.`,
        type: 'info',
        isRead: false
      });
    }

    revalidatePath('/subscriber/subscription');
    
    return { success: true, message: 'تم إرسال طلب الدفع بنجاح، سيتم مراجعته قريباً' };

  } catch (error) {
    console.error('خطأ في إنشاء الدفعة:', error);
    return { success: false, message: error.message };
  }
}

// جلب دفعات المستخدم
export async function getUserPayments() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    const payments = await Payment.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, payments };

  } catch (error) {
    console.error('خطأ في جلب الدفعات:', error);
    return { success: false, message: error.message };
  }
}