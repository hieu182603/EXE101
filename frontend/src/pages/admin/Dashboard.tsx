
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import { AdminOutletContext } from '@layouts/AdminLayout';
import { productService } from '@services/productService';
import { orderService } from '@services/orderService';
import type { Product } from '@types/product';

const AdminDashboard: React.FC = () => {
  const { getDateRangeLabel } = useOutletContext<AdminOutletContext>();
  const [loading, setLoading] = useState(true);

  const [revenueData, setRevenueData] = useState<Array<{ name: string; revenue: number; profit: number; orders: number }>>([]);
  const [categoryData, setCategoryData] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [topProducts, setTopProducts] = useState<Array<{ id: number; name: string; price: number; sold: number; revenue: number; image: string }>>([]);
  const [recentOrders, setRecentOrders] = useState<Array<{ id: string; user: string; total: number; status: string; date: string }>>([]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load top products
        const topProductsData = await productService.getTopSellingProducts(4);
        const transformedTopProducts = topProductsData.map((p: Product, index: number) => ({
          id: parseInt(p.id) || index,
          name: p.name,
          price: p.price,
          sold: 0, // Backend may not have sold count
          revenue: p.price * 10, // Mock revenue
          image: p.images?.[0]?.url || p.url || 'https://picsum.photos/200/200'
        }));
        setTopProducts(transformedTopProducts);
        
        // Load recent orders
        const ordersResponse = await orderService.getAllOrdersForAdmin({ limit: 5 });
        const ordersData = ordersResponse.data?.data || ordersResponse.data?.orders || [];
        const transformedOrders = ordersData.map((order: any) => ({
          id: order.id,
          user: order.customer?.username || order.customer?.name || 'Guest',
          total: order.totalAmount || 0,
          status: order.status,
          date: new Date(order.orderDate).toLocaleDateString('vi-VN')
        }));
        setRecentOrders(transformedOrders);
        
        // Calculate revenue from orders (mock for now)
        const totalRevenue = ordersData.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
        const totalOrders = ordersData.length;
        
        // Mock revenue data (backend may not have this structured)
        setRevenueData([
          { name: 'T2', revenue: totalRevenue * 0.15, profit: totalRevenue * 0.1, orders: Math.floor(totalOrders * 0.15) },
          { name: 'T3', revenue: totalRevenue * 0.2, profit: totalRevenue * 0.15, orders: Math.floor(totalOrders * 0.2) },
          { name: 'T4', revenue: totalRevenue * 0.18, profit: totalRevenue * 0.12, orders: Math.floor(totalOrders * 0.18) },
          { name: 'T5', revenue: totalRevenue * 0.22, profit: totalRevenue * 0.16, orders: Math.floor(totalOrders * 0.22) },
          { name: 'T6', revenue: totalRevenue * 0.25, profit: totalRevenue * 0.18, orders: Math.floor(totalOrders * 0.25) }
        ]);
        
        // Mock category data (backend may not have this)
        setCategoryData([
          { name: 'Laptop', value: 35, color: '#ef4444' },
          { name: 'PC', value: 25, color: '#3b82f6' },
          { name: 'Accessories', value: 40, color: '#10b981' }
        ]);
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
          <h1 className="text-3xl font-black text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-400 text-sm mt-1">
            Báo cáo chi tiết hiệu quả kinh doanh: <span className="text-primary font-bold">{getDateRangeLabel()}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon="download" size="sm">Xuất báo cáo</Button>
          <Button variant="primary" icon="refresh" size="sm">Cập nhật</Button>
        </div>
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue */}
        <div className="bg-surface-dark border border-border-dark p-5 rounded-2xl shadow-sm hover:border-primary/30 transition-all group">
          <div className="flex justify-between items-start mb-3">
             <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <span className="material-symbols-outlined">payments</span>
             </div>
             <span className="flex items-center text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">
               +12.5% <span className="material-symbols-outlined text-[14px]">trending_up</span>
             </span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Tổng Doanh Thu</p>
          <h3 className="text-2xl font-black text-white">
            {loading ? '...' : fmt(revenueData.reduce((sum, d) => sum + d.revenue, 0))}
          </h3>
        </div>

        {/* Card 2: Orders */}
        <div className="bg-surface-dark border border-border-dark p-5 rounded-2xl shadow-sm hover:border-blue-500/30 transition-all group">
          <div className="flex justify-between items-start mb-3">
             <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <span className="material-symbols-outlined">shopping_cart</span>
             </div>
             <span className="flex items-center text-blue-500 text-xs font-bold bg-blue-500/10 px-2 py-1 rounded-full">
               +5.2% <span className="material-symbols-outlined text-[14px]">trending_up</span>
             </span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Tổng Đơn Hàng</p>
          <h3 className="text-2xl font-black text-white">{loading ? '...' : recentOrders.length}</h3>
        </div>

        {/* Card 3: AOV */}
        <div className="bg-surface-dark border border-border-dark p-5 rounded-2xl shadow-sm hover:border-purple-500/30 transition-all group">
          <div className="flex justify-between items-start mb-3">
             <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all">
                <span className="material-symbols-outlined">price_change</span>
             </div>
             <span className="flex items-center text-red-500 text-xs font-bold bg-red-500/10 px-2 py-1 rounded-full">
               -2.1% <span className="material-symbols-outlined text-[14px]">trending_down</span>
             </span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Giá Trị Đơn TB</p>
          <h3 className="text-2xl font-black text-white">
            {loading ? '...' : recentOrders.length > 0 
              ? fmt(recentOrders.reduce((sum, o) => sum + o.total, 0) / recentOrders.length)
              : fmt(0)}
          </h3>
        </div>

        {/* Card 4: Customers */}
        <div className="bg-surface-dark border border-border-dark p-5 rounded-2xl shadow-sm hover:border-orange-500/30 transition-all group">
          <div className="flex justify-between items-start mb-3">
             <div className="size-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                <span className="material-symbols-outlined">group_add</span>
             </div>
             <span className="flex items-center text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">
               +8.4% <span className="material-symbols-outlined text-[14px]">trending_up</span>
             </span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Khách Hàng Mới</p>
          <h3 className="text-2xl font-black text-white">0</h3>
          <p className="text-slate-500 text-xs mt-2">TODO: Load from API</p>
        </div>
      </div>

      {/* 3. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart: Revenue & Profit */}
        <div className="lg:col-span-2 bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Biểu đồ doanh thu</h3>
              <p className="text-xs text-slate-500">So sánh Doanh thu và Lợi nhuận gộp</p>
            </div>
            <select className="bg-background-dark border border-border-dark text-white text-xs rounded-lg px-3 py-1.5 outline-none">
              <option>30 ngày qua</option>
              <option>7 ngày qua</option>
              <option>Năm nay</option>
            </select>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272A" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12 }} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181B', border: '1px solid #27272A', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  formatter={(value: number) => fmt(value)}
                />
                <Legend iconType="circle" />
                <Area type="monotone" name="Doanh thu" dataKey="revenue" stroke="#DC2626" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" name="Lợi nhuận" dataKey="profit" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorPro)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart: Categories */}
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-white mb-1">Tỷ trọng danh mục</h3>
          <p className="text-xs text-slate-500 mb-6">Phân bổ doanh thu theo ngành hàng</p>
          
          <div className="flex-1 flex items-center justify-center relative">
             <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-3xl font-black text-white">45%</span>
                <span className="text-xs text-slate-500 uppercase tracking-widest">Laptop</span>
             </div>
             <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ backgroundColor: '#18181B', border: '1px solid #27272A', borderRadius: '8px' }}
                     itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
             </ResponsiveContainer>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4">
             {categoryData.map((cat, i) => (
               <div key={i} className="flex items-center gap-2">
                 <div className="size-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                 <div className="text-xs text-slate-400 font-medium flex-1">{cat.name}</div>
                 <div className="text-xs text-white font-bold">{cat.value}%</div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* 4. Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Selling Products */}
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-500">trophy</span>
                Top Sản Phẩm Bán Chạy
              </h3>
              <Button variant="ghost" size="sm" className="text-xs h-8">Xem tất cả</Button>
           </div>
           
           <div className="space-y-4">
              {topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-4 group">
                   <div className="size-12 rounded-xl bg-background-dark border border-border-dark overflow-hidden shrink-0 relative">
                      <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                      <div className="absolute top-0 left-0 bg-yellow-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-br-lg">#{i+1}</div>
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{p.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{fmt(p.price)}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-bold text-white">{p.sold} <span className="text-[10px] text-slate-500 font-normal">đã bán</span></p>
                      <p className="text-xs text-emerald-500 font-bold">{fmt(p.revenue)}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400">schedule</span>
                Đơn Hàng Gần Đây
              </h3>
              <Button variant="ghost" size="sm" className="text-xs h-8">Xem tất cả</Button>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
               <thead className="text-xs text-slate-500 uppercase bg-background-dark/50 border-b border-border-dark">
                 <tr>
                   <th className="px-3 py-3 rounded-tl-lg">Mã đơn</th>
                   <th className="px-3 py-3">Khách hàng</th>
                   <th className="px-3 py-3">Tổng tiền</th>
                   <th className="px-3 py-3 rounded-tr-lg text-right">Trạng thái</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border-dark/50">
                 {recentOrders.map((order, i) => (
                   <tr key={i} className="hover:bg-white/5 transition-colors">
                     <td className="px-3 py-3 font-mono text-primary font-bold text-xs">{order.id}</td>
                     <td className="px-3 py-3">
                       <p className="text-white font-medium text-xs">{order.user}</p>
                       <p className="text-[10px] text-slate-500">{order.date}</p>
                     </td>
                     <td className="px-3 py-3 font-bold text-white text-xs">{fmt(order.total)}</td>
                     <td className="px-3 py-3 text-right">
                       <Badge 
                        variant={
                          order.status === 'Hoàn thành' ? 'success' : 
                          order.status === 'Đã hủy' ? 'danger' : 
                          order.status === 'Đang giao' ? 'info' : 'warning'
                        }
                       >
                         {order.status}
                       </Badge>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
