import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { seedCategories, clearAllCategories } from '@/utils/seedCategories';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح بالوصول' },
        { status: 401 }
      );
    }

    const userId = session.user.mainAccountId || session.user.id;
    const branchId = session.user.branchId;

    if (!branchId) {
      return NextResponse.json(
        { success: false, error: 'لا يمكن إنشاء الفئات بدون فرع مرتبط' },
        { status: 400 }
      );
    }

    const { action } = await request.json();

    let result;
    
    if (action === 'seed') {
      result = await seedCategories(userId, branchId);
    } else if (action === 'clear') {
      result = await clearAllCategories(userId, branchId);
    } else {
      return NextResponse.json(
        { success: false, error: 'إجراء غير صحيح' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in seed-categories API:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}