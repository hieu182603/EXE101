import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => (
  <footer className="border-t border-border-dark bg-surface-dark pt-16 mt-auto transition-colors duration-300">
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        
        {/* Column 1: Brand */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-primary">
            <div className="size-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
               <span className="material-symbols-outlined text-white text-[24px]">bolt</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-text-main uppercase font-display">TechStore</span>
          </div>
          <p className="text-sm text-text-muted leading-relaxed">
            Hệ thống bán lẻ thiết bị công nghệ cao cấp hàng đầu. Đối tác chính thức của các thương hiệu lớn tại Việt Nam.
          </p>
          <div className="flex gap-4">
             {/* Facebook */}
             <a 
               href="https://facebook.com" 
               target="_blank" 
               rel="noopener noreferrer"
               className="size-10 rounded-full border border-border-dark flex items-center justify-center text-text-muted hover:bg-primary hover:text-white hover:border-primary transition-all"
             >
               <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                 <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
               </svg>
             </a>
             {/* YouTube */}
             <a 
               href="https://youtube.com" 
               target="_blank" 
               rel="noopener noreferrer"
               className="size-10 rounded-full border border-border-dark flex items-center justify-center text-text-muted hover:bg-primary hover:text-white hover:border-primary transition-all"
             >
               <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                 <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
               </svg>
             </a>
             {/* Instagram */}
             <a 
               href="https://instagram.com" 
               target="_blank" 
               rel="noopener noreferrer"
               className="size-10 rounded-full border border-border-dark flex items-center justify-center text-text-muted hover:bg-primary hover:text-white hover:border-primary transition-all"
             >
               <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                 <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
               </svg>
             </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="mb-6 font-black text-text-main uppercase text-xs tracking-[0.2em]">Sản phẩm</h4>
          <ul className="space-y-4 text-sm text-text-muted">
            <li><Link to="/catalog?category=Laptops" className="hover:text-primary transition-colors">Laptop Gaming</Link></li>
            <li><Link to="/catalog?category=Laptops" className="hover:text-primary transition-colors">PC Workstation</Link></li>
            <li><Link to="/catalog?category=Linh kiện" className="hover:text-primary transition-colors">Linh kiện máy tính</Link></li>
            <li><Link to="/catalog?category=Phụ kiện" className="hover:text-primary transition-colors">Gaming Gear</Link></li>
            <li><Link to="/catalog?brand=Apple" className="hover:text-primary transition-colors">Phụ kiện Apple</Link></li>
          </ul>
        </div>

        {/* Column 3: Policy */}
        <div>
          <h4 className="mb-6 font-black text-text-main uppercase text-xs tracking-[0.2em]">Chính sách</h4>
          <ul className="space-y-4 text-sm text-text-muted">
            <li><Link to="/policy?type=warranty" className="hover:text-primary transition-colors">Chính sách bảo hành</Link></li>
            <li><Link to="/policy?type=shipping" className="hover:text-primary transition-colors">Vận chuyển & Giao nhận</Link></li>
            <li><Link to="/policy?type=payment" className="hover:text-primary transition-colors">Chính sách thanh toán</Link></li>
            <li><Link to="/policy?type=privacy" className="hover:text-primary transition-colors">Bảo mật thông tin</Link></li>
          </ul>
        </div>

        {/* Column 4: Newsletter */}
        <div className="space-y-6">
          <h4 className="font-black text-text-main uppercase text-xs tracking-[0.2em]">Đăng ký nhận tin</h4>
          <p className="text-sm text-text-muted">Nhận thông tin khuyến mãi và mã giảm giá sớm nhất.</p>
          <form className="relative" onSubmit={(e) => { e.preventDefault(); alert("Cảm ơn bạn đã đăng ký!"); }}>
             <input type="email" placeholder="Email của bạn" className="w-full h-12 rounded-xl border border-border-dark bg-background-dark pl-4 pr-12 text-sm text-text-main focus:border-primary focus:ring-1 focus:ring-primary outline-none" required />
             <button type="submit" className="absolute right-2 top-2 size-8 rounded-lg bg-primary text-white flex items-center justify-center hover:opacity-90">
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
             </button>
          </form>
          <div className="pt-4">
             <h4 className="font-bold text-text-main text-[10px] uppercase tracking-widest mb-3">Thanh toán</h4>
             <div className="flex gap-3 opacity-60 grayscale hover:grayscale-0 transition-all">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-6" alt="Visa" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-6" alt="Paypal" />
             </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-border-dark py-8 flex flex-col md:flex-row justify-between items-center gap-4">
         <p className="text-xs text-text-muted font-medium">© 2024 TechStore Vietnam. All rights reserved.</p>
         <div className="flex gap-6 text-xs text-text-muted font-bold uppercase tracking-wider">
            <Link to="/policy?type=terms" className="hover:text-text-main">Điều khoản</Link>
            <Link to="/policy?type=privacy" className="hover:text-text-main">Quyền riêng tư</Link>
            <Link to="/policy?type=cookies" className="hover:text-text-main">Cookies</Link>
         </div>
      </div>
    </div>
  </footer>
);

export default Footer;



