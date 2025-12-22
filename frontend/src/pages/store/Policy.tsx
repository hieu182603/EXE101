
import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const PolicyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'warranty';

  const content = useMemo(() => {
    switch (type) {
      case 'warranty':
        return {
          title: 'Chính sách bảo hành',
          icon: 'verified_user',
          text: `
            1. Điều kiện bảo hành:
            - Sản phẩm còn trong thời hạn bảo hành.
            - Tem bảo hành còn nguyên vẹn, không bị rách, tẩy xóa.
            - Hư hỏng do lỗi kỹ thuật từ nhà sản xuất.
            
            2. Từ chối bảo hành:
            - Sản phẩm bị hư hỏng do tác động vật lý (rơi vỡ, va đập).
            - Sản phẩm bị vào nước, ẩm mốc, côn trùng xâm nhập.
            - Tự ý tháo lắp, sửa chữa không bởi kỹ thuật viên của TechStore.
            
            3. Thời gian xử lý:
            - Từ 3-7 ngày làm việc (không tính T7, CN).
            - Đối với sản phẩm phải gửi về hãng, thời gian có thể kéo dài 14-21 ngày.
          `
        };
      case 'shipping':
        return {
          title: 'Vận chuyển & Giao nhận',
          icon: 'local_shipping',
          text: `
            1. Phạm vi giao hàng:
            - Giao hàng toàn quốc.
            - Miễn phí vận chuyển cho đơn hàng từ 2.000.000đ.
            
            2. Thời gian giao hàng:
            - Nội thành TP.HCM & Hà Nội: 1-2 ngày.
            - Các tỉnh thành khác: 3-5 ngày.
            
            3. Đồng kiểm:
            - Khách hàng được phép kiểm tra ngoại quan sản phẩm trước khi nhận.
            - Vui lòng quay video mở hộp để làm bằng chứng nếu có khiếu nại.
          `
        };
      case 'payment':
        return {
          title: 'Chính sách thanh toán',
          icon: 'payments',
          text: `
            TechStore hỗ trợ các phương thức thanh toán sau:
            
            1. Tiền mặt (COD):
            - Thanh toán trực tiếp cho shipper khi nhận hàng.
            
            2. Chuyển khoản ngân hàng:
            - Quét mã QR Code qua ứng dụng ngân hàng.
            
            3. Thẻ ATM / Thẻ tín dụng:
            - Hỗ trợ thẻ Visa, Mastercard, JCB.
            - Hỗ trợ trả góp 0% qua thẻ tín dụng.
            
            4. Ví điện tử:
            - Momo, VNPay, ZaloPay.
          `
        };
      case 'privacy':
        return {
          title: 'Bảo mật thông tin',
          icon: 'lock',
          text: `
            Cam kết bảo mật thông tin khách hàng:
            
            1. Thu thập thông tin:
            - Chúng tôi chỉ thu thập thông tin cần thiết để xử lý đơn hàng (Tên, SĐT, Địa chỉ).
            
            2. Sử dụng thông tin:
            - Giao hàng, liên hệ xác nhận đơn hàng, gửi thông tin khuyến mãi (nếu khách hàng đồng ý).
            
            3. Chia sẻ thông tin:
            - Không chia sẻ thông tin khách hàng cho bên thứ ba, ngoại trừ đơn vị vận chuyển.
            
            4. Bảo mật:
            - Dữ liệu được mã hóa và lưu trữ an toàn trên hệ thống máy chủ bảo mật.
          `
        };
      case 'cookies':
        return {
            title: 'Chính sách Cookies',
            icon: 'cookie',
            text: `
            Website TechStore sử dụng Cookies để nâng cao trải nghiệm người dùng.
            
            1. Cookies là gì?
            - Là các tệp nhỏ được lưu trên thiết bị của bạn khi truy cập website.
            
            2. Mục đích sử dụng:
            - Ghi nhớ trạng thái đăng nhập.
            - Lưu giỏ hàng tạm thời.
            - Phân tích lưu lượng truy cập để cải thiện dịch vụ.
            
            3. Quản lý Cookies:
            - Bạn có thể tắt Cookies trong cài đặt trình duyệt, tuy nhiên một số tính năng của website có thể không hoạt động.
            `
        };
      default: // terms and others
        return {
          title: 'Điều khoản sử dụng',
          icon: 'gavel',
          text: `
            Chào mừng bạn đến với TechStore. Khi truy cập website, bạn đồng ý với các điều khoản sau:
            
            1. Tài khoản:
            - Bạn chịu trách nhiệm bảo mật thông tin tài khoản và mật khẩu.
            
            2. Đặt hàng:
            - TechStore có quyền từ chối hoặc hủy đơn hàng nếu phát hiện gian lận hoặc sai sót về giá.
            
            3. Nội dung:
            - Mọi hình ảnh, nội dung trên website thuộc bản quyền của TechStore. Nghiêm cấm sao chép dưới mọi hình thức.
          `
        };
    }
  }, [type]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-[1000px]">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="md:w-64 flex-shrink-0">
          <div className="bg-surface-dark border border-border-dark rounded-2xl p-4 sticky top-24">
            <h3 className="font-bold text-white mb-4 px-2 uppercase text-xs tracking-widest">Danh mục hỗ trợ</h3>
            <ul className="space-y-1">
              {[
                { id: 'warranty', label: 'Chính sách bảo hành', icon: 'verified_user' },
                { id: 'shipping', label: 'Vận chuyển & Giao nhận', icon: 'local_shipping' },
                { id: 'payment', label: 'Thanh toán', icon: 'payments' },
                { id: 'privacy', label: 'Bảo mật thông tin', icon: 'lock' },
                { id: 'terms', label: 'Điều khoản sử dụng', icon: 'gavel' },
              ].map((item) => (
                <li key={item.id}>
                  <Link 
                    to={`/policy?type=${item.id}`}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      type === item.id 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-surface-dark border border-border-dark rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
             {/* Decorative Background */}
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[300px] text-white">{content.icon}</span>
             </div>

             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                   <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <span className="material-symbols-outlined text-4xl">{content.icon}</span>
                   </div>
                   <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{content.title}</h1>
                </div>
                
                <div className="prose prose-invert prose-lg max-w-none">
                  <div className="text-slate-300 whitespace-pre-line leading-relaxed text-base">
                    {content.text}
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border-dark flex justify-between items-center">
                   <p className="text-xs text-slate-500 italic">Cập nhật lần cuối: 01/01/2024</p>
                   <Link to="/">
                     <button className="px-6 py-2 rounded-xl bg-white/5 border border-border-dark text-white font-bold text-sm hover:bg-white/10 transition-all">
                       Trở về trang chủ
                     </button>
                   </Link>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PolicyPage;
