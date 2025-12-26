import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import Button from '@components/ui/Button';
import type { AdminOutletContext } from '@layouts/AdminLayout';
import { AnalyticsService } from '@/services/analyticsService';
import type { OrderAnalytics, OrderStatusTrends, ProductPerformance, ProductSalesTrends } from '@/types';
import { useTranslation } from '../../hooks/useTranslation';

const AdminAnalytics: React.FC = () => {
  const { getDateRangeLabel } = useOutletContext<AdminOutletContext>();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');

  // Analytics data
  const [orderAnalytics, setOrderAnalytics] = useState<OrderAnalytics | null>(null);
  const [orderStatusTrends, setOrderStatusTrends] = useState<OrderStatusTrends[]>([]);
  const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([]);
  const [productSalesTrends, setProductSalesTrends] = useState<ProductSalesTrends[]>([]);

  // Date range
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const analyticsService = AnalyticsService.getInstance();

  // Load analytics data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setLoading(true);

        const [orderData, statusTrends, productsPerf, salesTrends] = await Promise.all([
          analyticsService.getOrderAnalytics(dateRange.startDate, dateRange.endDate, 'month'),
          analyticsService.getOrderStatusTrends(dateRange.startDate, dateRange.endDate),
          analyticsService.getProductPerformance(dateRange.startDate, dateRange.endDate, 10),
          analyticsService.getProductSalesTrends(dateRange.startDate, dateRange.endDate, 'month')
        ]);

        setOrderAnalytics(orderData);
        setOrderStatusTrends(statusTrends);
        setProductPerformance(productsPerf);
        setProductSalesTrends(salesTrends);

      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [dateRange]);

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  // Helper for currency
  const fmt = (num: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Phân tích dữ liệu</h1>
          <p className="text-slate-400 text-sm mt-1">
            Phân tích chi tiết về đơn hàng, sản phẩm và hiệu suất
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange(e.target.value, dateRange.endDate)}
              className="bg-background-dark border border-border-dark text-white text-sm rounded-lg px-3 py-2 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none cursor-pointer"
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange(dateRange.startDate, e.target.value)}
              className="bg-background-dark border border-border-dark text-white text-sm rounded-lg px-3 py-2 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none cursor-pointer"
            />
          </div>
          <Button variant="primary" icon="refresh" size="sm" onClick={() => window.location.reload()}>
            Làm mới
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-background-dark p-1 rounded-lg border border-border-dark relative">
        {/* Animated indicator */}
        <div
          className="absolute inset-y-1 rounded-md bg-primary transition-all duration-300 ease-out"
          style={{
            width: 'calc(50% - 4px)',
            left: activeTab === 'orders' ? '4px' : 'calc(50% + 0px)',
          }}
        ></div>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 px-4 py-2.5 text-sm font-bold rounded-md transition-all relative z-10 flex items-center justify-center gap-2 ${activeTab === 'orders'
            ? 'text-black'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
        >
          <span className={`material-symbols-outlined text-base transition-transform ${activeTab === 'orders' ? 'scale-110' : ''}`}>
            shopping_cart
          </span>
          Phân tích đơn hàng
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 px-4 py-2.5 text-sm font-bold rounded-md transition-all relative z-10 flex items-center justify-center gap-2 ${activeTab === 'products'
            ? 'text-black'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
        >
          <span className={`material-symbols-outlined text-base transition-transform ${activeTab === 'products' ? 'scale-110' : ''}`}>
            inventory_2
          </span>
          Phân tích sản phẩm
        </button>
      </div>

      {/* Orders Analytics */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Order Trends Chart */}
          <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-sm group hover:border-primary/20 transition-all relative overflow-hidden">
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-white transition-colors">Xu hướng đơn hàng</h3>
                  <p className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">Doanh thu và số lượng đơn hàng theo thời gian</p>
                </div>
              </div>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={orderAnalytics?.data || []}>
                    <defs>
                      <linearGradient id="orderRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="orderCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272A" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12 }} />
                    <YAxis yAxisId="left" hide />
                    <YAxis yAxisId="right" hide />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181B', border: '1px solid #27272A', borderRadius: '12px', color: '#fff' }}
                      formatter={(value: number | undefined, name: string | undefined) => [
                        value !== undefined && name === 'revenue' ? fmt(value) : (value ?? 0),
                        name === 'revenue' ? 'Doanh thu' : 'Đơn hàng'
                      ]}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#DC2626"
                      strokeWidth={3}
                      fill="url(#orderRevenue)"
                      name="revenue"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="#10B981"
                      strokeWidth={3}
                      fill="url(#orderCount)"
                      name="orders"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Order Status Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-white mb-6">Trạng thái đơn hàng theo ngày</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orderStatusTrends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272A" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12 }} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181B', border: '1px solid #27272A', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="delivered" stackId="status" fill="#10B981" name="Đã giao" />
                    <Bar dataKey="shipped" stackId="status" fill="#3B82F6" name="Đang giao" />
                    <Bar dataKey="confirmed" stackId="status" fill="#F59E0B" name="Đã xác nhận" />
                    <Bar dataKey="pending" stackId="status" fill="#6B7280" name="Đang chờ" />
                    <Bar dataKey="cancelled" stackId="status" fill="#EF4444" name="Đã hủy" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Summary Cards */}
            <div className="space-y-4">
              <div className="bg-surface-dark border border-border-dark p-5 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <span className="material-symbols-outlined">shopping_cart</span>
                  </div>
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Tổng đơn hàng</p>
                <h3 className="text-2xl font-black text-white">
                  {loading ? '...' : orderAnalytics?.summary.totalOrders || 0}
                </h3>
              </div>

              <div className="bg-surface-dark border border-border-dark p-5 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="size-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Tổng doanh thu</p>
                <h3 className="text-2xl font-black text-white">
                  {loading ? '...' : fmt(orderAnalytics?.summary.totalRevenue || 0)}
                </h3>
              </div>

              <div className="bg-surface-dark border border-border-dark p-5 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <span className="material-symbols-outlined">price_change</span>
                  </div>
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Giá trị trung bình</p>
                <h3 className="text-2xl font-black text-white">
                  {loading ? '...' : fmt(orderAnalytics?.summary.averageOrderValue || 0)}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Analytics */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Product Performance Table */}
          <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-white mb-6">Hiệu suất sản phẩm</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-slate-500 uppercase bg-background-dark/50 border-b border-border-dark">
                  <tr>
                    <th className="px-4 py-3">Sản phẩm</th>
                    <th className="px-4 py-3 text-center">Đã bán</th>
                    <th className="px-4 py-3 text-center">Doanh thu</th>
                    <th className="px-4 py-3 text-center">Điểm hiệu suất</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark/50">
                  {productPerformance.map((product, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white font-medium">{product.productName}</p>
                          <p className="text-slate-500 text-xs">{fmt(product.productPrice)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-white font-bold">{product.totalSold}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-green-500 font-bold">{fmt(product.totalRevenue)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${product.performanceScore >= 80 ? 'bg-green-500 text-black' :
                            product.performanceScore >= 60 ? 'bg-yellow-500 text-black' :
                              'bg-red-500 text-white'
                            }`}>
                            {product.performanceScore}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Product Sales Trends */}
          <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-white mb-6">Xu hướng bán hàng sản phẩm</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productSalesTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272A" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12 }} />
                  <YAxis yAxisId="left" hide />
                  <YAxis yAxisId="right" hide />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181B', border: '1px solid #27272A', borderRadius: '12px', color: '#fff' }}
                    formatter={(value: number | undefined, name: string | undefined) => [
                      value ?? 0,
                      name === 'totalSold' ? 'Số lượng bán' : 'Doanh thu'
                    ]}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="totalSold"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    name="totalSold"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="totalRevenue"
                    stroke="#10B981"
                    strokeWidth={3}
                    name="totalRevenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
