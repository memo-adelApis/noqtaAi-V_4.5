import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { checkUserLimit } from '@/utils/limitsChecker';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 401 }
      );
    }

    const { userId, limitType } = await request.json();

    if (!userId || !limitType) {
      return NextResponse.json(
        { error: 'معرف المستخدم ونوع الحد مطلوبان' },
        { status: 400 }
      );
    }

    const limitStatus = await checkUserLimit(userId, limitType);
    
    return NextResponse.json(limitStatus);

  } catch (error) {
    console.error('Error in check-limit API:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    // الحصول على جميع حدود المستخدم
    const { getUserLimitsStatus } = await import('@/utils/limitsChecker');
    const limitsStatus = await getUserLimitsStatus(userId);
    
    if (!limitsStatus) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json(limitsStatus);

  } catch (error) {
    console.error('Error in get limits API:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}