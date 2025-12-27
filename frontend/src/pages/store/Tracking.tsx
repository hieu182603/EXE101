
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Button from '@components/ui/Button';
import { orderService } from '@services/orderService';
import { OrderStatus } from '@/types/order';

const TrackingPage: React.FC = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [steps, setSteps] = useState<Array<{ status: 'completed' | 'current' | 'pending'; title: string; date: string; desc: string }>>([]);
  const [shipperInfo, setShipperInfo] = useState<{ name: string; phone: string; company: string; code: string } | null>(null);

  // Generate timeline steps from order status
  const generateSteps = (orderData: any) => {
    const orderDate = new Date(orderData.orderDate);
    const status = orderData.status;

    const allSteps = [
      {
        status: OrderStatus.PENDING,
        title: 'Đơn hàng đã được đặt',
        desc: 'Đơn hàng của bạn đã được tiếp nhận và đang chờ xử lý'
      },
      {
        status: OrderStatus.ASSIGNED,
        title: 'Đã phân công shipper',
        desc: 'Đơn hàng đã được phân công cho shipper và đang chuẩn bị'
      },
      {
        status: OrderStatus.CONFIRMED,
        title: 'Đã xác nhận',
        desc: 'Shipper đã xác nhận nhận đơn hàng'
      },
      {
        status: OrderStatus.SHIPPING,
        title: 'Đang giao hàng',
        desc: 'Shipper đang trên đường giao hàng đến bạn'
      },
      {
        status: OrderStatus.DELIVERED,
        title: 'Đã giao hàng thành công',
        desc: 'Đơn hàng đã được giao thành công'
      }
    ];

    const statusOrder = [
      OrderStatus.PENDING,
      OrderStatus.ASSIGNED,
      OrderStatus.CONFIRMED,
      OrderStatus.SHIPPING,
      OrderStatus.DELIVERED
    ];

    const currentIndex = statusOrder.indexOf(status);
    const isCancelled = status === OrderStatus.CANCELLED;

    return allSteps.map((step, index) => {
      let stepStatus: 'completed' | 'current' | 'pending';

      if (isCancelled) {
        stepStatus = index === 0 ? 'completed' : 'pending';
      } else {
        if (index < currentIndex) {
          stepStatus = 'completed';
        } else if (index === currentIndex) {
          stepStatus = 'current';
        } else {
          stepStatus = 'pending';
        }
      }

      return {
        status: stepStatus,
        title: step.title,
        date: index <= currentIndex ? orderDate.toLocaleDateString('vi-VN') : '',
        desc: step.desc
      };
    });
  };

  // Load order data
  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await orderService.getOrderById(id);
        const orderData = response.data?.order || response.order || response.data;

        if (orderData) {
          setOrder(orderData);

          // Generate timeline steps
          const timelineSteps = generateSteps(orderData);
          setSteps(timelineSteps);

          // Set shipper info if available
          if (orderData.shipper) {
            setShipperInfo({
              name: orderData.shipper.name || orderData.shipper.username || 'N/A',
              phone: orderData.shipper.phone || 'N/A',
              company: 'TechStore Shipping',
              code: orderData.id.substring(0, 8).toUpperCase()
            });
          }
        }
      } catch (error) {
        console.error('Error loading order:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-[1000px]">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-[1000px]">
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-slate-600 mb-4 block">inventory_2</span>
          <h2 className="text-2xl font-bold text-white mb-2">Không tìm thấy đơn hàng</h2>
          <p className="text-slate-400 mb-6">Đơn hàng bạn đang tìm không tồn tại.</p>
          <Link to="/history">
            <Button>Quay lại lịch sử đơn hàng</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-[1000px]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/history" className="size-10 rounded-xl bg-surface-dark border border-border-dark flex items-center justify-center text-slate-400 hover:text-white hover:border-white transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Theo dõi đơn hàng</h1>
          <p className="text-slate-400 text-sm">Mã đơn hàng: <span className="text-primary font-bold">{id || order.id}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Tracking Timeline */}
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Bar */}
          <div className="bg-surface-dark border border-border-dark rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-[200px] text-white">local_shipping</span>
            </div>

            <div className="relative z-10">
              <div className="space-y-8">
                {steps.map((step, index) => (
                  <div key={index} className="relative flex gap-6 group">
                    {/* Line connector */}
                    {index !== steps.length - 1 && (
                      <div className={`absolute left-[19px] top-10 bottom-[-32px] w-0.5 ${step.status === 'completed' ? 'bg-primary' : 'bg-border-dark'}`}></div>
                    )}

                    {/* Icon */}
                    <div className={`size-10 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${step.status === 'completed' ? 'bg-primary border-primary text-white' :
                        step.status === 'current' ? 'bg-primary/20 border-primary text-primary animate-pulse' :
                          'bg-background-dark border-border-dark text-slate-600'
                      }`}>
                      <span className="material-symbols-outlined text-[20px]">
                        {step.status === 'completed' ? 'check' : step.status === 'current' ? 'local_shipping' : 'circle'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="pt-1">
                      <h4 className={`font-bold text-sm ${step.status === 'pending' ? 'text-slate-500' : 'text-white'}`}>{step.title}</h4>
                      <p className="text-[11px] text-slate-500 font-bold mb-1">{step.date}</p>
                      <p className="text-sm text-slate-400">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info */}
        <div className="space-y-6">

          {/* Shipper Info */}
          <div className="bg-surface-dark border border-border-dark rounded-3xl p-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person_pin</span>
              Thông tin vận chuyển
            </h3>

            {shipperInfo ? (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="size-12 rounded-full bg-background-dark border border-border-dark flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400">local_shipping</span>
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{shipperInfo.company}</p>
                    <p className="text-xs text-slate-500 font-mono">{shipperInfo.code}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-border-dark">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Shipper</span>
                    <span className="text-sm font-bold text-white">{shipperInfo.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Liên hệ</span>
                    <span className="text-sm font-bold text-white">{shipperInfo.phone}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <span className="material-symbols-outlined text-3xl mb-2 block">local_shipping</span>
                <p className="text-sm">Chưa có thông tin shipper</p>
              </div>
            )}

            <div className="mt-6 flex gap-2">
              <Button className="flex-1" size="sm" variant="secondary" icon="call">Gọi ngay</Button>
              <Button className="flex-1" size="sm" variant="outline" icon="chat">Chat</Button>
            </div>
          </div>

          {/* Need Help */}
          <div className="bg-[#1a2c30] border border-border-dark rounded-3xl p-6 text-center">
            <div className="size-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
              <span className="material-symbols-outlined">support_agent</span>
            </div>
            <h4 className="font-bold text-white text-sm mb-2">Cần hỗ trợ?</h4>
            <p className="text-xs text-slate-400 mb-4">Nếu đơn hàng của bạn gặp vấn đề, hãy liên hệ với chúng tôi.</p>
            <Button variant="ghost" className="text-white hover:bg-white/10 w-full">Gửi yêu cầu hỗ trợ</Button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
