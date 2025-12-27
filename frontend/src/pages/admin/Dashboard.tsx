
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import type { AdminOutletContext } from '@layouts/AdminLayout';
import { useAuth } from '@contexts/AuthContext';
import type { Product } from '@/types/product';
import { useTranslation } from '../../hooks/useTranslation';
import { DashboardService } from '@/services/dashboardService';
import { AnalyticsService } from '@/services/analyticsService';
import { NotificationService } from '@/services/notificationService';
import type { DashboardStats, RevenueStats, RecentOrder, TopProduct, MonthlyRevenue, Notification } from '@/types';

const AdminDashboard: React.FC = () => {
  const { getDateRangeLabel } = useOutletContext<AdminOutletContext>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  // State for dashboard data
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [notificationStats, setNotificationStats] = useState<any>(null);
  const [adminNotifications, setAdminNotifications] = useState<Notification[]>([]);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);

  // Initialize services
  const dashboardService = DashboardService.getInstance();
  const analyticsService = AnalyticsService.getInstance();
  const notificationService = NotificationService.getInstance();

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Load dashboard stats
        const stats = await dashboardService.getDashboardStats();
        setDashboardStats(stats);

        // Load revenue stats for last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const endDate = new Date();

        const revenueData = await dashboardService.getRevenueStats(
          sixMonthsAgo.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
          'month'
        );
        setRevenueStats(revenueData);

        // Load notification stats and recent notifications
        const notifStats = await notificationService.getNotificationStats();
        setNotificationStats(notifStats);

        const unreadCount = await notificationService.getUnreadCount();
        setNotificationUnreadCount(unreadCount);

        // Load recent notifications
        const { notifications } = await notificationService.getNotifications(1, 5);
        setAdminNotifications(notifications);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Helper for currency
  const fmt = (num: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

  return (
    <div className="space-y-6 pb-10">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">{t('admin.dashboard')}</h1>
          <p className="text-slate-400 text-sm mt-1">
            {t('admin.reportDetail')}: <span className="text-primary font-bold">{getDateRangeLabel()}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon="download" size="sm">{t('admin.exportReport')}</Button>
          <Button variant="primary" icon="refresh" size="sm">{t('admin.refresh')}</Button>
          {notificationUnreadCount > 0 && (
            <Button variant="primary" icon="notifications" size="sm" onClick={() => window.location.href = '/admin/notifications'}>
              {t('nav.notifications')} ({notificationUnreadCount})
            </Button>
          )}
        </div>
      </div>

      {/* Admin Notifications Display */}
      {adminNotifications.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-blue-900">{t('admin.notifications.new')}</h3>
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {notificationUnreadCount} chưa đọc
            </span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {adminNotifications.map((notification) => (
              <div key={notification.id} className={`p-2 rounded border text-sm ${notification.status === 'unread' ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-300'
                }`}>
                <div className="font-medium text-blue-800">{notification.title}</div>
                <div className="text-blue-600 text-sm">{notification.message}</div>
                <div className="text-xs text-blue-500 mt-1 flex items-center justify-between">
                  <span>{new Date(notification.createdAt).toLocaleString('vi-VN')}</span>
                  {notification.priority === 'urgent' && (
                    <span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded text-xs font-medium">
                      Khẩn cấp
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/admin/notifications'}
              className="text-blue-600 hover:text-blue-800"
            >
              Xem tất cả thông báo
            </Button>
          </div>
        </div>
      )}

      {/* 2. Key Metrics Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface-dark border border-border-dark p-5 rounded-2xl shadow-sm animate-pulse">
              <div className="flex justify-between items-start mb-3">
                <div className="size-10 rounded-xl bg-slate-700/50"></div>
                <div className="h-6 w-20 bg-slate-700/50 rounded-full"></div>
              </div>
              <div className="h-3 w-24 bg-slate-700/50 rounded mb-2"></div>
              <div className="h-8 w-32 bg-slate-700/50 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Revenue */}
          <div className="bg-surface-dark border border-border-dark p-5 rounded-2xl shadow-sm hover:border-primary/30 transition-all group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all group-hover:scale-110 group-hover:rotate-3">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <span className="flex items-center text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full group-hover:scale-105 transition-transform">
                  +12.5% <span className="material-symbols-outlined text-[14px]">trending_up</span>
                </span>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 group-hover:text-slate-300 transition-colors">{t('admin.totalRevenue')}</p>
              <h3 className="text-2xl font-black text-white">{fmt(dashboardStats?.totalRevenue || 0)}</h3>
            </div>
          </div>

          {/* Card 2: Orders */}
          <div className="bg-surface-dark border border-border-dark p-5 rounded-2xl shadow-sm hover:border-blue-500/30 transition-all group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all group-hover:scale-110 group-hover:rotate-3">
                  <span className="material-symbols-outlined">shopping_cart</span>
                </div>
                <span className="flex items-center text-blue-500 text-xs font-bold bg-blue-500/10 px-2 py-1 rounded-full group-hover:scale-105 transition-transform">
                  +5.2% <span className="material-symbols-outlined text-[14px]">trending_up</span>
                </span>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 group-hover:text-slate-300 transition-colors">{t('admin.totalOrders')}</p>
              <h3 className="text-2xl font-black text-white">{dashboardStats?.totalOrders || 0}</h3>
            </div>
          </div>

          {/* Card 3: AOV */}
          <div className="bg-surface-dark border border-border-dark p-5 rounded-2xl shadow-sm hover:border-purple-500/30 transition-all group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all group-hover:scale-110 group-hover:rotate-3">
                  <span className="material-symbols-outlined">price_change</span>
                </div>
                <span className="flex items-center text-red-500 text-xs font-bold bg-red-500/10 px-2 py-1 rounded-full group-hover:scale-105 transition-transform">
                  -2.1% <span className="material-symbols-outlined text-[14px]">trending_down</span>
                </span>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 group-hover:text-slate-300 transition-colors">{t('admin.avgOrderValue')}</p>
              <h3 className="text-2xl font-black text-white">{revenueStats ? fmt(revenueStats.averageOrderValue) : fmt(0)}</h3>
            </div>
          </div>

          {/* Card 4: Customers */}
          <div className="bg-surface-dark border border-border-dark p-5 rounded-2xl shadow-sm hover:border-orange-500/30 transition-all group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <div className="size-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all group-hover:scale-110 group-hover:rotate-3">
                  <span className="material-symbols-outlined">group_add</span>
                </div>
                <span className="flex items-center text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full group-hover:scale-105 transition-transform">
                  +8.4% <span className="material-symbols-outlined text-[14px]">trending_up</span>
                </span>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 group-hover:text-slate-300 transition-colors">{t('admin.totalCustomers')}</p>
              <h3 className="text-2xl font-black text-white">{dashboardStats?.totalCustomers || 0}</h3>
            </div>
          </div>
        </div>
      )}


      {/* 3. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Chart: Revenue & Profit */}
        <div className="lg:col-span-2 bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-sm group hover:border-primary/20 transition-all relative overflow-hidden">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-white transition-colors">{t('admin.charts.revenue.title')}</h3>
                <p className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">{t('admin.charts.revenue.subtitle')}</p>
              </div>
              <select className="bg-background-dark border border-border-dark text-white text-xs rounded-lg px-3 py-1.5 outline-none hover:border-primary/50 transition-colors cursor-pointer">
                <option>{t('admin.charts.range.30days')}</option>
                <option>{t('admin.charts.range.7days')}</option>
                <option>{t('admin.charts.range.year')}</option>
              </select>
            </div>
            <div className="h-[320px] w-full">
              {revenueStats?.data && revenueStats.data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueStats.data.map(item => ({
                    name: item.date,
                    revenue: item.revenue,
                    orders: item.orders
                  }))}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOrd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272A" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12 }} dy={10} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181B', border: '1px solid #27272A', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    formatter={(value: number | undefined) => value !== undefined ? fmt(value) : ''}
                  />
                  <Legend iconType="circle" />
                    <Area type="monotone" name="Doanh thu" dataKey="revenue" stroke="#DC2626" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    <Area type="monotone" name="Đơn hàng" dataKey="orders" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorOrd)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">analytics</span>
                    <p className="text-sm">Chưa có dữ liệu để hiển thị</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Chart: Order Status */}
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-sm flex flex-col group hover:border-blue-500/20 transition-all relative overflow-hidden">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>

          <div className="relative z-10">
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-white transition-colors">Trạng thái đơn hàng</h3>
            <p className="text-xs text-slate-500 mb-6 group-hover:text-slate-400 transition-colors">Phân bố trạng thái các đơn hàng</p>

            <div className="h-[280px] w-full flex items-center justify-center relative">
              {(() => {
                const statusData = dashboardStats?.orderStatusDistribution || {};
                const total = Object.values(statusData).reduce((sum, val) => sum + val, 0);
                const pendingCount = statusData['pending'] || 0;
                const pendingPercent = total > 0 ? Math.round((pendingCount / total) * 100) : 0;

                return (
                  <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-3xl font-black text-white group-hover:scale-110 transition-transform">{pendingPercent}%</span>
                    <span className="text-xs text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors">Đang chờ</span>
                  </div>
                );
              })()}

              {dashboardStats?.orderStatusDistribution && Object.keys(dashboardStats.orderStatusDistribution).length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(dashboardStats.orderStatusDistribution).map(([status, count]) => ({
                        name: status,
                        value: count
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {Object.entries(dashboardStats.orderStatusDistribution).map(([, count], index) => {
                        const colors = ['#ef4444', '#3b82f6', '#10b981', '#f97316', '#a855f7', '#06b6d4'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181B', border: '1px solid #27272A', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: number | undefined) => value !== undefined ? [`${value} đơn`, 'Số lượng'] : ['', '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">pie_chart</span>
                    <p className="text-sm">Chưa có dữ liệu trạng thái đơn hàng</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              {Object.entries(dashboardStats?.orderStatusDistribution || {}).map(([status, count], i) => {
                const colors = ['#ef4444', '#3b82f6', '#10b981', '#f97316', '#a855f7', '#06b6d4'];
                const total = Object.values(dashboardStats?.orderStatusDistribution || {}).reduce((sum, val) => sum + val, 0);
                const percent = total > 0 ? Math.round((count / total) * 100) : 0;

                const statusLabels: { [key: string]: string } = {
                  'pending': 'Đang chờ',
                  'confirmed': 'Đã xác nhận',
                  'processing': 'Đang xử lý',
                  'shipped': 'Đang giao',
                  'delivered': 'Đã giao',
                  'cancelled': 'Đã hủy'
                };

                return (
                  <div key={status} className="flex items-center gap-2 group/item hover:bg-white/5 p-2 rounded-lg transition-all">
                    <div className="size-3 rounded-full group-hover/item:scale-125 transition-transform" style={{ backgroundColor: colors[i % colors.length] }}></div>
                    <div className="text-xs text-slate-400 font-medium flex-1 group-hover/item:text-slate-300 transition-colors">{statusLabels[status] || status}</div>
                    <div className="text-xs text-white font-bold group-hover/item:scale-110 transition-transform">{percent}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Selling Products */}
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-sm group/container hover:border-yellow-500/20 transition-all relative overflow-hidden">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent opacity-0 group-hover/container:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 group-hover/container:text-white transition-colors">
                <span className="material-symbols-outlined text-yellow-500 group-hover/container:scale-110 transition-transform">trophy</span>
                {t('admin.topProducts.title')}
              </h3>
              <Button variant="ghost" size="sm" className="text-xs h-8 hover:bg-yellow-500/10 transition-colors">{t('admin.viewAll')}</Button>
            </div>

            <div className="space-y-4">
              {dashboardStats?.topProducts?.slice(0, 5).map((p, i) => (
                <div key={p.id} className="flex items-center gap-4 group/item hover:bg-white/5 p-3 rounded-xl transition-all cursor-pointer -mx-3">
                  <div className="size-12 rounded-xl bg-background-dark border border-border-dark overflow-hidden shrink-0 relative group-hover/item:scale-110 group-hover/item:rotate-3 transition-all">
                    <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white">inventory</span>
                    </div>
                    <div className="absolute top-0 left-0 bg-yellow-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-br-lg group-hover/item:scale-110 transition-transform">#{i + 1}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate group-hover/item:text-primary transition-colors">{p.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 group-hover/item:text-slate-400 transition-colors">{fmt(p.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white group-hover/item:scale-105 transition-transform inline-block">{p.totalSold} <span className="text-[10px] text-slate-500 font-normal">đã bán</span></p>
                    <p className="text-xs text-emerald-500 font-bold group-hover/item:text-emerald-400 transition-colors">{fmt(p.totalRevenue)}</p>
                  </div>
                </div>
              )) || []}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-sm group/container hover:border-blue-400/20 transition-all relative overflow-hidden">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent opacity-0 group-hover/container:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 group-hover/container:text-white transition-colors">
                <span className="material-symbols-outlined text-blue-400 group-hover/container:scale-110 transition-transform">schedule</span>
                {t('admin.recentOrders.title')}
              </h3>
              <Button variant="ghost" size="sm" className="text-xs h-8 hover:bg-blue-400/10 transition-colors">{t('admin.viewAll')}</Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-slate-500 uppercase bg-background-dark/50 border-b border-border-dark">
                  <tr>
                    <th className="px-3 py-3 rounded-tl-lg">{t('admin.orders.orderId')}</th>
                    <th className="px-3 py-3">{t('admin.orders.customer')}</th>
                    <th className="px-3 py-3">{t('admin.orders.total')}</th>
                    <th className="px-3 py-3 rounded-tr-lg text-right">{t('admin.orders.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark/50">
                  {dashboardStats?.recentOrders?.map((order, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-all group/row cursor-pointer">
                      <td className="px-3 py-3 font-mono text-primary font-bold text-xs group-hover/row:scale-105 inline-block transition-transform">{order.orderNumber}</td>
                      <td className="px-3 py-3">
                        <p className="text-white font-medium text-xs group-hover/row:text-primary transition-colors">{order.customerName}</p>
                        <p className="text-[10px] text-slate-500 group-hover/row:text-slate-400 transition-colors">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                      </td>
                      <td className="px-3 py-3 font-bold text-white text-xs group-hover/row:text-emerald-400 transition-colors">{fmt(order.totalAmount)}</td>
                      <td className="px-3 py-3 text-right">
                        <div className="inline-block group-hover/row:scale-110 transition-transform">
                          <Badge
                            variant={
                              order.status === 'delivered' ? 'success' :
                                order.status === 'cancelled' ? 'danger' :
                                  order.status === 'shipped' ? 'info' : 'warning'
                            }
                          >
                            {order.status === 'delivered' ? 'Đã giao' :
                              order.status === 'cancelled' ? 'Đã hủy' :
                                order.status === 'shipped' ? 'Đang giao' :
                                  order.status === 'confirmed' ? 'Đã xác nhận' :
                                    order.status === 'processing' ? 'Đang xử lý' : order.status}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  )) || []}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
