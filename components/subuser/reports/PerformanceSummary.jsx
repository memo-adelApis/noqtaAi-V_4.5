"use client";

import { TrendingUp, TrendingDown, Award, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function PerformanceSummary({ data }) {
    // Safety check
    if (!data) return null;

    const { bestMonth, bestExpenseMonth, growthRate } = data;
    const isGrowthPositive = parseFloat(growthRate) >= 0;

    return (
        <div className="space-y-4">
            {/* Card 1: Best Revenue Month */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Award className="text-blue-600" size={20} />
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                        Top Performance
                    </span>
                </div>
                <div>
                    <p className="text-sm text-gray-500 mb-1">Highest Revenue Month</p>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">
                        {bestMonth?.name || "N/A"}
                    </h4>
                    <p className="text-2xl font-bold text-blue-600 font-mono" dir="ltr">
                        {/* Hydration fix: ensure consistent formatting */}
                        <span suppressHydrationWarning>
                            {Number(bestMonth?.value || 0).toLocaleString('en-US')}
                        </span>
                        <span className="text-sm text-gray-400 font-sans ml-1"> EGP</span>
                    </p>
                </div>
            </div>

            {/* Card 2: Best Expense Month */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                        <Wallet className="text-emerald-600" size={20} />
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                        Efficiency
                    </span>
                </div>
                <div>
                    <p className="text-sm text-gray-500 mb-1">Lowest Expense Month</p>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">
                        {bestExpenseMonth?.name || "N/A"}
                    </h4>
                    <p className="text-2xl font-bold text-emerald-600 font-mono" dir="ltr">
                        <span suppressHydrationWarning>
                            {Number(bestExpenseMonth?.value || 0).toLocaleString('en-US')}
                        </span>
                        <span className="text-sm text-gray-400 font-sans ml-1"> EGP</span>
                    </p>
                </div>
            </div>

            {/* Card 3: Growth Rate */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                    <div className={`p-2 rounded-lg ${isGrowthPositive ? 'bg-purple-50' : 'bg-red-50'}`}>
                        {isGrowthPositive ? (
                            <TrendingUp className="text-purple-600" size={20} />
                        ) : (
                            <TrendingDown className="text-red-600" size={20} />
                        )}
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${isGrowthPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {isGrowthPositive ? "Improved" : "Declined"}
                    </span>
                </div>
                <div>
                    <p className="text-sm text-gray-500 mb-1">Monthly Growth Rate</p>
                    <div className="flex items-baseline gap-2">
                        <h4 className={`text-3xl font-bold font-mono ${isGrowthPositive ? 'text-purple-600' : 'text-red-600'}`} dir="ltr">
                            <span suppressHydrationWarning>{growthRate}%</span>
                        </h4>
                        {isGrowthPositive ? (
                            <ArrowUpRight size={20} className="text-green-500" />
                        ) : (
                            <ArrowDownRight size={20} className="text-red-500" />
                        )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">vs Previous Month</p>
                </div>
            </div>
        </div>
    );
}