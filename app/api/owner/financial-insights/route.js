import { NextResponse } from "next/server";
import { connectToDB } from "@/utils/database";
import { getCurrentUser } from "@/app/lib/auth";
import Invoice from "@/models/Invoices";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    await connectToDB();
    
    // التحقق من صلاحيات المالك
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'owner') {
      return NextResponse.json(
        { error: "غير مصرح به - هذه الصفحة للمالك فقط" },
        { status: 403 }
      );
    }
    
    if (!currentUser.mainAccountId) {
      return NextResponse.json(
        { error: "المالك غير مرتبط بحساب مشترك" },
        { status: 403 }
      );
    }
    
    // استخدام mainAccountId بدلاً من userId
    const subscriberId = new mongoose.Types.ObjectId(currentUser.mainAccountId);
    
    // جلب المعاملات من URL
    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get('months')) || 12;
    
    // حساب تاريخ البداية
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    // جلب الفواتير
    const invoices = await Invoice.find({
      userId: subscriberId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 }).lean();
    
    if (invoices.length === 0) {
      return NextResponse.json({ error: 'no_data' });
    }
    
    // تجميع البيانات الشهرية
    const monthlyData = {};
    invoices.forEach(inv => {
      const monthKey = new Date(inv.createdAt).toISOString().slice(0, 7); // YYYY-MM
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, expenses: 0 };
      }
      
      if (inv.type === 'revenue') {
        monthlyData[monthKey].revenue += inv.totalInvoice;
      } else {
        monthlyData[monthKey].expenses += inv.totalInvoice;
      }
    });
    
    const monthlyArray = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      expenses: data.expenses,
      profit: data.revenue - data.expenses
    }));
    
    // حساب المؤشرات
    const totalRevenue = monthlyArray.reduce((sum, m) => sum + m.revenue, 0);
    const totalExpenses = monthlyArray.reduce((sum, m) => sum + m.expenses, 0);
    const totalProfit = totalRevenue - totalExpenses;
    
    // هامش الربح
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    // معدل النمو (مقارنة النصف الأول بالنصف الثاني)
    const halfPoint = Math.floor(monthlyArray.length / 2);
    const firstHalfRevenue = monthlyArray.slice(0, halfPoint).reduce((sum, m) => sum + m.revenue, 0);
    const secondHalfRevenue = monthlyArray.slice(halfPoint).reduce((sum, m) => sum + m.revenue, 0);
    const growthRate = firstHalfRevenue > 0 ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 : 0;
    
    // نسبة السيولة (الإيرادات / المصروفات)
    const liquidityRatio = totalExpenses > 0 ? totalRevenue / totalExpenses : 0;
    
    // كفاءة التشغيل (المصروفات / الإيرادات)
    const operationalEfficiency = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;
    
    // تغير هامش الربح
    const firstHalfProfit = firstHalfRevenue - monthlyArray.slice(0, halfPoint).reduce((sum, m) => sum + m.expenses, 0);
    const secondHalfProfit = secondHalfRevenue - monthlyArray.slice(halfPoint).reduce((sum, m) => sum + m.expenses, 0);
    const firstHalfMargin = firstHalfRevenue > 0 ? (firstHalfProfit / firstHalfRevenue) * 100 : 0;
    const secondHalfMargin = secondHalfRevenue > 0 ? (secondHalfProfit / secondHalfRevenue) * 100 : 0;
    const profitMarginChange = secondHalfMargin - firstHalfMargin;
    
    // حساب درجة الصحة المالية (من 100)
    let healthScore = 0;
    
    // هامش الربح (40 نقطة)
    if (profitMargin >= 30) healthScore += 40;
    else if (profitMargin >= 20) healthScore += 30;
    else if (profitMargin >= 10) healthScore += 20;
    else if (profitMargin >= 0) healthScore += 10;
    
    // معدل النمو (30 نقطة)
    if (growthRate >= 20) healthScore += 30;
    else if (growthRate >= 10) healthScore += 20;
    else if (growthRate >= 0) healthScore += 10;
    
    // نسبة السيولة (30 نقطة)
    if (liquidityRatio >= 2) healthScore += 30;
    else if (liquidityRatio >= 1.5) healthScore += 20;
    else if (liquidityRatio >= 1) healthScore += 10;
    
    // تحديد الحالة
    let healthStatus = 'poor';
    if (healthScore >= 80) healthStatus = 'excellent';
    else if (healthScore >= 60) healthStatus = 'good';
    
    // تحديد الاتجاه
    let trend = 'stable';
    if (growthRate > 5) trend = 'up';
    else if (growthRate < -5) trend = 'down';
    
    // التوصية الرئيسية
    let recommendation = 'استمر في الأداء الجيد';
    if (healthScore < 60) {
      recommendation = 'يُنصح بمراجعة المصروفات وزيادة الإيرادات';
    } else if (profitMargin < 10) {
      recommendation = 'ركز على تحسين هامش الربح';
    }
    
    // التنبؤات (بسيطة - متوسط آخر 3 أشهر + معدل النمو)
    const lastThreeMonths = monthlyArray.slice(-3);
    const avgRevenue = lastThreeMonths.reduce((sum, m) => sum + m.revenue, 0) / 3;
    const avgExpenses = lastThreeMonths.reduce((sum, m) => sum + m.expenses, 0) / 3;
    
    const predictions = {
      revenue: [],
      expenses: [],
      expensesGrowth: (avgExpenses / avgRevenue) * 100
    };
    
    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    for (let i = 1; i <= 3; i++) {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + i);
      const monthName = monthNames[futureDate.getMonth()];
      
      const growthFactor = 1 + (growthRate / 100 / 12); // نمو شهري
      
      predictions.revenue.push({
        month: monthName,
        predicted: Math.round(avgRevenue * Math.pow(growthFactor, i)),
        confidence: Math.max(60, 90 - (i * 10)) // تقل الثقة مع البعد في المستقبل
      });
      
      predictions.expenses.push({
        month: monthName,
        predicted: Math.round(avgExpenses * Math.pow(1.02, i)), // افتراض زيادة 2% شهرياً
        confidence: Math.max(60, 90 - (i * 10))
      });
    }
    
    // التحليل
    const analysis = {
      strengths: [],
      weaknesses: []
    };
    
    if (profitMargin >= 20) {
      analysis.strengths.push('هامش ربح ممتاز يتجاوز 20%');
    }
    if (growthRate > 10) {
      analysis.strengths.push(`نمو قوي في الإيرادات بنسبة ${growthRate.toFixed(1)}%`);
    }
    if (liquidityRatio >= 1.5) {
      analysis.strengths.push('سيولة مالية جيدة');
    }
    if (trend === 'up') {
      analysis.strengths.push('اتجاه تصاعدي مستمر');
    }
    
    if (profitMargin < 10) {
      analysis.weaknesses.push('هامش الربح منخفض ويحتاج تحسين');
    }
    if (growthRate < 0) {
      analysis.weaknesses.push('تراجع في الإيرادات');
    }
    if (liquidityRatio < 1) {
      analysis.weaknesses.push('المصروفات تتجاوز الإيرادات');
    }
    if (operationalEfficiency > 80) {
      analysis.weaknesses.push('المصروفات التشغيلية مرتفعة');
    }
    
    // التوصيات
    const recommendations = [];
    
    if (profitMargin < 15) {
      recommendations.push({
        title: 'تحسين هامش الربح',
        description: 'راجع استراتيجية التسعير وقلل المصروفات غير الضرورية',
        priority: 'high'
      });
    }
    
    if (growthRate < 5) {
      recommendations.push({
        title: 'تسريع النمو',
        description: 'استثمر في التسويق وتوسيع قاعدة العملاء',
        priority: 'high'
      });
    }
    
    if (operationalEfficiency > 70) {
      recommendations.push({
        title: 'تحسين الكفاءة التشغيلية',
        description: 'راجع المصروفات الثابتة وابحث عن فرص للتوفير',
        priority: 'medium'
      });
    }
    
    if (liquidityRatio < 1.2) {
      recommendations.push({
        title: 'تعزيز السيولة',
        description: 'ركز على تحصيل المستحقات وتأجيل المدفوعات غير العاجلة',
        priority: 'high'
      });
    }
    
    if (recommendations.length === 0) {
      recommendations.push({
        title: 'الحفاظ على الأداء',
        description: 'استمر في استراتيجيتك الحالية مع مراقبة المؤشرات',
        priority: 'low'
      });
    }
    
    return NextResponse.json({
      healthScore: Math.round(healthScore),
      healthStatus,
      trend,
      recommendation,
      kpis: {
        profitMargin,
        profitMarginChange,
        growthRate,
        liquidityRatio,
        operationalEfficiency
      },
      predictions,
      analysis,
      recommendations
    });
    
  } catch (error) {
    console.error("Error in financial insights:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء تحليل البيانات المالية" },
      { status: 500 }
    );
  }
}
