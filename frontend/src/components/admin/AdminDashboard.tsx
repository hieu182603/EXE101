import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Package, 
  Truck, 
  DollarSign
} from 'lucide-react';
import { productService } from '../../services/productService';
import { customerService } from '../../services/customerService';
import { shipperService } from '../../services/shipperService';
import { orderService } from '../../services/orderService';
// Nếu chưa cài recharts, sẽ báo lỗi import. Hãy chạy: yarn add recharts
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

const AdminDashboard: React.FC = () => {
  const [productCount, setProductCount] = useState<number>(0);
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [shipperCount, setShipperCount] = useState<number>(0);
  const [revenue, setRevenue] = useState<number>(0);
  const [revenueByMonth, setRevenueByMonth] = useState<{ month: string, revenue: number }[]>([]);
  const [orderStatusStats, setOrderStatusStats] = useState<{ status: string, count: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ id: string, name: string, count: number }[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<{ id: string, name: string, stock: number }[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      // Lấy số lượng sản phẩm
      const productsData: { id: string, name: string, stock: number }[] = await productService.getAllProducts();
      setProductCount(productsData.length);

      // Lấy số lượng khách hàng
      try {
        const customerRes: any = await customerService.getAllCustomers();
        let customers: any[] = [];
        if (customerRes && customerRes.success && customerRes.data) {
          // Có thể là data hoặc data.data
          customers = Array.isArray(customerRes.data) ? customerRes.data : (customerRes.data.data || []);
        }
        setCustomerCount(customers.length);
      } catch {
        setCustomerCount(0);
      }

      // Lấy số lượng shipper
      try {
        const shipperRes: any = await shipperService.getAllShippers();
        let shippers: any[] = [];
        if (shipperRes && shipperRes.success && shipperRes.data) {
          shippers = Array.isArray(shipperRes.data) ? shipperRes.data : (shipperRes.data.data || []);
        }
        setShipperCount(shippers.length);
      } catch {
        setShipperCount(0);
      }

      // Lấy orders (để phân tích)
      let ordersData: any[] = [];
      try {
        const orderRes: any = await orderService.getAllOrdersForAdmin();
        if (orderRes && orderRes.data) {
          ordersData = Array.isArray(orderRes.data) ? orderRes.data : (orderRes.data.data || []);
        }
      } catch {
        ordersData = [];
      }

      // Doanh thu tổng
        const completedStatuses = ['DELIVERED'];
      const totalRevenue = ordersData
          .filter((order: any) => completedStatuses.includes(order.status))
          .reduce((sum: number, order: any) => sum + (parseFloat(order.totalAmount) || 0), 0);
        setRevenue(totalRevenue);

      // 1. Doanh thu theo tháng
      const revenueByMonthMap: Record<string, number> = {};
      ordersData.forEach((order: any) => {
        if (completedStatuses.includes(order.status)) {
          const date = new Date(order.createdAt);
          const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          revenueByMonthMap[key] = (revenueByMonthMap[key] || 0) + (parseFloat(order.totalAmount) || 0);
        }
      });
      const revenueByMonthArr = Object.entries(revenueByMonthMap).map(([month, revenue]) => ({ month, revenue }));
      revenueByMonthArr.sort((a, b) => a.month.localeCompare(b.month));
      // Lấy 3 tháng gần nhất
      const last3Months = revenueByMonthArr.slice(-3);
      setRevenueByMonth(last3Months);

      // 2. Số lượng đơn hàng theo trạng thái
      const statusMap: Record<string, number> = {};
      ordersData.forEach((order: any) => {
        statusMap[order.status] = (statusMap[order.status] || 0) + 1;
      });
      setOrderStatusStats(Object.entries(statusMap).map(([status, count]) => ({ status, count: Number(count) })));

      // 3. Top 5 sản phẩm bán chạy nhất (theo số lượng trong orderDetails)
      const productSalesMap: Record<string, { name: string, count: number }> = {};
      ordersData.forEach((order: any) => {
        if (order.orderDetails && Array.isArray(order.orderDetails)) {
          order.orderDetails.forEach((detail: any) => {
            const pid = detail.product?.id || detail.productId;
            const pname = detail.product?.name || 'Unknown';
            if (!productSalesMap[pid]) productSalesMap[pid] = { name: pname, count: 0 };
            productSalesMap[pid].count += detail.quantity || 0;
          });
        }
      });
      const topProductsArr = Object.entries(productSalesMap)
        .map(([id, { name, count }]) => ({ id, name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setTopProducts(topProductsArr);

      // 4. Sản phẩm tồn kho thấp (stock < 10)
      let lowStock = productsData
        .filter((p: any) => p.stock !== undefined && p.stock < 10 && p.name && p.category && p.category.name)
        .map((p: any) => ({ id: p.id, name: p.name, stock: p.stock, category: p.category.name }))
        .sort((a: any, b: any) => {
          if (a.category < b.category) return -1;
          if (a.category > b.category) return 1;
          return a.stock - b.stock;
        });
      setLowStockProducts(lowStock);
    };
    fetchStats();
  }, []);

  const stats = [
    {
      title: 'Total Customers',
      value: customerCount.toString(),
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Products',
      value: productCount.toString(),
      icon: Package,
      color: 'bg-green-500'
    },
    {
      title: 'Shippers',
      value: shipperCount.toString(),
      icon: Truck,
      color: 'bg-yellow-500'
    },
    {
      title: 'Revenue',
      value: revenue.toLocaleString('vi-VN') + ' VND',
      icon: DollarSign,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 rounded-lg p-6 mb-6 shadow-xl">
        <div className="text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-red-200">Technical Store management system overview</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-2xl shadow-lg p-12 hover:shadow-2xl transition-shadow min-h-[220px] flex flex-row items-center justify-between">
              <div className="flex flex-col items-start justify-center flex-1">
                <p className="text-xl font-semibold text-gray-600 mb-4">{stat.title}</p>
                <p className="text-5xl font-extrabold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-36 h-36 rounded-full flex items-center justify-center ml-8`}>
                <Icon size={72} className="text-white" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Revenue by Month */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">Revenue by Month</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueByMonth} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" padding={{ left: 30, right: 30 }} />
              <YAxis tickFormatter={(v: number) => v.toLocaleString('en-US')} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString('en-US')} VND`} />
              <Bar dataKey="revenue" fill="#ef4444" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Orders by Status */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={orderStatusStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">Top 5 Best-Selling Products</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Low Stock Products */}
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col" style={{height: '350px'}}>
          <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">Low Stock Products</h2>
          <div className="flex-1 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-2 text-left text-base font-semibold text-gray-500 uppercase">Product Name</th>
                  <th className="px-6 py-2 text-left text-base font-semibold text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-2 text-right text-base font-semibold text-gray-500 uppercase">Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((p: any) => (
                  <tr key={p.id}>
                    <td className="px-6 py-3 whitespace-nowrap text-lg text-gray-900 text-left">{p.name}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-lg text-gray-700 text-left">{p.category}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-lg text-red-600 font-bold text-right">{p.stock}</td>
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