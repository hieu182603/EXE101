
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { orderService } from '@services/orderService';

const WaitingPayment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || searchParams.get('id');
  
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  // Load order details
  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await orderService.getOrderById(orderId);
        const orderData = response.data?.order || response.order || response.data;
        setOrder(orderData);
      } catch (error) {
        console.error('Error loading order:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handlePayment = () => {
    alert("Đang chuyển hướng đến cổng thanh toán VNPay...");
  };

  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center max-w-[1440px]">
      <div className="w-full max-w-[960px] grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="bg-surface-dark rounded-3xl border border-border-dark p-10 shadow-2xl relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
            
            <div className="size-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 text-primary animate-pulse">
              <span className="material-symbols-outlined text-[48px]">hourglass_top</span>
            </div>

            <h1 className="text-3xl font-black text-white mb-4 tracking-tight">Chờ Thanh Toán</h1>
            <p className="text-slate-400 text-lg max-w-md mx-auto mb-10">
              Đơn hàng <span className="text-primary font-bold">{orderId || order?.id || '#ORD-000000'}</span> của bạn đang được giữ. Vui lòng thanh toán trước khi thời gian kết thúc.
            </p>

            <div className="w-full max-w-sm mx-auto mb-12">
              <div className="flex gap-6">
                <div className="flex grow flex-col items-center gap-3">
                  <div className="flex h-20 w-full items-center justify-center rounded-2xl bg-background-dark border border-surface-accent shadow-inner">
                    <p className="text-4xl font-black text-primary">{minutes.toString().padStart(2, '0')}</p>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Phút</p>
                </div>
                <div className="text-3xl font-bold self-start mt-6 text-slate-700">:</div>
                <div className="flex grow flex-col items-center gap-3">
                  <div className="flex h-20 w-full items-center justify-center rounded-2xl bg-background-dark border border-surface-accent shadow-inner">
                    <p className="text-4xl font-black text-primary">{seconds.toString().padStart(2, '0')}</p>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Giây</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handlePayment}
              className="relative w-full py-5 bg-gradient-to-r from-primary to-primary-dark text-black font-black text-xl rounded-2xl shadow-[0_0_30px_rgba(19,203,236,0.3)] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 group"
            >
              <span>Chuyển đến cổng VNPay</span>
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
            
            <Link to="/cart" className="mt-8 inline-flex items-center gap-2 text-slate-500 hover:text-white transition-all font-bold">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Quay lại giỏ hàng
            </Link>
          </div>
          
          <div className="flex justify-center gap-10 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-default">
            <div className="h-10 w-20 bg-contain bg-no-repeat bg-center" style={{ backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg')` }}></div>
            <div className="h-10 w-20 bg-contain bg-no-repeat bg-center" style={{ backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg')` }}></div>
            <div className="h-10 w-24 bg-contain bg-no-repeat bg-center" style={{ backgroundImage: `url('https://vnpay.vn/wp-content/uploads/2020/07/vnpay-logo.png')` }}></div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-surface-dark rounded-3xl border border-border-dark p-8 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">receipt_long</span>
              Chi tiết đơn hàng
            </h3>
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-12 text-slate-500">
                  <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm">Đang tải thông tin đơn hàng...</p>
                </div>
              ) : order ? (
                <>
                  {/* Order Items */}
                  {(order.orderDetails || []).map((detail: any, index: number) => (
                    <div key={detail.id || index} className="flex gap-4 pb-4 border-b border-border-dark last:border-0">
                      <div className="size-16 rounded-xl bg-background-dark border border-border-dark flex items-center justify-center shrink-0 overflow-hidden">
                        <img 
                          src={detail.product?.images?.[0]?.url || detail.product?.url || 'https://picsum.photos/200/200'} 
                          alt={detail.product?.name || 'Product'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-sm mb-1">{detail.product?.name || 'Product'}</h4>
                        <p className="text-xs text-slate-400 mb-2">Số lượng: {detail.quantity}</p>
                        <p className="text-sm font-bold text-primary">{detail.price?.toLocaleString('vi-VN')}₫</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Order Summary */}
                  <div className="pt-4 border-t border-border-dark space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Tạm tính</span>
                      <span className="text-white font-medium">{(order.totalAmount || 0).toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Phí vận chuyển</span>
                      <span className="text-white font-medium">Miễn phí</span>
                    </div>
                    <div className="flex justify-between text-lg pt-3 border-t border-border-dark">
                      <span className="font-bold text-white">Tổng cộng</span>
                      <span className="font-black text-primary">{(order.totalAmount || 0).toLocaleString('vi-VN')}₫</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <span className="material-symbols-outlined text-4xl mb-2 block">receipt_long</span>
                  <p className="text-sm">Không tìm thấy thông tin đơn hàng</p>
                </div>
              )}
            </div>
          </div>

          <div 
            onClick={handlePayment}
            className="bg-[#1a2c30] rounded-3xl border border-border-dark p-6 flex items-center gap-6 group hover:border-primary/40 transition-all cursor-pointer"
          >
            <div className="bg-white p-2 rounded-xl shrink-0">
               <span className="material-symbols-outlined text-black text-4xl">qr_code_2</span>
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Thanh toán nhanh qua QR</h4>
              <p className="text-xs text-slate-400">Quét mã bằng ứng dụng Ngân hàng hoặc Ví điện tử.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingPayment;
