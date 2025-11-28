import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectToDB = async () => {
  // 1. إذا كان هناك اتصال مسبق، استخدمه فوراً
  if (cached.conn) {
    return cached.conn;
  }

  // 2. إذا لم يكن هناك وعد بالاتصال، أنشئ واحداً جديداً
  if (!cached.promise) {
    const opts = {
      dbName: "InvoicesDB",
      bufferCommands: false, // يمنع انتظار الأوامر إذا كانت الداتا بيس مفصولة (يفشل بسرعة أفضل)
    };

    mongoose.set('strictQuery', true);

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ New MongoDB Connection Established');
      return mongoose;
    });
  }

  // 3. انتظار انتهاء الاتصال وحفظه
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // إعادة تعيين الوعد ليتمكن من المحاولة مرة أخرى لاحقاً
    console.error('❌ MongoDB Connection Error:', e);
    throw e;
  }

  return cached.conn;
};