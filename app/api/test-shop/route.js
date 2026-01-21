import { NextResponse } from 'next/server';
import { connectToDB } from '@/utils/database';
import Shop from '@/models/Shop';

export async function GET() {
  try {
    await connectToDB();
    
    const shops = await Shop.find({}).limit(5);
    
    return NextResponse.json({
      success: true,
      count: shops.length,
      shops: shops.map(shop => ({
        name: shop.name,
        uniqueName: shop.uniqueName,
        status: shop.status,
        url: `/shop/${shop.uniqueName}`
      }))
    });
    
  } catch (error) {
    console.error('خطأ في اختبار المتاجر:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}