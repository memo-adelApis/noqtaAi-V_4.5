/**
 * قاموس تحويل من العربية الفصحى للهجة المصرية
 */
export const egyptianDictionary = {
  // الكلمات الشائعة
  'لوحة التحكم': 'لوحة التحكم',
  'إدارة': 'إدارة',
  'الفواتير': 'الفواتير',
  'الإيرادات': 'الإيرادات',
  'المصروفات': 'المصروفات',
  'الفروع': 'الفروع',
  'المنتجات': 'المنتجات',
  'الموردين': 'الموردين',
  'العملاء': 'العملاء',
  'التقارير': 'التقارير',
  'الإعدادات': 'الإعدادات',
  
  // الأفعال
  'إضافة': 'إضافة',
  'تعديل': 'تعديل',
  'حذف': 'حذف',
  'حفظ': 'حفظ',
  'إلغاء': 'إلغاء',
  'بحث': 'بحث',
  'تصدير': 'تصدير',
  'طباعة': 'طباعة',
  
  // الحالات
  'نشط': 'نشط',
  'معلق': 'معلق',
  'مكتمل': 'مكتمل',
  'ملغي': 'ملغي',
  'مدفوع': 'مدفوع',
  'غير مدفوع': 'مش مدفوع',
  
  // الأرقام والعملات
  'ريال': 'جنيه', // أو 'ريال' حسب العملة
  'دولار': 'دولار',
  
  // الرسائل
  'تم الحفظ بنجاح': 'تم الحفظ بنجاح',
  'حدث خطأ': 'حصل خطأ',
  'هل أنت متأكد': 'انت متأكد؟',
  'لا توجد بيانات': 'مفيش بيانات',
  'جاري التحميل': 'بيحمل...',
  
  // التواريخ
  'اليوم': 'النهاردة',
  'أمس': 'امبارح',
  'غداً': 'بكرة',
  'هذا الأسبوع': 'الأسبوع ده',
  'هذا الشهر': 'الشهر ده',
  'هذا العام': 'السنة دي',
};

/**
 * تحويل النص للهجة المصرية
 * @param {string} text - النص المراد تحويله
 * @returns {string} - النص بالهجة المصرية
 */
export function toEgyptian(text) {
  if (!text) return text;
  
  let result = text;
  
  // استبدال الكلمات من القاموس
  Object.entries(egyptianDictionary).forEach(([formal, egyptian]) => {
    result = result.replace(new RegExp(formal, 'g'), egyptian);
  });
  
  return result;
}

/**
 * تنسيق الأرقام بالإنجليزية
 * @param {number} num - الرقم المراد تنسيقه
 * @returns {string} - الرقم بالأرقام الإنجليزية
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  
  // تحويل الرقم لنص بالأرقام الإنجليزية
  return num.toLocaleString('en-US');
}

/**
 * تنسيق العملة بالأرقام الإنجليزية
 * @param {number} amount - المبلغ
 * @param {string} currency - العملة (SAR, EGP, USD)
 * @returns {string} - المبلغ منسق
 */
export function formatCurrency(amount, currency = 'SAR') {
  if (amount === null || amount === undefined) return '0';
  
  const currencyNames = {
    'SAR': 'ريال',
    'EGP': 'جنيه',
    'USD': 'دولار',
    'AED': 'درهم'
  };
  
  // استخدام الأرقام الإنجليزية
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  
  return `${formatted} ${currencyNames[currency] || currency}`;
}

/**
 * تنسيق التاريخ بالأرقام الإنجليزية
 * @param {Date|string} date - التاريخ
 * @returns {string} - التاريخ منسق
 */
export function formatDate(date) {
  if (!date) return '';
  
  const d = new Date(date);
  
  // استخدام الأرقام الإنجليزية
  return d.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export default {
  toEgyptian,
  formatNumber,
  formatCurrency,
  formatDate,
  egyptianDictionary
};