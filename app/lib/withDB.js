import dbConnect from './dbConnect';

/**
 * Higher-order function لإضافة اتصال قاعدة البيانات تلقائياً
 * @param {Function} handler - دالة الصفحة
 * @returns {Function} - دالة محسنة مع اتصال قاعدة البيانات
 */
export function withDB(handler) {
  return async (...args) => {
    await dbConnect();
    return handler(...args);
  };
}

export default withDB;