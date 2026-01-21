import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from "@/utils/database";
import Invoice from '@/models/Invoices';
import Expense from '@/models/Expense';
import User from '@/models/User';

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
    const format = searchParams.get('format') || 'pdf';

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
    }

    // Get user information (business name)
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Get the same data as the main endpoint
    const invoices = await Invoice.find({
      userId: session.user.id,
      type: 'revenue',
      createdAt: { $gte: start, $lte: end },
      status: { $in: ['paid', 'completed'] }
    });

    let salesRevenue = 0;
    let serviceRevenue = 0;
    let otherRevenue = 0;

    invoices.forEach(invoice => {
      const invoiceTotal = invoice.totalInvoice || 0;
      salesRevenue += invoiceTotal;
    });

    const totalRevenue = salesRevenue + serviceRevenue + otherRevenue;

    const expenses = await Expense.find({
      createdBy: session.user.id,
      date: { $gte: start, $lte: end },
      status: 'approved'
    });

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
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Generate HTML for PDF
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount || 0);
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Profit & Loss Statement</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .report-title { font-size: 20px; margin-bottom: 10px; }
          .period { font-size: 14px; color: #666; }
          .section { margin: 30px 0; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; padding: 10px; background-color: #f5f5f5; }
          .revenue-section { border-left: 4px solid #10b981; }
          .expense-section { border-left: 4px solid #ef4444; }
          .summary-section { border-left: 4px solid #3b82f6; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f8f9fa; font-weight: bold; }
          .amount { text-align: right; font-weight: bold; }
          .total-row { border-top: 2px solid #333; font-weight: bold; font-size: 16px; }
          .positive { color: #10b981; }
          .negative { color: #ef4444; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${user.name}</div>
          <div class="report-title">Profit & Loss Statement</div>
          <div class="period">Period: ${formatDate(startDate)} to ${formatDate(endDate)}</div>
        </div>

        <div class="section revenue-section">
          <div class="section-title">REVENUE</div>
          <table>
            <tr>
              <td>Sales Revenue</td>
              <td class="amount positive">${formatCurrency(salesRevenue)}</td>
            </tr>
            <tr>
              <td>Service Revenue</td>
              <td class="amount positive">${formatCurrency(serviceRevenue)}</td>
            </tr>
            <tr>
              <td>Other Revenue</td>
              <td class="amount positive">${formatCurrency(otherRevenue)}</td>
            </tr>
            <tr class="total-row">
              <td>TOTAL REVENUE</td>
              <td class="amount positive">${formatCurrency(totalRevenue)}</td>
            </tr>
          </table>
        </div>

        <div class="section expense-section">
          <div class="section-title">EXPENSES</div>
          <table>
            <tr>
              <td>Cost of Goods Sold</td>
              <td class="amount negative">${formatCurrency(cogsExpenses)}</td>
            </tr>
            <tr>
              <td>Operating Expenses</td>
              <td class="amount negative">${formatCurrency(operatingExpenses)}</td>
            </tr>
            <tr>
              <td>Administrative Expenses</td>
              <td class="amount negative">${formatCurrency(administrativeExpenses)}</td>
            </tr>
            <tr>
              <td>Other Expenses</td>
              <td class="amount negative">${formatCurrency(otherExpenses)}</td>
            </tr>
            <tr class="total-row">
              <td>TOTAL EXPENSES</td>
              <td class="amount negative">${formatCurrency(totalExpenses)}</td>
            </tr>
          </table>
        </div>

        <div class="section summary-section">
          <div class="section-title">NET PROFIT SUMMARY</div>
          <table>
            <tr>
              <td>Total Revenue</td>
              <td class="amount positive">${formatCurrency(totalRevenue)}</td>
            </tr>
            <tr>
              <td>Total Expenses</td>
              <td class="amount negative">${formatCurrency(totalExpenses)}</td>
            </tr>
            <tr class="total-row">
              <td>NET PROFIT</td>
              <td class="amount ${netProfit >= 0 ? 'positive' : 'negative'}">${formatCurrency(netProfit)}</td>
            </tr>
            <tr>
              <td>Profit Margin</td>
              <td class="amount ${profitMargin >= 0 ? 'positive' : 'negative'}">${profitMargin.toFixed(2)}%</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          Generated on ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </body>
      </html>
    `;

    if (format === 'html') {
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="profit-loss-statement-${startDate}-to-${endDate}.html"`
        }
      });
    }

    // For PDF generation, you would typically use a library like puppeteer or jsPDF
    // For now, return the HTML content with PDF headers
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="profit-loss-statement-${startDate}-to-${endDate}.html"`
      }
    });

  } catch (error) {
    console.error('Error exporting profit-loss statement:', error);
    return NextResponse.json(
      { error: 'Failed to export profit-loss statement' },
      { status: 500 }
    );
  }
}