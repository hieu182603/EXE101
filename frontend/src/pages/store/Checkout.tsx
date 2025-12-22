
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Badge from '@components/ui/Badge';
import { useCart } from '@contexts/CartContext';
import { authService } from '@services/authService';
import { orderService } from '@services/orderService';

// Mock data structure matching Profile
interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  detail: string;
  isDefault: boolean;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalAmount, selectedItems, getSelectedSubtotal } = useCart();
  const [loading, setLoading] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  
  // Load user addresses from profile
  useEffect(() => {
    const loadUserAddresses = async () => {
      try {
        setLoading(true);
        const userProfile = await authService.getUserProfile();
        const userData = userProfile.data || userProfile;
        
        // For now, create a default address from user profile
        // Backend may not have separate address management
        if (userData) {
          const defaultAddress: Address = {
            id: 'default',
            label: 'Địa chỉ mặc định',
            recipientName: userData.name || userData.username || 'User',
            phone: userData.phone || '',
            detail: '', // User needs to fill this
            isDefault: true
          };
          setSavedAddresses([defaultAddress]);
        }
      } catch (error) {
        console.error('Error loading user addresses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserAddresses();
  }, []);

  // Get selected cart items for checkout
  const checkoutItems = items.filter(item => {
    const itemId = item.product?.id || item.id;
    return selectedItems.has(itemId);
  });
  
  const subtotal = getSelectedSubtotal();
  const shippingFee = 0; // Free shipping
  const total = subtotal + shippingFee;

  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>(savedAddresses.find(a => a.isDefault)?.id || 'new');
  const [paymentMethod, setPaymentMethod] = useState('vnpay');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    note: ''
  });

  // Effect to populate form when address changes
  useEffect(() => {
    if (selectedAddressId === 'new') {
      setFormData(prev => ({ ...prev, name: '', phone: '', address: '' }));
    } else {
      const addr = savedAddresses.find(a => a.id === selectedAddressId);
      if (addr) {
        setFormData(prev => ({
          ...prev,
          name: addr.recipientName,
          phone: addr.phone,
          address: addr.detail
        }));
      }
    }
  }, [selectedAddressId]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-[1440px]">
      <h1 className="text-3xl font-black text-white mb-8 tracking-tight">Thanh toán đơn hàng</h1>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          
          {/* Address Selection Section */}
          <section className="bg-surface-dark border border-border-dark rounded-3xl p-8">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  Địa chỉ nhận hàng
                </h3>
                <Link to="/profile" className="text-xs font-bold text-primary hover:underline">Quản lý sổ địa chỉ</Link>
             </div>
             
             {/* Horizontal Scroll / Grid for Address Cards */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {savedAddresses.map((addr) => (
                  <div 
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all relative ${
                      selectedAddressId === addr.id 
                      ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(220,38,38,0.15)]' 
                      : 'bg-background-dark border-border-dark hover:border-slate-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <span className={`text-xs font-black uppercase tracking-wider ${selectedAddressId === addr.id ? 'text-primary' : 'text-slate-400'}`}>
                         {addr.label}
                       </span>
                       {selectedAddressId === addr.id && <span className="material-symbols-outlined text-primary text-xl">check_circle</span>}
                    </div>
                    <p className="font-bold text-white text-sm mb-1">{addr.recipientName} - {addr.phone}</p>
                    <p className="text-xs text-slate-400 line-clamp-2">{addr.detail}</p>
                  </div>
                ))}
                
                {/* Option for New Address */}
                <div 
                   onClick={() => setSelectedAddressId('new')}
                   className={`cursor-pointer rounded-2xl border border-dashed p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                     selectedAddressId === 'new'
                     ? 'bg-white/5 border-white text-white'
                     : 'bg-transparent border-border-dark text-slate-500 hover:text-white hover:border-slate-400'
                   }`}
                >
                   <span className="material-symbols-outlined text-2xl">add_location_alt</span>
                   <span className="text-xs font-bold uppercase">Nhập địa chỉ khác</span>
                </div>
             </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border-dark">
              <input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:ring-1 focus:ring-primary outline-none" 
                placeholder="Họ và tên người nhận" 
              />
              <input 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:ring-1 focus:ring-primary outline-none" 
                placeholder="Số điện thoại" 
              />
              <input 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="md:col-span-2 bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:ring-1 focus:ring-primary outline-none" 
                placeholder="Địa chỉ chi tiết (Số nhà, đường, phường/xã...)" 
              />
              <textarea 
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
                className="md:col-span-2 bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:ring-1 focus:ring-primary outline-none h-24" 
                placeholder="Ghi chú thêm (VD: Giao giờ hành chính, gọi trước khi giao...)"
              ></textarea>
            </div>
          </section>

          <section className="bg-surface-dark border border-border-dark rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">payments</span>
              Phương thức thanh toán
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'vnpay', name: 'Ví VNPay', icon: 'qr_code_2' },
                { id: 'card', name: 'Thẻ ATM', icon: 'credit_card' },
                { id: 'cod', name: 'COD', icon: 'handshake' }
              ].map(p => (
                <div 
                  key={p.id} 
                  onClick={() => setPaymentMethod(p.id)}
                  className={`border rounded-2xl p-4 flex flex-col items-center gap-3 cursor-pointer transition-all group ${
                    paymentMethod === p.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border-dark bg-background-dark/50 hover:border-primary'
                  }`}
                >
                  <span className={`material-symbols-outlined text-3xl ${paymentMethod === p.id ? 'text-primary' : 'text-slate-500 group-hover:text-primary'}`}>
                    {p.icon}
                  </span>
                  <span className={`text-sm font-bold ${paymentMethod === p.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-surface-dark border border-border-dark rounded-3xl p-8 sticky top-24">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-border-dark pb-4">Tóm tắt đơn hàng</h3>
            
            {/* Cart Items */}
            <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
              {checkoutItems.length > 0 ? (
                checkoutItems.map((item) => {
                  const itemId = item.product?.id || item.id;
                  const productName = item.product?.name || 'Product';
                  const productPrice = item.product?.price || 0;
                  const quantity = item.quantity;
                  
                  return (
                    <div key={itemId} className="flex gap-3 pb-3 border-b border-border-dark last:border-0">
                      <div className="size-12 rounded-lg bg-background-dark border border-border-dark flex items-center justify-center shrink-0 overflow-hidden">
                        <img 
                          src={item.product?.images?.[0]?.url || item.product?.url || 'https://picsum.photos/200/200'} 
                          alt={productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{productName}</p>
                        <p className="text-xs text-slate-400">Số lượng: {quantity}</p>
                        <p className="text-sm font-bold text-primary">{(productPrice * quantity).toLocaleString('vi-VN')}₫</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <span className="material-symbols-outlined text-3xl mb-2 block">shopping_cart</span>
                  <p className="text-sm">Giỏ hàng trống</p>
                </div>
              )}
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-slate-400"><span>Tạm tính</span><span className="text-white font-bold">{subtotal.toLocaleString('vi-VN')}₫</span></div>
              <div className="flex justify-between text-slate-400"><span>Vận chuyển</span><span className="text-emerald-500 font-bold">Miễn phí</span></div>
              <div className="flex justify-between text-lg font-black text-white pt-4 border-t border-border-dark"><span>Tổng tiền</span><span className="text-primary">{total.toLocaleString('vi-VN')}₫</span></div>
            </div>
            <button 
              onClick={async () => {
                if (!formData.name || !formData.phone || !formData.address) {
                  alert('Vui lòng điền đầy đủ thông tin địa chỉ');
                  return;
                }
                
                if (checkoutItems.length === 0) {
                  alert('Giỏ hàng trống');
                  return;
                }

                try {
                  // Create order
                  const orderData = {
                    shippingAddress: formData.address,
                    note: formData.note || '',
                    paymentMethod: paymentMethod === 'cod' ? 'Cash on delivery' : 'Online payment',
                    requireInvoice: false,
                    isGuest: false,
                    guestCartItems: checkoutItems.map(item => ({
                      productId: item.product?.id || item.id,
                      quantity: item.quantity,
                      price: item.product?.price || 0,
                      name: item.product?.name || 'Product'
                    }))
                  };

                  const response = await orderService.createOrder(orderData);
                  
                  if (response.success || response.data) {
                    const orderId = response.data?.id || response.data?.order?.id;
                    navigate(`/waiting-payment?orderId=${orderId}`);
                  } else {
                    alert('Đặt hàng thất bại. Vui lòng thử lại.');
                  }
                } catch (error) {
                  console.error('Error creating order:', error);
                  alert('Đặt hàng thất bại. Vui lòng thử lại.');
                }
              }}
              disabled={checkoutItems.length === 0 || loading}
              className="w-full py-4 bg-primary text-black font-black rounded-2xl shadow-lg hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkoutItems.length === 0 ? 'Giỏ hàng trống' : 'ĐẶT HÀNG NGAY'}
            </button>
            <p className="text-[10px] text-slate-500 text-center mt-4">Bằng việc đặt hàng, bạn đồng ý với Điều khoản của TechStore.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
