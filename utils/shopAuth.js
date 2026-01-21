import jwt from 'jsonwebtoken';
import { connectToDB } from './database';
import ShopUser from '@/models/ShopUser';

// دالة التحقق من JWT token
export const verifyShopToken = async (token) => {
  try {
    if (!token) {
      return { success: false, error: 'لا يوجد token' };
    }
    
    // إزالة "Bearer " إذا كان موجوداً
    const cleanToken = token.replace('Bearer ', '');
    
    // التحقق من صحة التوكن
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'shop-secret-key');
    
    if (decoded.type !== 'shop_user') {
      return { success: false, error: 'نوع التوكن غير صحيح' };
    }
    
    await connectToDB();
    
    // البحث عن المستخدم
    const user = await ShopUser.findById(decoded.id).select('-password');
    if (!user) {
      return { success: false, error: 'المستخدم غير موجود' };
    }
    
    if (!user.isActive) {
      return { success: false, error: 'الحساب غير نشط' };
    }
    
    return { success: true, user };
    
  } catch (error) {
    console.error('خطأ في التحقق من التوكن:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return { success: false, error: 'التوكن غير صحيح' };
    }
    
    if (error.name === 'TokenExpiredError') {
      return { success: false, error: 'انتهت صلاحية التوكن' };
    }
    
    return { success: false, error: 'خطأ في التحقق من التوكن' };
  }
};

// دالة middleware للحماية
export const requireShopAuth = async (request) => {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1]; // Bearer TOKEN
  
  const result = await verifyShopToken(token);
  
  if (!result.success) {
    return {
      error: result.error,
      status: 401
    };
  }
  
  return {
    user: result.user
  };
};

// دالة استخراج المستخدم من الطلب (اختيارية)
export const getShopUserFromRequest = async (request) => {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return null;
    
    const token = authHeader.split(' ')[1];
    const result = await verifyShopToken(token);
    
    return result.success ? result.user : null;
  } catch (error) {
    return null;
  }
};