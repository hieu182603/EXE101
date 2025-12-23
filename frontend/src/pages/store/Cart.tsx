
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

const CartPage: React.FC = () => {
  const [items, setItems] = useState([
    { id: '1', name: 'Tai nghe Gaming HyperX Cloud II - 7.1', price: 2490000, oldPrice: 2990000, color: 'Đỏ đen', qty: 1 },
    { id: '2', name: 'Logitech G Pro X Wireless Lightspeed', price: 3290000, color: 'Đen', qty: 1 },
  ]);

  const updateQty = (id: string, delta: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));
  };

  const removeItem = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const subtotal = items.reduce((acc, curr) => acc + curr.price * curr.qty, 0);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <div className="size-32 bg-surface-dark border border-border-dark rounded-full flex items-center justify-center mx-auto mb-6">
           <span className="material-symbols-outlined text-[64px] text-slate-700">shopping_cart_off</span>
        </div>
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Giỏ hàng trống</h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">Có vẻ như bạn chưa thêm sản phẩm nào. Hãy khám phá danh mục của chúng tôi để tìm món đồ ưng ý.</p>
        <Link to="/catalog">
          <Button icon="arrow_back" size="lg">Quay lại mua sắm</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-[1440px]">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Giỏ hàng của bạn</h1>
        <p className="text-slate-400 mt-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
          Bạn có <span className="font-bold text-white">{items.length}</span> sản phẩm trong danh sách
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-surface-dark rounded-3xl border border-border-dark p-4 md:p-6 flex flex-col md:flex-row gap-6 items-center group hover:border-primary/30 transition-all">
              
              {/* Product Info */}
              <div className="w-full md:flex-1 flex gap-4 md:gap-6 items-center">
                <div className="shrink-0 size-20 md:size-24 bg-background-dark rounded-2xl border border-border-dark p-2 flex items-center justify-center overflow-hidden">
                  <span className="material-symbols-outlined text-3xl text-slate-600">image</span>
                </div>
                <div className="flex flex-col gap-1 pr-4">
                  <h3 className="font-bold text-white text-base md:text-lg leading-tight line-clamp-2">{item.name}</h3>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">Phân loại: {item.color}</span>
                  </div>
                  {/* Mobile Price Display */}
                  <div className="md:hidden mt-2">
                     <span className="font-bold text-primary">{item.price.toLocaleString()}₫</span>
                  </div>
                </div>
              </div>

              {/* Actions & Metrics */}
              <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-4 md:gap-8 border-t md:border-t-0 border-border-dark pt-4 md:pt-0">
                
                {/* Desktop Price */}
                <div className="hidden md:flex flex-col items-center min-w-[80px]">
                  <span className="text-[10px] font-bold text-slate-500 uppercase mb-1">Đơn giá</span>
                  <span className="font-bold text-white text-sm">{item.price.toLocaleString()}₫</span>
                </div>
                
                {/* Quantity */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase mb-1 md:hidden">Số lượng</span>
                  <div className="flex items-center bg-background-dark rounded-xl border border-border-dark p-1 h-10">
                    <Button variant="ghost" icon="remove" className="size-8 p-0 hover:bg-surface-dark" onClick={() => updateQty(item.id, -1)} />
                    <span className="w-8 text-center text-sm font-bold text-white">{item.qty}</span>
                    <Button variant="ghost" icon="add" className="size-8 p-0 hover:bg-surface-dark" onClick={() => updateQty(item.id, 1)} />
                  </div>
                </div>

                {/* Subtotal */}
                <div className="flex flex-col items-end min-w-[100px]">
                  <span className="text-[10px] font-bold text-slate-500 uppercase mb-1 md:hidden">Thành tiền</span>
                  <span className="font-black text-primary text-lg">{(item.price * item.qty).toLocaleString()}₫</span>
                </div>

                {/* Delete Button */}
                <button 
                    onClick={() => removeItem(item.id)}
                    className="size-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all ml-2"
                    title="Xóa sản phẩm"
                >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Summary Sidebar */}
        <div className="lg:w-[380px] shrink-0">
          <div className="bg-surface-dark rounded-3xl border border-border-dark p-6 md:p-8 sticky top-24 shadow-2xl overflow-hidden">
            {/* Decoration */}
            <div className="absolute -top-10 -right-10 size-32 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
            
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2 relative z-10">
               <span className="material-symbols-outlined text-primary">receipt_long</span>
               Tổng quan đơn hàng
            </h2>
            
            <div className="space-y-4 mb-8 relative z-10">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Tổng giá trị hàng</span>
                <span className="text-white font-bold">{subtotal.toLocaleString()}₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Khuyến mãi</span>
                <span className="text-emerald-400 font-bold">-0₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Vận chuyển</span>
                <span className="text-emerald-400 font-bold uppercase text-xs tracking-wider bg-emerald-400/10 px-2 py-0.5 rounded">Miễn phí</span>
              </div>
              
              <div className="h-px bg-border-dark my-4"></div>
              
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold text-white">Tổng cộng</span>
                <div className="text-right">
                   <span className="text-3xl font-black text-primary block leading-none">{subtotal.toLocaleString()}₫</span>
                   <span className="text-[10px] text-slate-500 font-medium">(Đã bao gồm VAT)</span>
                </div>
              </div>
            </div>
            
            <Link to="/checkout">
              <Button size="xl" variant="primary" icon="arrow_forward" className="w-full relative z-10 bg-gradient-to-r from-primary to-red-700 hover:to-red-600 border-none shadow-lg shadow-red-900/30">
                Thanh toán
              </Button>
            </Link>
            
            <div className="mt-6 flex items-center justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               <span className="material-symbols-outlined text-2xl" title="Bảo mật">lock</span>
               <span className="material-symbols-outlined text-2xl" title="Visa">credit_card</span>
               <span className="material-symbols-outlined text-2xl" title="Ví điện tử">account_balance_wallet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
