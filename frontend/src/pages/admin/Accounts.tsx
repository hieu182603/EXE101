
import React, { useState, useMemo, useEffect } from 'react';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import Modal from '@components/ui/Modal';
import Pagination from '@components/ui/Pagination';
import { Input } from '@components/ui/Input';
import { accountService } from '@services/accountService';
import { useToast } from '@contexts/ToastContext';

interface Account {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

const ITEMS_PER_PAGE = 5;

const AccountManagement: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [currentPage, setCurrentPage] = useState(1);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Load accounts
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoading(true);
        const response = await accountService.getAllAccounts();
        const accountsData = response.data || [];
        
        // Transform backend accounts to display format
        const transformedAccounts: Account[] = accountsData.map((a: any) => ({
          id: a.id,
          name: a.name || a.username || 'Unknown',
          email: a.email || '',
          role: a.role?.name || a.role || 'customer',
          status: a.isRegistered ? 'Active' as const : 'Inactive' as const,
          lastLogin: a.lastLogin || 'N/A'
        }));
        
        setAccounts(transformedAccounts);
      } catch (error) {
        console.error('Error loading accounts:', error);
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      try {
        const account = accounts.find(a => a.id === id);
        if (account) {
          await accountService.deleteAccount(account.name);
          setAccounts(accounts.filter(a => a.id !== id));
          showSuccess("Xóa tài khoản thành công!");
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        showError("Xóa tài khoản thất bại. Vui lòng thử lại.");
      }
    }
  };

  const handleCreateAccount = () => {
    setIsAddModalOpen(false);
    showSuccess("Đã tạo tài khoản mới!");
  };

  const handleSaveEdit = () => {
    setEditingAccount(null);
    showSuccess("Đã lưu thay đổi!");
  };

  const filteredAccounts = useMemo(() => {
    return accounts.filter(a => {
        const matchesSearch = 
            a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = filterRole === 'All' || a.role === filterRole;
        const matchesStatus = filterStatus === 'All' || a.status === filterStatus;

        return matchesSearch && matchesRole && matchesStatus;
    });
  }, [accounts, searchTerm, filterRole, filterStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredAccounts.length]);

  const totalPages = Math.ceil(filteredAccounts.length / ITEMS_PER_PAGE);
  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAccounts.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredAccounts]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Quản Lý Tài Khoản</h1>
          <p className="text-gray-400 mt-1">Quản lý quyền truy cập và nhân viên hệ thống</p>
        </div>
        <Button 
          variant="primary" 
          icon="person_add" 
          onClick={() => setIsAddModalOpen(true)}
        >
          Thêm Tài Khoản
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 rounded-2xl border border-border-dark bg-surface-dark p-5 shadow-sm items-center">
        <div className="relative flex-1 w-full md:w-auto">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input 
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border-dark bg-background-dark text-sm text-white placeholder-gray-500 focus:border-primary outline-none transition-all" 
            placeholder="Tìm tên nhân viên, email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <select 
            className="h-11 appearance-none rounded-xl border border-border-dark bg-background-dark px-4 pl-4 text-sm text-white focus:border-primary outline-none min-w-[160px] cursor-pointer"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="All">Tất cả vai trò</option>
            <option value="Administrator">Administrator</option>
            <option value="Manager">Manager</option>
            <option value="Editor">Editor</option>
            <option value="Staff">Staff</option>
          </select>
          <select 
            className="h-11 appearance-none rounded-xl border border-border-dark bg-background-dark px-4 pl-4 text-sm text-white focus:border-primary outline-none min-w-[160px] cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="Active">Đang hoạt động</option>
            <option value="Inactive">Đã khóa</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-border-dark bg-surface-dark shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1a1a1a] text-xs uppercase text-gray-300 border-b border-border-dark">
              <tr>
                <th className="px-6 py-4 font-semibold">Người dùng</th>
                <th className="px-6 py-4 font-semibold">Vai trò</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold">Đăng nhập cuối</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {paginatedAccounts.map((account) => (
                <tr key={account.id} className="group hover:bg-surface-accent transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-background-dark flex items-center justify-center border border-border-dark text-primary font-bold">
                        {account.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-primary transition-colors">{account.name}</div>
                        <div className="text-xs text-gray-500">{account.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-white bg-white/5 px-2 py-1 rounded-lg border border-white/10">{account.role}</span>
                  </td>
                  <td className="px-6 py-4">
                     <Badge variant={account.status === 'Active' ? 'success' : 'neutral'} dot>
                        {account.status === 'Active' ? 'Đang hoạt động' : 'Đã khóa'}
                     </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{account.lastLogin}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        icon="edit" 
                        className="size-9 p-0 text-blue-400 hover:bg-blue-400/10" 
                        onClick={() => setEditingAccount(account)}
                      />
                      <Button 
                        variant="ghost" 
                        icon="delete" 
                        className="size-9 p-0 text-red-400 hover:bg-red-400/10" 
                        onClick={() => handleDelete(account.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
        />
      </div>

      {/* Add Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm Tài Khoản Mới"
        footer={
            <>
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Hủy bỏ</Button>
                <Button variant="primary" onClick={handleCreateAccount}>Tạo tài khoản</Button>
            </>
        }
      >
        <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">info</span>
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white mb-1">Lưu ý bảo mật</h4>
                    <p className="text-xs text-slate-400">Mật khẩu mặc định sẽ được gửi vào email của nhân viên. Yêu cầu đổi mật khẩu trong lần đăng nhập đầu tiên.</p>
                </div>
            </div>

            <Input label="Họ và tên" placeholder="Nhập tên nhân viên..." icon="person" />
            <Input label="Email đăng nhập" type="email" placeholder="email@techstore.vn" icon="mail" />
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 w-full">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Phân quyền</label>
                    <select className="w-full h-12 bg-background-dark border border-border-dark rounded-xl px-4 text-white focus:border-primary outline-none cursor-pointer">
                        <option>Administrator</option>
                        <option>Manager</option>
                        <option>Editor</option>
                        <option>Staff</option>
                    </select>
                </div>
                <div className="space-y-2 w-full">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Phòng ban</label>
                    <select className="w-full h-12 bg-background-dark border border-border-dark rounded-xl px-4 text-white focus:border-primary outline-none cursor-pointer">
                        <option>Kinh doanh</option>
                        <option>Kỹ thuật</option>
                        <option>Kho vận</option>
                        <option>Marketing</option>
                    </select>
                </div>
            </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={!!editingAccount} 
        onClose={() => setEditingAccount(null)}
        title="Chỉnh Sửa Tài Khoản"
        footer={
            <>
                <Button variant="outline" onClick={() => setEditingAccount(null)}>Hủy bỏ</Button>
                <Button variant="primary" onClick={handleSaveEdit}>Lưu thay đổi</Button>
            </>
        }
      >
        {editingAccount && (
            <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="size-16 rounded-full bg-background-dark border border-border-dark flex items-center justify-center text-primary font-bold text-2xl">
                        {editingAccount.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">{editingAccount.name}</h3>
                        <p className="text-sm text-slate-400">{editingAccount.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input label="Họ và tên" defaultValue={editingAccount.name} />
                    <Input label="Số điện thoại" placeholder="090..." />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 w-full">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Phân quyền</label>
                        <select 
                            defaultValue={editingAccount.role}
                            className="w-full h-12 bg-background-dark border border-border-dark rounded-xl px-4 text-white focus:border-primary outline-none cursor-pointer"
                        >
                            <option>Administrator</option>
                            <option>Manager</option>
                            <option>Editor</option>
                            <option>Staff</option>
                        </select>
                    </div>

                    <div className="space-y-2 w-full">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Trạng thái</label>
                        <select 
                            defaultValue={editingAccount.status}
                            className="w-full h-12 bg-background-dark border border-border-dark rounded-xl px-4 text-white focus:border-primary outline-none cursor-pointer"
                        >
                            <option value="Active">Đang hoạt động</option>
                            <option value="Inactive">Đã khóa</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4 border-t border-border-dark">
                    <button className="text-red-500 text-sm font-bold hover:underline flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                        Gửi email đặt lại mật khẩu
                    </button>
                </div>
            </div>
        )}
      </Modal>
    </div>
  );
};

export default AccountManagement;
