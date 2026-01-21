"use client";

import { useState, useEffect } from 'react';
import { 
  ShoppingBag, Users, Eye, TrendingUp, TrendingDown,
  Calendar, Filter, Download, RefreshCw, Star,
  Package, MessageCircle, Heart, ShoppingCart,
  BarChart3, PieChart, Activity, DollarSign
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function ShopReportsClient({ user }) {
  const [loading, setLoading] = useState(true);
  const [shopData, setShopData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState('30'); // آخر 30 يوم
  const [selectedPeriod, setSelectedPeriod] = useState('daily');

  useEffect(() => {
    fetchShopReports();
  }, [dateRange, selectedPeriod]);

  const fetchShopReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/owner/shop-reports?days=${dateRange}&period=${selectedPeriod}`);
      const data = await response.json();

      if (response.ok) {
        setShopData(data.shopData);
        setAnalytics(data.analytics);
      } else {
        toast.error(data.error || 'فشل في تحميل التقارير');
      }
    } catch (error) {
      console.error('خطأ في جلب تقارير المتجر:', error);
      toast.error('حدث خطأ في تحميل التقارير');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const formatCurrency = (amount) => {
    return `${formatNumber(amount)} جنيه`;
  };

  const getPercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">جاري تحميل تقارير المتجر...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">تقارير المتجر الإلكتروني</h1>
              <p className="text-gray-300">تحليل شامل لأداء المتجر والمبيعات الإلكترونية</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchShopReports}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                تحديث
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-600 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors">
                <Download className="w-4 h-4" />
                تصدير
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">آخر 7 أيام</option>
              <option value="30">آخر 30 يوم</option>
              <option value="90">آخر 3 أشهر</option>
              <option value="365">آخر سنة</option>
            </select>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="daily">يومي</option>
              <option value="weekly">أسبوعي</option>
              <option value="monthly">شهري</option>
            </select>
          </div>
        </div>

        {/* Shop Overview */}
        {shopData && (
          <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">نظرة عامة على المتجر</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">{shopData.name}</h3>
                <p className="text-gray-300">/{shopData.uniqueName}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
                  shopData.status === 'active' 
                    ? 'bg-green-900 text-green-300' 
                    : 'bg-red-900 text-red-300'
                }`}>
                  {shopData.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">{formatNumber(shopData.stats?.totalProducts)}</h3>
                <p className="text-gray-300">إجمالي المنتجات</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">{formatNumber(shopData.stats?.totalCustomers)}</h3>
                <p className="text-gray-300">إجمالي العملاء</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">{shopData.rating?.average?.toFixed(1) || '0.0'}</h3>
                <p className="text-gray-300">متوسط التقييم</p>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Cards */}
        {analytics && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">إجمالي المبيعات</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(analytics.totalRevenue?.current)}
                    </p>
                    <div className={`flex items-center gap-1 text-sm ${getChangeColor(analytics.totalRevenue?.change)}`}>
                      {getChangeIcon(analytics.totalRevenue?.change)}
                      <span>{Math.abs(analytics.totalRevenue?.change || 0)}%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-900 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">عدد الطلبات</p>
                    <p className="text-2xl font-bold text-white">
                      {formatNumber(analytics.totalOrders?.current)}
                    </p>
                    <div className={`flex items-center gap-1 text-sm ${getChangeColor(analytics.totalOrders?.change)}`}>
                      {getChangeIcon(analytics.totalOrders?.change)}
                      <span>{Math.abs(analytics.totalOrders?.change || 0)}%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">الزوار</p>
                    <p className="text-2xl font-bold text-white">
                      {formatNumber(analytics.totalVisitors?.current)}
                    </p>
                    <div className={`flex items-center gap-1 text-sm ${getChangeColor(analytics.totalVisitors?.change)}`}>
                      {getChangeIcon(analytics.totalVisitors?.change)}
                      <span>{Math.abs(analytics.totalVisitors?.change || 0)}%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-900 rounded-full flex items-center justify-center">
                    <Eye className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">معدل التحويل</p>
                    <p className="text-2xl font-bold text-white">
                      {analytics.conversionRate?.current?.toFixed(1)}%
                    </p>
                    <div className={`flex items-center gap-1 text-sm ${getChangeColor(analytics.conversionRate?.change)}`}>
                      {getChangeIcon(analytics.conversionRate?.change)}
                      <span>{Math.abs(analytics.conversionRate?.change || 0)}%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-orange-900 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">أفضل المنتجات مبيعاً</h3>
                <div className="space-y-4">
                  {analytics.topProducts?.map((product, index) => (
                    <div key={product._id} className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-400">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{product.name}</h4>
                        <p className="text-sm text-gray-300">{formatNumber(product.totalSold)} مبيعة</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-white">{formatCurrency(product.revenue)}</p>
                        <p className="text-sm text-gray-300">إيراد</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">أحدث التقييمات</h3>
                <div className="space-y-4">
                  {analytics.recentReviews?.map((review) => (
                    <div key={review._id} className="border-b border-gray-700 pb-4 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-300">{review.reviewer?.name}</span>
                      </div>
                      <p className="text-sm text-gray-200 line-clamp-2">{review.comment}</p>
                      <p className="text-xs text-gray-400 mt-1">{review.productName}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Customer Insights */}
            <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">إحصائيات العملاء</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-green-400" />
                  </div>
                  <h4 className="text-2xl font-bold text-white">{formatNumber(analytics.customerStats?.newCustomers)}</h4>
                  <p className="text-gray-300">عملاء جدد</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-8 h-8 text-blue-400" />
                  </div>
                  <h4 className="text-2xl font-bold text-white">{formatNumber(analytics.customerStats?.returningCustomers)}</h4>
                  <p className="text-gray-300">عملاء عائدون</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-8 h-8 text-purple-400" />
                  </div>
                  <h4 className="text-2xl font-bold text-white">{formatCurrency(analytics.customerStats?.averageOrderValue)}</h4>
                  <p className="text-gray-300">متوسط قيمة الطلب</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* No Data State */}
        {!shopData && !loading && (
          <div className="bg-gray-800 rounded-lg shadow-sm p-12 text-center border border-gray-700">
            <ShoppingBag className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">لا يوجد متجر إلكتروني</h3>
            <p className="text-gray-300 mb-6">لم يتم إنشاء متجر إلكتروني بعد</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              إنشاء متجر إلكتروني
            </button>
          </div>
        )}
      </div>
    </div>
  );
}