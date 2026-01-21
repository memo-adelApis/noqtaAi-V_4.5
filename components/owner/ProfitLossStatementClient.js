'use client';

import { useState, useEffect } from 'react';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'react-toastify';
import UIButton from '@/components/ui/UIButton';

export default function ProfitLossStatementClient() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [profitLossData, setProfitLossData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProfitLossData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/owner/profit-loss?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      if (!response.ok) throw new Error('Failed to fetch profit-loss data');
      
      const data = await response.json();
      setProfitLossData(data);
    } catch (error) {
      console.error('Error fetching profit-loss data:', error);
      toast.error('Failed to load profit-loss statement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfitLossData();
  }, [dateRange, fetchProfitLossData]);

  const handleExportPDF = async () => {
    try {
      const response = await fetch(`/api/owner/profit-loss/export?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&format=pdf`);
      if (!response.ok) throw new Error('Failed to export PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `profit-loss-statement-${dateRange.startDate}-to-${dateRange.endDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profit & Loss Statement</h1>
          <p className="text-gray-600">Financial performance overview</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <UIButton 
            label="Export PDF"
            onClick={handleExportPDF}
            icon={Download}
            gradientFrom="green-500"
            gradientTo="emerald-500"
          />
        </div>
      </div>

      {profitLossData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Revenue Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(profitLossData.totalRevenue)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>

            {/* Total Expenses Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(profitLossData.totalExpenses)}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </div>

            {/* Net Profit Card */}
            <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${profitLossData.netProfit >= 0 ? 'border-green-500' : 'border-red-500'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Profit</p>
                  <p className={`text-2xl font-bold ${profitLossData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(profitLossData.netProfit)}
                  </p>
                </div>
                {profitLossData.netProfit >= 0 ? 
                  <TrendingUp className="h-8 w-8 text-green-600" /> : 
                  <TrendingDown className="h-8 w-8 text-red-600" />
                }
              </div>
            </div>

            {/* Profit Margin Card */}
            <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${profitLossData.profitMargin >= 0 ? 'border-blue-500' : 'border-red-500'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profit Margin</p>
                  <p className={`text-2xl font-bold ${profitLossData.profitMargin >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatPercentage(profitLossData.profitMargin)}
                  </p>
                </div>
                {profitLossData.profitMargin >= 0 ? 
                  <TrendingUp className="h-8 w-8 text-blue-600" /> : 
                  <TrendingDown className="h-8 w-8 text-red-600" />
                }
              </div>
            </div>
          </div>

          {/* Detailed Statement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Breakdown */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-green-600">Revenue</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Sales Revenue</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(profitLossData.revenue.sales)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Service Revenue</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(profitLossData.revenue.services)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Other Revenue</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(profitLossData.revenue.other)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 pt-3 border-t-2 border-gray-300">
                    <span className="font-bold text-lg">Total Revenue</span>
                    <span className="font-bold text-lg text-green-600">
                      {formatCurrency(profitLossData.totalRevenue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Expenses Breakdown */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-red-600">Expenses</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Cost of Goods Sold</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(profitLossData.expenses.cogs)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Operating Expenses</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(profitLossData.expenses.operating)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Administrative Expenses</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(profitLossData.expenses.administrative)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Other Expenses</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(profitLossData.expenses.other)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 pt-3 border-t-2 border-gray-300">
                    <span className="font-bold text-lg">Total Expenses</span>
                    <span className="font-bold text-lg text-red-600">
                      {formatCurrency(profitLossData.totalExpenses)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Net Profit Summary */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">Net Profit Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(profitLossData.totalRevenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Expenses</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(profitLossData.totalExpenses)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Net Profit</p>
                    <p className={`text-2xl font-bold ${profitLossData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(profitLossData.netProfit)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Margin: {formatPercentage(profitLossData.profitMargin)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}