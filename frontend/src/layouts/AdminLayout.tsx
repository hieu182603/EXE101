
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

export type DateRangeOption = 'all' | 'today' | 'week' | 'month';

export interface AdminOutletContext {
  dateRange: DateRangeOption;
  setDateRange: (range: DateRangeOption) => void;
  getDateRangeLabel: () => string;
  isInRange: (dateStr: string) => boolean;
}

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [dateRange, setDateRange] = useState<DateRangeOption>('all');
  
  // Dropdown States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notificationTab, setNotificationTab] = useState<'all' | 'unread'>('all');
  
  // Refs for click outside
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case 'today': return 'Hôm nay';
      case 'week': return '7 ngày qua';
      case 'month': return 'Tháng này';
      default: return 'Tất cả thời gian';
    }
  };

  const isInRange = (dateStr: string) => {
    if (dateRange === 'all') return true;
    
    // Parse DD/MM/YYYY
    const [d, m, y] = dateStr.split('/').map(Number);
    const date = new Date(y, m - 1, d);
    const now = new Date();
    // Reset hours for accurate date comparison
    now.setHours(0,0,0,0);
    date.setHours(0,0,0,0);
    
    if (dateRange === 'today') {
      return date.getTime() === now.getTime();
    }
    
    if (dateRange === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return date >= weekAgo && date <= now;
    }
    
    if (dateRange === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      return date >= monthAgo && date <= now;
    }
    
    return true;
  };

  const navItems = [
    { name: 'Tổng Quan', path: '/admin', icon: 'dashboard' },
    { name: 'Phân tích', path: '/admin/analytics', icon: 'analytics' },
    { name: 'Báo cáo', path: '/admin/reports', icon: 'description' },
    { name: 'Sản phẩm', path: '/admin/products', icon: 'inventory_2' },
    { name: 'Đơn hàng', path: '/admin/orders', icon: 'shopping_cart' },
    { name: 'Khách hàng', path: '/admin/customers', icon: 'group' },
    { name: 'Shipper', path: '/admin/shippers', icon: 'local_shipping' },
    { name: 'Banner', path: '/admin/banners', icon: 'image' },
    { name: 'Phản hồi', path: '/admin/feedback', icon: 'reviews' },
    { name: 'Tài khoản', path: '/admin/accounts', icon: 'manage_accounts' },
  ];

  const handleLogout = () => {
    // Simple redirect on logout; actual logout handled by AuthContext elsewhere
    try {
      // Clear local storage token/user to force re-login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (e) {}
    navigate('/login');
  };

  // Enhanced Mock Notifications
  const mockNotifications: Array<{ id: number; type: string; title: string; desc: string; time: string; unread: boolean }> = [];

  const filteredNotifications = useMemo(() => {
    if (notificationTab === 'unread') {
        return mockNotifications.filter(n => n.unread);
    }
    return mockNotifications;
  }, [notificationTab]);

  const unreadCount = mockNotifications.filter(n => n.unread).length;

  const getNotifIcon = (type: string) => {
    switch (type) {
        case 'order': return { icon: 'shopping_bag', color: 'text-blue-400 bg-blue-400/10' };
        case 'stock': return { icon: 'warning', color: 'text-red-400 bg-red-400/10' };
        case 'review': return { icon: 'star', color: 'text-yellow-400 bg-yellow-400/10' };
        case 'system': return { icon: 'settings', color: 'text-slate-400 bg-slate-400/10' };
        default: return { icon: 'notifications', color: 'text-primary bg-primary/10' };
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-dark font-display text-white">
      {/* Sidebar - Updated background to match theme */}
      <aside className={`flex flex-col border-r border-border-dark bg-surface-dark/50 backdrop-blur-xl transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} hidden md:flex`}>
        <div className="flex h-16 items-center gap-3 px-6 border-b border-border-dark">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <span className="material-symbols-outlined text-white text-[20px] font-black">bolt</span>
          </div>
          {isSidebarOpen && <h1 className="text-xl font-black tracking-tighter text-white uppercase truncate">TechStore</h1>}
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                location.pathname === item.path 
                ? 'bg-primary/10 text-primary shadow-[0_0_10px_rgba(99,102,241,0.1)]' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`material-symbols-outlined ${location.pathname === item.path ? 'fill' : ''}`}>{item.icon}</span>
              {isSidebarOpen && <span className="font-bold text-sm tracking-wide">{item.name}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden bg-background-dark">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border-dark bg-background-dark/80 backdrop-blur-md px-6 lg:px-10 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-surface-accent transition-all">
              <span className="material-symbols-outlined">{isSidebarOpen ? 'menu_open' : 'menu'}</span>
            </button>
            <h2 className="text-lg font-black text-white uppercase tracking-widest hidden lg:block">Quản trị Hệ thống</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="material-symbols-outlined text-gray-500 group-focus-within:text-primary transition-colors text-[18px]">search</span>
              </div>
              <input className="block w-64 rounded-xl border border-border-dark bg-surface-dark py-2 pl-10 pr-4 text-xs text-white placeholder-gray-600 focus:ring-1 focus:ring-primary transition-all" placeholder="Tìm nhanh..." />
            </div>

            {/* Global Date Filter */}
            <div className="hidden md:flex items-center gap-2 bg-surface-dark border border-border-dark rounded-xl px-3 py-2 hover:border-primary/50 transition-colors">
              <span className="material-symbols-outlined text-gray-400 text-[18px]">calendar_today</span>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
                className="bg-transparent border-none text-xs font-bold text-white focus:ring-0 cursor-pointer outline-none min-w-[100px]"
              >
                <option value="all">Tất cả thời gian</option>
                <option value="today">Hôm nay</option>
                <option value="week">7 ngày qua</option>
                <option value="month">Tháng này</option>
              </select>
            </div>
            
            <div className="flex items-center gap-4 border-l border-border-dark pl-6">
              {/* Notification Dropdown */}
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative rounded-xl p-2 text-gray-400 hover:bg-surface-accent hover:text-white transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)] animate-pulse"></span>
                  )}
                </button>

                {showNotifications && (
                    <div className="absolute right-0 mt-4 w-[380px] bg-surface-dark border border-border-dark rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                        {/* Notif Header */}
                        <div className="p-4 border-b border-border-dark flex justify-between items-center bg-background-dark/50 backdrop-blur-sm">
                            <h4 className="font-bold text-white text-sm">Thông báo</h4>
                            <div className="flex bg-surface-dark rounded-lg p-1 border border-border-dark">
                                <button 
                                    onClick={() => setNotificationTab('all')}
                                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${notificationTab === 'all' ? 'bg-primary text-white shadow' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Tất cả
                                </button>
                                <button 
                                    onClick={() => setNotificationTab('unread')}
                                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${notificationTab === 'unread' ? 'bg-primary text-white shadow' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Chưa đọc
                                </button>
                            </div>
                        </div>
                        
                        {/* Notif List */}
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {filteredNotifications.length > 0 ? filteredNotifications.map(n => {
                                const style = getNotifIcon(n.type);
                                return (
                                    <div key={n.id} className={`flex gap-3 p-4 border-b border-border-dark/50 last:border-0 hover:bg-white/[0.02] cursor-pointer transition-colors group ${n.unread ? 'bg-primary/[0.03]' : ''}`}>
                                        <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${style.color}`}>
                                            <span className="material-symbols-outlined text-[20px]">{style.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <p className={`text-xs leading-snug truncate pr-2 ${n.unread ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>{n.title}</p>
                                                {n.unread && <span className="size-2 rounded-full bg-primary shrink-0 mt-1 shadow-[0_0_5px_rgba(220,38,38,0.5)]"></span>}
                                            </div>
                                            <p className="text-[11px] text-slate-400 line-clamp-2 mb-1.5 leading-relaxed group-hover:text-slate-300 transition-colors">{n.desc}</p>
                                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wide">{n.time}</p>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="py-12 text-center text-slate-500">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">notifications_off</span>
                                    <p className="text-xs">Không có thông báo mới</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Notif Footer */}
                        <div className="p-3 border-t border-border-dark bg-background-dark/50 backdrop-blur-sm flex justify-between items-center">
                            <button className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">done_all</span> Đánh dấu đã đọc
                            </button>
                            <button className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1 group">
                                Xem tất cả <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                )}
              </div>

              {/* Admin Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-3 hover:bg-surface-accent rounded-xl p-1.5 transition-all group"
                >
                    <div className="text-right hidden md:block">
                        <p className="text-xs font-bold text-white group-hover:text-primary transition-colors">Admin User</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase">Administrator</p>
                    </div>
                    <div className="size-9 rounded-lg bg-cover bg-center border border-border-dark group-hover:border-primary transition-all" style={{ backgroundImage: `url('https://picsum.photos/100/100?random=${user?.username || 'admin'}')` }}></div>
                </button>

                {showProfileMenu && (
                    <div className="absolute right-0 mt-4 w-56 bg-surface-dark border border-border-dark rounded-2xl shadow-xl p-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                        <div className="px-3 py-2 border-b border-border-dark mb-2 md:hidden">
                            <p className="text-sm font-bold text-white">Admin User</p>
                            <p className="text-[10px] text-slate-500">Administrator</p>
                        </div>
                        <Link 
                            to="/admin/accounts" 
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                        >
                            <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                            Quản lý tài khoản
                        </Link>
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all text-left">
                            <span className="material-symbols-outlined text-[18px]">settings</span>
                            Cài đặt hệ thống
                        </button>
                        <div className="h-px bg-border-dark my-2"></div>
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all text-left"
                        >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                            Đăng xuất
                        </button>
                    </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar bg-background-dark">
          <Outlet context={{ dateRange, setDateRange, getDateRangeLabel, isInRange }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
