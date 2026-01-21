/**
 * دوال آمنة للبناء - تتعامل مع حالة عدم توفر قاعدة البيانات
 */

import { connectToDB } from "@/utils/database";

/**
 * تنفيذ آمن لاستعلام قاعدة البيانات أثناء البناء
 */
export async function safeDatabaseQuery(queryFunction, fallbackValue = null) {
  // في بيئة البناء، تجاهل استعلامات قاعدة البيانات
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production') {
    return fallbackValue;
  }

  try {
    await connectToDB();
    return await queryFunction();
  } catch (error) {
    console.warn('Database query failed during build:', error.message);
    return fallbackValue;
  }
}

/**
 * تنفيذ آمن لعدة استعلامات متوازية
 */
export async function safeParallelQueries(queries, fallbackValues = []) {
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production') {
    return fallbackValues;
  }

  try {
    await connectToDB();
    return await Promise.all(queries);
  } catch (error) {
    console.warn('Parallel database queries failed during build:', error.message);
    return fallbackValues;
  }
}

/**
 * فحص حالة الاتصال بقاعدة البيانات
 */
export async function isDatabaseAvailable() {
  try {
    await connectToDB();
    return true;
  } catch (error) {
    return false;
  }
}