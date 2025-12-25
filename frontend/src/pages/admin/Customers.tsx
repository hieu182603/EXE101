
import React, { useState, useMemo, useEffect } from 'react';
import Button from '@components/ui/Button';
import Pagination from '@components/ui/Pagination';
import Modal from '@components/ui/Modal';
import { Input } from '@components/ui/Input';
import Badge from '@components/ui/Badge';
import { customerService } from '@services/customerService';
import { useToast } from '@contexts/ToastContext';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: string;
  orders: number;
  status: 'Active' | 'Inactive' | 'Banned';
}

const ITEMS_PER_PAGE = 5;

const CustomerManagement: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Load customers
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        const response = await customerService.getAllCustomers();
        const customersData = response.data || [];
        
        // Transform backend customers to display format
        const transformedCustomers: Customer[] = customersData.map((c: any) => ({
          id: c.id,
          name: c.fullName || c.name || c.username || 'Unknown',
          email: c.email || '',
          phone: c.phone || '',
          totalSpent: '0₫', // Backend may not have this field
          orders: c.customerOrders?.length || 0,
          status: c.isRegistered ? 'Active' as const : 'Inactive' as const
        }));
        
        setCustomers(transformedCustomers);
      } catch (error) {
        console.error('Error loading customers:', error);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm);
      
      const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
  
      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, filterStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredCustomers.length]);

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCustomers.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredCustomers]);

  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Total Spent", "Orders", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredCustomers.map(c => [
        c.id,
        `"${c.name}"`,
        c.email,
        c.phone,
        `"${c.totalSpent}"`,
        c.orders,
        c.status
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'customers_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateCustomer = async () => {
    if(!editingCustomer) return;
    
    try {
      await customerService.updateCustomer(editingCustomer.id, {
        fullName: editingCustomer.name,
        phone: editingCustomer.phone
      });
      
      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? editingCustomer : c));
      setEditingCustomer(null);
      showSuccess("Cập nhật khách hàng thành công!");
    } catch (error) {
      console.error('Error updating customer:', error);
      showError("Cập nhật khách hàng thất bại. Vui lòng thử lại.");
    }
  };

  const handleSendEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleBlockUser = (id: string) => {
    if(confirm("Bạn có chắc chắn muốn chặn người dùng này?")) {
        setCustomers(prev => prev.map(c => c.id === id ? {...c, status: 'Banned'} : c));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Quản Lý Khách Hàng</h1>
          <p className="text-gray-400 mt-1">Quản lý thông tin và hoạt động của khách hàng</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 rounded-2xl border border-border-dark bg-surface-dark p-5 shadow-sm items-center">
        <div className="relative flex-1 w-full md:w-auto">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input 
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border-dark bg-background-dark text-sm text-white placeholder-gray-500 focus:border-primary outline-none transition-all" 
            placeholder="Tìm tên, email hoặc số điện thoại..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <select 
            className="h-11 appearance-none rounded-xl border border-border-dark bg-background-dark px-4 pl-4 text-sm text-white focus:border-primary outline-none min-w-[160px] cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Banned">Banned</option>
          </select>
          <Button 
            variant="outline" 
            icon="download" 
            onClick={handleExportCSV}
            className="h-11"
          >
            Export
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border-dark bg-surface-dark shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#192f33] text-xs uppercase text-gray-300 border-b border-border-dark">
              <tr>
                <th className="px-6 py-4 font-semibold">Khách hàng</th>
                <th className="px-6 py-4 font-semibold">Liên hệ</th>
                <th className="px-6 py-4 font-semibold">Đơn hàng</th>
                <th className="px-6 py-4 font-semibold">Tổng chi tiêu</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((c) => (
                  <tr key={c.id} className="group hover:bg-surface-accent transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-background-dark flex items-center justify-center text-primary border border-border-dark font-bold">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-primary transition-colors">{c.name}</div>
                          <div className="text-xs text-gray-500">ID: CUST-00{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{c.email}</div>
                      <div className="text-xs text-gray-500">{c.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-white font-mono">{c.orders}</td>
                    <td className="px-6 py-4 font-bold text-primary">{c.totalSpent}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 
                        c.status === 'Banned' ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-400'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          className="size-8 rounded-lg bg-background-dark border border-border-dark flex items-center justify-center text-slate-400 hover:text-white hover:border-primary transition-all"
                          title="Gửi email"
                          onClick={() => handleSendEmail(c.email)}
                        >
                          <span className="material-symbols-outlined text-[16px]">mail</span>
                        </button>
                        <button 
                          className="size-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                          title="Chỉnh sửa"
                          onClick={() => setEditingCustomer(c)}
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button 
                          className="size-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          title="Chặn/Xóa"
                          onClick={() => handleBlockUser(c.id)}
                        >
                          <span className="material-symbols-outlined text-[16px]">block</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                    Không tìm thấy khách hàng nào.
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

      {/* Edit Customer Modal */}
      <Modal 
        isOpen={!!editingCustomer}
        onClose={() => setEditingCustomer(null)}
        title="Hồ sơ khách hàng"
        size="3xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditingCustomer(null)}>Hủy bỏ</Button>
            <Button variant="primary" onClick={handleUpdateCustomer}>Lưu thay đổi</Button>
          </>
        }
      >
        {editingCustomer && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Left: Profile Card */}
             <div className="lg:col-span-1">
                <div className="bg-surface-accent/20 border border-border-dark rounded-2xl p-6 text-center h-full flex flex-col items-center">
                    <div className="size-24 rounded-full bg-surface-dark border-4 border-background-dark flex items-center justify-center text-primary font-black text-4xl mb-4 shadow-xl">
                        {editingCustomer.name.charAt(0)}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{editingCustomer.name}</h3>
                    <p className="text-slate-400 text-xs mb-4">ID: {editingCustomer.id}</p>
                    <div className="flex gap-2 justify-center mb-6">
                        <Badge variant="primary">Hạng Vàng</Badge>
                        <Badge variant={editingCustomer.status === 'Active' ? 'success' : 'danger'}>{editingCustomer.status}</Badge>
                    </div>
                    
                    <div className="w-full space-y-3 mt-auto">
                        <div className="flex justify-between items-center text-sm p-3 bg-background-dark rounded-xl">
                            <span className="text-slate-400">Đơn hàng</span>
                            <span className="font-bold text-white">{editingCustomer.orders}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm p-3 bg-background-dark rounded-xl">
                            <span className="text-slate-400">Chi tiêu</span>
                            <span className="font-bold text-primary">{editingCustomer.totalSpent}</span>
                        </div>
                    </div>
                </div>
             </div>

             {/* Right: Form */}
             <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <Input 
                    label="Họ và tên" 
                    value={editingCustomer.name} 
                    onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})}
                    />
                    <Input 
                    label="Số điện thoại" 
                    value={editingCustomer.phone} 
                    onChange={(e) => setEditingCustomer({...editingCustomer, phone: e.target.value})}
                    />
                </div>
                
                <Input 
                    label="Email" 
                    value={editingCustomer.email} 
                    onChange={(e) => setEditingCustomer({...editingCustomer, email: e.target.value})}
                />

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Trạng thái tài khoản</label>
                    <select 
                        value={editingCustomer.status}
                        onChange={(e) => setEditingCustomer({...editingCustomer, status: e.target.value as any})}
                        className="w-full h-12 bg-background-dark border border-border-dark rounded-xl px-4 text-white focus:border-primary outline-none cursor-pointer"
                    >
                        <option value="Active">Đang hoạt động (Active)</option>
                        <option value="Inactive">Tạm ngưng (Inactive)</option>
                        <option value="Banned">Đã bị chặn (Banned)</option>
                    </select>
                </div>

                <div className="p-4 bg-background-dark/50 border border-border-dark rounded-xl">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Ghi chú quản trị viên</h4>
                    <textarea 
                        className="w-full bg-transparent text-sm text-white placeholder-slate-600 outline-none min-h-[80px]" 
                        placeholder="Thêm ghi chú về khách hàng này..."
                    ></textarea>
                </div>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomerManagement;
