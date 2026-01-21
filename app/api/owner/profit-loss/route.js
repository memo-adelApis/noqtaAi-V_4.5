import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from "@/utils/database";
import Invoice from '@/models/Invoices';
import Expense from '@/models/Expense';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date

    // Get revenue data from invoices (type: "revenue" and status: "paid")
    const invoices = await Invoice.find({
      userId: session.user.id,
      type: 'revenue',
      createdAt: { $gte: start, $lte: end },
      status: { $in: ['paid', 'completed'] }
    });

    // Calculate revenue breakdown
    let salesRevenue = 0;
    let serviceRevenue = 0;
    let otherRevenue = 0;

    invoices.forEach(invoice => {
      // Use totalInvoice from the invoice instead of calculating items
      const invoiceTotal = invoice.totalInvoice || 0;
      
      // For now, categorize all revenue as sales revenue
      // You can enhance this logic based on your item categories
      salesRevenue += invoiceTotal;
    });

    const totalRevenue = salesRevenue + serviceRevenue + otherRevenue;

    // Get expense data
    const expenses = await Expense.find({
      createdBy: session.user.id,
      date: { $gte: start, $lte: end },
      status: 'approved'
    });

    // Calculate expense breakdown
    let cogsExpenses = 0;
    let operatingExpenses = 0;
    let administrativeExpenses = 0;
    let otherExpenses = 0;

    expenses.forEach(expense => {
      const category = expense.category.toLowerCase();
      
      if (category.includes('cogs') || category === 'cogs') {
        cogsExpenses += expense.amount;
      } else if (category.includes('operating') || category === 'operating' || 
                 category.includes('utilities') || category === 'utilities' ||
                 category.includes('rent') || category === 'rent') {
        operatingExpenses += expense.amount;
      } else if (category.includes('admin') || category === 'administrative' || 
                 category.includes('salary') || category === 'salary' ||
                 category.includes('office') || category === 'office supplies') {
        administrativeExpenses += expense.amount;
      } else {
        otherExpenses += expense.amount;
      }
    });

    const totalExpenses = cogsExpenses + operatingExpenses + administrativeExpenses + otherExpenses;

    // Calculate profit metrics
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const profitLossData = {
      period: {
        startDate,
        endDate
      },
      revenue: {
        sales: salesRevenue,
        services: serviceRevenue,
        other: otherRevenue
      },
      totalRevenue,
      expenses: {
        cogs: cogsExpenses,
        operating: operatingExpenses,
        administrative: administrativeExpenses,
        other: otherExpenses
      },
      totalExpenses,
      netProfit,
      profitMargin,
      // Additional metrics
      grossProfit: totalRevenue - cogsExpenses,
      grossMargin: totalRevenue > 0 ? ((totalRevenue - cogsExpenses) / totalRevenue) * 100 : 0,
      operatingProfit: totalRevenue - cogsExpenses - operatingExpenses,
      operatingMargin: totalRevenue > 0 ? ((totalRevenue - cogsExpenses - operatingExpenses) / totalRevenue) * 100 : 0
    };

    return NextResponse.json(profitLossData);

  } catch (error) {
    console.error('Error fetching profit-loss data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profit-loss data' },
      { status: 500 }
    );
  }
}