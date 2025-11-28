import { useMemo } from 'react';
import * as ss from 'simple-statistics';

export function usePerformanceAI(invoices) {
    const analysis = useMemo(() => {
        if (!invoices || invoices.length === 0) return null;

        // 1. تجميع البيانات حسب الشهور
        const monthlyData = {};
        
        invoices.forEach(inv => {
            const date = new Date(inv.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; 
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { revenue: 0, expenses: 0, net: 0, count: 0 };
            }

            if (inv.type === 'revenue' || !inv.type) { 
                monthlyData[monthKey].revenue += inv.totalInvoice || inv.total || 0; // دعم التسميتين
            } else {
                monthlyData[monthKey].expenses += inv.totalInvoice || inv.total || 0;
            }
            
            monthlyData[monthKey].net = monthlyData[monthKey].revenue - monthlyData[monthKey].expenses;
            monthlyData[monthKey].count += 1;
        });

        const sortedMonths = Object.keys(monthlyData).sort().map(key => ({
            month: key,
            ...monthlyData[key]
        }));

        // تجهيز بيانات الشارت (يعمل دائماً)
        const chartData = sortedMonths.map(m => ({
            name: formatMonth(m.month), 
            date: m.month.substring(5), // MM format for short chart
            revenue: m.revenue,
            expenses: m.expenses,
            net: m.net,
            count: m.count
        }));

        // --- السيناريو أ: شهر واحد فقط (بيانات غير كافية للتنبؤ) ---
        if (sortedMonths.length < 2) {
            const current = sortedMonths[0];
            return {
                chartData,
                transactionCounts: { current: current.count, previous: 0 },
                bestMonth: { name: formatMonth(current.month), value: current.revenue },
                bestExpenseMonth: { name: formatMonth(current.month), value: current.expenses },
                growthRate: "100", // أو 0 حسب تفضيلك
                prediction: {
                    nextMonthRevenue: current.revenue, // نتوقع نفس الأداء مبدئياً
                    trend: 'up',
                    accuracy: 'بيانات أولية'
                },
                branchHealth: "بداية جديدة 🌱"
            };
        }

        // --- السيناريو ب: شهرين أو أكثر (تحليل كامل) ---
        const lastMonth = sortedMonths[sortedMonths.length - 1];
        const previousMonth = sortedMonths[sortedMonths.length - 2];

        const bestMonth = sortedMonths.reduce((prev, current) => (prev.revenue > current.revenue) ? prev : current);
        const lowestExpenseMonth = sortedMonths.reduce((prev, current) => (prev.expenses < current.expenses && current.expenses > 0) ? prev : current);

        const growthRate = previousMonth.revenue > 0 
            ? ((lastMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100 
            : 100;

        // Linear Regression
        const regressionData = sortedMonths.map((data, index) => [index, data.revenue]);
        const regressionLine = ss.linearRegression(regressionData);
        const predict = ss.linearRegressionLine(regressionLine);
        const nextMonthPrediction = predict(sortedMonths.length);
        
        let branchHealth = "مستقر";
        if (growthRate > 10) branchHealth = "نمو سريع 🚀";
        else if (growthRate > 0) branchHealth = "نمو جيد 📈";
        else if (growthRate > -10) branchHealth = "تراجع طفيف 📉";
        else branchHealth = "يحتاج انتباه ⚠️";

        return {
            chartData,
            transactionCounts: {
                current: lastMonth.count,
                previous: previousMonth.count
            },
            bestMonth: { name: formatMonth(bestMonth.month), value: bestMonth.revenue },
            bestExpenseMonth: { name: formatMonth(lowestExpenseMonth.month), value: lowestExpenseMonth.expenses },
            growthRate: growthRate.toFixed(1),
            prediction: {
                nextMonthRevenue: Math.max(0, nextMonthPrediction),
                trend: regressionLine.m > 0 ? 'up' : 'down',
                accuracy: 'متوسطة'
            },
            branchHealth
        };

    }, [invoices]);

    return analysis;
}

function formatMonth(dateStr) {
    const date = new Date(`${dateStr}-01`);
    return date.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
}