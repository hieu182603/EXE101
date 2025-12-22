import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { useCart } from '@contexts/CartContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { items } = useCart();
  const [search, setSearch] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // States for features
  const [isDark, setIsDark] = useState(true);
  const [lang, setLang] = useState<'vi' | 'en'>('vi');

  const menuRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: lang === 'vi' ? 'Trang chủ' : 'Home', path: '/' },
    { name: lang === 'vi' ? 'Sản phẩm' : 'Products', path: '/catalog' },
    { name: lang === 'vi' ? 'Báo giá' : 'Quote', path: '/quote' },
    { name: lang === 'vi' ? 'Tra cứu' : 'Tracking', path: '/history' },
  ];

  // Calculate cart items count
  const cartItemsCount = items ? items.reduce((total, item) => total + item.quantity, 0) : 0;

  // Initialize Theme
  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove('dark');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      setIsDark(true);
    }
  };

  const toggleLang = () => {
    setLang(prev => prev === 'vi' ? 'en' : 'vi');
  };

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="sticky top-0 z-50 w-full flex flex-col">
      {/* 1. Top Bar (Premium Look) */}
      <div className="bg-primary text-white text-[10px] sm:text-xs font-bold py-1.5 px-4 relative z-50">
        <div className="mx-auto max-w-[1440px] flex justify-between items-center">
          <div className="flex gap-4">
            <span className="hidden sm:inline opacity-90">Hotline: 1900 1234</span>
            <span className="opacity-90">Email: support@techstore.vn</span>
          </div>
          <div className="flex gap-4 items-center">
            {isAuthenticated() && (user?.role === 'admin' || user?.role === 'manager' || user?.role === 'staff') && (
              <Link to="/admin" className="hover:underline opacity-90">Kênh người bán</Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Navbar */}
      <header className="w-full border-b border-border-dark bg-background-dark/80 backdrop-blur-xl transition-colors duration-300">
        <div className="mx-auto flex h-16 sm:h-20 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
          
          {/* Logo & Links */}
          <div className="flex items-center gap-8 md:gap-12">
            <Link to="/" className="flex items-center gap-2 text-primary group">
              <div className="size-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-white text-[24px] font-black">bolt</span>
              </div>
              <div className="hidden lg:flex flex-col">
                 <h1 className="text-xl font-black tracking-tighter text-text-main uppercase font-display leading-none">TechStore</h1>
                 <span className="text-[9px] font-bold text-text-muted tracking-[0.3em] uppercase">Premium Gear</span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center bg-surface-dark/50 p-1 rounded-full border border-border-dark">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                    location.pathname === link.path 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-text-muted hover:text-text-main hover:bg-white/10'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative group">
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-12 pr-4 rounded-full border border-border-dark bg-surface-dark text-text-main placeholder-text-muted focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none text-sm transition-all shadow-sm" 
              placeholder={lang === 'vi' ? "Tìm kiếm sản phẩm..." : "Search products..."} 
            />
            <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
              <span className="material-symbols-outlined">search</span>
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-5">
            
            {/* Language Toggle */}
            <button 
              onClick={toggleLang}
              className="size-10 rounded-full border border-border-dark bg-surface-dark text-text-muted hover:text-primary hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-all font-black text-[10px]"
              title={lang === 'vi' ? "Switch to English" : "Chuyển sang Tiếng Việt"}
            >
              {lang === 'vi' ? 'VN' : 'EN'}
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="size-10 rounded-full border border-border-dark bg-surface-dark text-text-muted hover:text-primary hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-all"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <span className="material-symbols-outlined text-[20px] transition-transform duration-500 rotate-0 dark:-rotate-180">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative size-10 rounded-full border border-border-dark bg-surface-dark text-text-muted hover:text-primary hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-all group">
              <span className="material-symbols-outlined text-[20px] group-hover:animate-bounce-slow">shopping_bag</span>
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white border-2 border-background-dark">
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
            </Link>
            
            <div className="h-8 w-px bg-border-dark hidden sm:block"></div>
            
            {/* User Profile */}
            {isAuthenticated() && user ? (
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 rounded-full hover:bg-surface-accent pr-1 transition-all group"
                >
                  <div className="size-10 rounded-full overflow-hidden border-2 border-border-dark group-hover:border-primary transition-all bg-surface-dark flex items-center justify-center">
                    {user.name || user.username ? (
                      <span className="text-primary font-black text-sm">
                        {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-text-muted">person</span>
                    )}
                  </div>
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-bold text-text-main leading-none">
                      {user.name || user.username || 'User'}
                    </span>
                    <span className="text-[10px] text-primary font-black uppercase">
                      {typeof user.role === 'object' ? user.role.name : user.role || 'Member'}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-4 w-60 bg-surface-dark border border-border-dark rounded-2xl shadow-xl p-2 animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">
                    <div className="px-4 py-3 bg-surface-accent rounded-xl mb-2">
                      <p className="text-sm font-bold text-text-main">{user.name || user.username || 'User'}</p>
                      <p className="text-xs text-text-muted truncate">{user.email || user.phone || ''}</p>
                    </div>
                    <Link 
                      to="/profile" 
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:bg-background-dark hover:text-text-main transition-all"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <span className="material-symbols-outlined text-[20px]">person</span>
                      Hồ sơ cá nhân
                    </Link>
                    <Link 
                      to="/history" 
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:bg-background-dark hover:text-text-main transition-all"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                      Đơn mua
                    </Link>
                    <div className="h-px bg-border-dark my-2"></div>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-border-dark bg-surface-dark text-text-muted hover:text-primary hover:border-primary hover:bg-primary/5 transition-all text-sm font-bold"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span className="hidden sm:inline">Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default Navbar;

