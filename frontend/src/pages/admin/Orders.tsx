
import React, { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { OrderStatus } from '@types/order';
import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import Pagination from '@components/ui/Pagination';
import { AdminOutletContext } from '@layouts/AdminLayout';
import { orderService } from '@services/orderService';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface OrderDetail {
  id: string;
  customer: string;
  email: string;
  phone: string;
  date: string;
  total: number;
  status: string;
  color: string;
  variant: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  items: OrderItem[];
}

const ITEMS_PER_PAGE = 5;

const OrderManagement: React.FC = () => {
  const { isInRange } = useOutletContext<AdminOutletContext>();
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Expandable row processing menu
  const [activeProcessId, setActiveProcessId] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const fiveDaysAgo = new Date(today); fiveDaysAgo.setDate(today.getDate() - 5);
  const lastMonth = new Date(today); lastMonth.setMonth(today.getMonth() - 1);

  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);

  // Load orders
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const response = await orderService.getAllOrdersForAdmin({ 
          status: filterStatus !== 'All' ? filterStatus : undefined,
          search: searchTerm || undefined,
          page: currentPage,
          limit: ITEMS_PER_PAGE
        });
        
        const ordersData = response.data?.data || response.data?.orders || [];
        const transformedOrders: OrderDetail[] = ordersData.map((order: any) => {
          // Map status to variant
          const getVariant = (status: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
            switch (status) {
              case OrderStatus.DELIVERED:
                return 'success';
              case OrderStatus.CANCELLED:
                return 'danger';
              case OrderStatus.SHIPPING:
              case OrderStatus.CONFIRMED:
                return 'warning';
              default:
                return 'info';
            }
          };

          return {
            id: order.id,
            customer: order.customer?.username || order.customer?.name || 'Guest',
            email: order.customer?.email || '',
            phone: order.customer?.phone || '',
            date: new Date(order.orderDate).toLocaleDateString('vi-VN'),
            total: order.totalAmount || 0,
            status: order.status,
            color: '',
            variant: getVariant(order.status),
            items: (order.orderDetails || []).map((detail: any) => ({
              id: detail.product?.id || detail.id,
              name: detail.product?.name || 'Product',
              price: detail.price || 0,
              qty: detail.quantity || 0
            }))
          };
        });
        
        setOrders(transformedOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [filterStatus, searchTerm, currentPage]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesDate = isInRange(order.date);
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        order.customer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
      
      return matchesDate && matchesSearch && matchesStatus;
    });
  }, [orders, isInRange, searchTerm, filterStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredOrders.length]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredOrders]);

  // Actions
  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    alert("Đang xuất dữ liệu đơn hàng ra file Excel...");
  };

  const handleProcessOrder = (id: string, currentStatus: string) => {
    // Simple state machine for demo
    const statusFlow = {
        'Chờ xác nhận': { next: 'Đã xác nhận', variant: 'info' },
        'Đã xác nhận': { next: 'Đang giao hàng', variant: 'primary' },
        'Đang giao hàng': { next: 'Đã giao hàng', variant: 'success' },
        'Đã giao hàng': { next: 'Đã giao hàng', variant: 'success' },
        'Đã hủy': { next: 'Đã hủy', variant: 'danger' }
    };

    const nextState = statusFlow[currentStatus as keyof typeof statusFlow];
    if (nextState) {
        setOrders(prev => prev.map(o => 
            o.id === id ? { ...o, status: nextState.next, variant: nextState.variant as any } : o
        ));
        // Also update selected order if open
        if (selectedOrder && selectedOrder.id === id) {
            setSelectedOrder(prev => prev ? ({ ...prev, status: nextState.next, variant: nextState.variant as any }) : null);
        }
    }
    setActiveProcessId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Quản Lý Đơn Hàng</h1>
          <p className="text-gray-400 mt-1">Theo dõi và cập nhật trạng thái đơn hàng</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon="print" onClick={() => alert("Chức năng in danh sách đang được phát triển")}>In hóa đơn</Button>
          <Button variant="primary" icon="download" onClick={handleExport}>Xuất dữ liệu</Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 rounded-2xl border border-border-dark bg-surface-dark p-5 shadow-sm items-center">
        <div className="relative flex-1 w-full md:w-auto">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input 
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border-dark bg-background-dark text-sm text-white placeholder-gray-500 focus:border-primary outline-none transition-all" 
            placeholder="Tìm kiếm theo mã đơn, tên khách hàng..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <select 
            className="h-11 appearance-none rounded-xl border border-border-dark bg-background-dark px-4 pl-4 text-sm text-white focus:border-primary outline-none min-w-[180px] cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="Chờ xác nhận">Chờ xác nhận</option>
            <option value="Đã xác nhận">Đã xác nhận</option>
            <option value="Đang giao hàng">Đang giao hàng</option>
            <option value="Đã giao hàng">Đã giao hàng</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-border-dark bg-surface-dark shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[#1a1a1a] text-xs uppercase tracking-wider text-slate-400 border-b border-border-dark">
              <tr>
                <th className="px-6 py-5 font-bold">Mã đơn hàng</th>
                <th className="px-6 py-5 font-bold">Khách hàng</th>
                <th className="px-6 py-5 font-bold">Ngày đặt</th>
                <th className="px-6 py-5 font-bold">Tổng tiền</th>
                <th className="px-6 py-5 font-bold text-center">Trạng thái</th>
                <th className="px-6 py-5 font-bold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark/50">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((o, i) => (
                  <tr key={i} className="group hover:bg-white/[0.02] transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-slate-700 group-hover:bg-primary transition-colors"></div>
                        <span className="font-mono text-white font-bold group-hover:text-primary transition-colors">{o.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-background-dark to-surface-dark flex items-center justify-center text-xs font-black text-slate-300 border border-border-dark shadow-inner">
                          {o.customer.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm">{o.customer}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{o.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                        <span className="text-sm font-medium">{o.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-white text-sm tracking-tight">{o.total.toLocaleString()}đ</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={o.variant}>{o.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setSelectedOrder(o)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-dark border border-border-dark text-slate-300 hover:text-white hover:border-primary transition-all text-xs font-bold" 
                          title="Xem chi tiết"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          Chi tiết
                        </button>
                        <div className="relative">
                            <button 
                                onClick={() => setActiveProcessId(activeProcessId === o.id ? null : o.id)}
                                className="flex items-center gap-1 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1.5 text-xs font-bold hover:bg-blue-500 hover:text-white transition-all"
                            >
                                Xử lý
                                <span className="material-symbols-outlined text-[16px]">expand_more</span>
                            </button>
                            {activeProcessId === o.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-surface-dark border border-border-dark rounded-xl shadow-2xl z-50 overflow-hidden">
                                    <button 
                                        onClick={() => handleProcessOrder(o.id, o.status)}
                                        className="w-full text-left px-4 py-3 hover:bg-white/10 text-xs text-white font-bold flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">fast_forward</span>
                                        Chuyển trạng thái tiếp theo
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setOrders(prev => prev.map(item => item.id === o.id ? {...item, status: 'Đã hủy', variant: 'danger'} : item));
                                            setActiveProcessId(null);
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-red-500/20 text-xs text-red-500 font-bold flex items-center gap-2 border-t border-border-dark"
                                    >
                                        <span className="material-symbols-outlined text-sm">cancel</span>
                                        Hủy đơn hàng
                                    </button>
                                </div>
                            )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="size-12 rounded-full bg-background-dark flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-600">search_off</span>
                      </div>
                      <p>Không có đơn hàng nào trong khoảng thời gian này.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
        />
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Đơn hàng ${selectedOrder.id}` : ''}
        size="4xl"
        footer={
          <div className="flex justify-end gap-3 w-full">
             <Button variant="outline" onClick={() => setSelectedOrder(null)}>Đóng</Button>
             <Button variant="secondary" icon="print" onClick={handlePrint}>In phiếu giao hàng</Button>
             <Button variant="primary" icon="check" onClick={() => selectedOrder && handleProcessOrder(selectedOrder.id, selectedOrder.status)}>Cập nhật trạng thái</Button>
          </div>
        }
      >
        {selectedOrder && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Top Status Bar */}
            <div className="col-span-12 bg-surface-dark border border-border-dark rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
               <div className="flex items-center gap-4">
                  <div className={`size-14 rounded-full border-4 flex items-center justify-center ${
                      selectedOrder.status === 'Đã hủy' ? 'border-red-500/20 bg-red-500/10 text-red-500' : 'border-primary/20 bg-primary/10 text-primary'
                  }`}>
                      <span className="material-symbols-outlined text-3xl">
                          {selectedOrder.status === 'Đã giao hàng' ? 'check_circle' : selectedOrder.status === 'Đã hủy' ? 'cancel' : 'local_shipping'}
                      </span>
                  </div>
                  <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Trạng thái hiện tại</p>
                      <h2 className="text-2xl font-black text-white">{selectedOrder.status}</h2>
                  </div>
               </div>
               <div className="w-full md:w-auto text-right">
                   <p className="text-xs text-slate-400">Ngày đặt hàng</p>
                   <p className="text-lg font-bold text-white">{selectedOrder.date} 09:30</p>
               </div>
            </div>

            {/* Left Column: Details */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-background-dark/50 p-6 rounded-2xl border border-border-dark h-full">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">person</span>
                        Thông tin khách hàng
                    </h4>
                    
                    <div className="text-center mb-6">
                        <div className="size-20 rounded-full bg-surface-dark border-2 border-border-dark flex items-center justify-center text-primary font-black text-3xl mx-auto mb-3 shadow-lg">
                            {selectedOrder.customer.charAt(0)}
                        </div>
                        <p className="text-lg font-bold text-white">{selectedOrder.customer}</p>
                        <Badge variant="primary" dot>Thành viên Vip</Badge>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border-dark/50">
                        <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-surface-dark transition-colors">
                            <div className="size-10 rounded-full bg-surface-dark flex items-center justify-center text-slate-400 border border-border-dark">
                                <span className="material-symbols-outlined text-lg">email</span>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Email</p>
                                <p className="text-sm font-medium text-white truncate" title={selectedOrder.email}>{selectedOrder.email}</p>
                            </div>
                        </div>
                        <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-surface-dark transition-colors">
                            <div className="size-10 rounded-full bg-surface-dark flex items-center justify-center text-slate-400 border border-border-dark">
                                <span className="material-symbols-outlined text-lg">call</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Điện thoại</p>
                                <p className="text-sm font-medium text-white">{selectedOrder.phone}</p>
                            </div>
                        </div>
                        <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-surface-dark transition-colors">
                            <div className="size-10 rounded-full bg-surface-dark flex items-center justify-center text-slate-400 border border-border-dark">
                                <span className="material-symbols-outlined text-lg">location_on</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Địa chỉ giao hàng</p>
                                <p className="text-sm font-medium text-white leading-relaxed">123 Đường ABC, Quận 1, TP.HCM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Order Items */}
            <div className="lg:col-span-8 space-y-6">
                <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-border-dark bg-white/[0.02] flex justify-between items-center">
                        <h4 className="font-bold text-white text-sm uppercase tracking-wider">Sản phẩm ({selectedOrder.items.length})</h4>
                        <span className="text-xs text-slate-500 font-mono">#{selectedOrder.id.replace('#', '')}</span>
                    </div>
                    <div className="divide-y divide-border-dark/50">
                        {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-5 p-5 hover:bg-white/[0.02] transition-colors group">
                            <div className="size-20 rounded-xl bg-background-dark flex items-center justify-center border border-border-dark shrink-0 relative overflow-hidden">
                                <span className="material-symbols-outlined text-slate-600 text-3xl group-hover:scale-110 transition-transform">inventory_2</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-white text-base mb-1">{item.name}</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">Mã SP: {item.id}</span>
                                    <span className="text-xs text-slate-500">Bảo hành: 12 tháng</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 mb-1">{item.price.toLocaleString()}đ <span className="text-slate-600">x</span> {item.qty}</p>
                                <p className="font-black text-lg text-white">{(item.price * item.qty).toLocaleString()}đ</p>
                            </div>
                        </div>
                        ))}
                    </div>
                    
                    {/* Summary Footer inside the card */}
                    <div className="bg-background-dark/30 p-6 border-t border-border-dark">
                        <div className="flex flex-col gap-3 ml-auto w-full md:w-1/2">
                            <div className="flex justify-between text-sm text-slate-400">
                                <span>Tạm tính</span>
                                <span className="text-white font-medium">{selectedOrder.total.toLocaleString()}đ</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-400">
                                <span>Phí vận chuyển</span>
                                <span className="text-emerald-500 font-bold">Miễn phí</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-400">
                                <span>Thuế VAT (8%)</span>
                                <span className="text-white font-medium">Đã bao gồm</span>
                            </div>
                            <div className="h-px bg-border-dark my-2"></div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-white uppercase text-xs tracking-widest">Tổng thanh toán</span>
                                <span className="text-3xl font-black text-primary">{selectedOrder.total.toLocaleString()}đ</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagement;
