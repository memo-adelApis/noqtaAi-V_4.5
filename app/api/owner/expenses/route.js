import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from "@/utils/database";
import Expense from '@/models/Expense';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query
    const query = {
      createdBy: session.user.id
    };

    if (category) {
      query.category = category;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get expenses with pagination
    const expenses = await Expense.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    return NextResponse.json(expenses);

  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    const body = await request.json();
    const {
      description,
      amount,
      category,
      date,
      paymentMethod,
      vendor,
      reference,
      notes
    } = body;

    // Validate required fields
    if (!description || !amount || !category || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new expense
    const expense = new Expense({
      description,
      amount: parseFloat(amount),
      category,
      date: new Date(date),
      paymentMethod: paymentMethod || 'cash',
      vendor,
      reference,
      notes,
      createdBy: session.user.id,
      status: 'approved' // Auto-approve for owner
    });

    await expense.save();

    // Populate the created expense
    await expense.populate('createdBy', 'name email');

    return NextResponse.json(expense, { status: 201 });

  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}