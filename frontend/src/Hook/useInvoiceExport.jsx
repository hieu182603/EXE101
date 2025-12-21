import { useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../services/apiInterceptor';

export const useInvoiceExport = () => {
  const companyInfo = {
    name: 'Cửa hàng công nghệ TechStore',
    address: 'Đại học FPT,Thạch Thất , Thành phố Hà Nội',
    phone: '(024) 1234 5678',
    email: 'info@techstore.com'
  };

  const generateInvoiceNumber = useCallback(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `HD${year}${month}${day}${random}`;
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const exportToPDF = useCallback(async (order) => {
    try {
      // Show loading notification
      const loadingDiv = document.createElement('div');
      loadingDiv.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #3B82F6; color: white; padding: 12px 20px; border-radius: 8px; z-index: 9999; font-family: Arial, sans-serif;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 16px; height: 16px; border: 2px solid #ffffff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            Đang tạo hóa đơn...
          </div>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;
      document.body.appendChild(loadingDiv);

      // Get invoice info from order or create if not exists
      const invoice = order.invoices && order.invoices.length > 0 ? order.invoices[0] : null;
      const invoiceNumber = invoice?.invoiceNumber || generateInvoiceNumber();
      const invoiceDate = invoice?.createdAt || new Date().toISOString();
      const paymentMethod = order.paymentMethod || 'Cash on delivery';

      // Calculate totals
      const orderDetails = order.orderDetails || [];
      const subtotal = orderDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Calculate VAT if required
      const vatAmount = order.requireInvoice ? subtotal * 0.1 : 0;
      const total = subtotal + vatAmount;

      // Create invoice HTML content
      const invoiceHTML = `
        <div style="background: white; padding: 40px; max-width: 800px; margin: 0 auto; font-family: 'Arial', sans-serif; line-height: 1.6; color: #333;">
          <!-- Header -->
          <div style="border-bottom: 3px solid #3B82F6; padding-bottom: 20px; margin-bottom: 30px; position: relative;">
            <h1 style="color:rgb(246, 59, 59); font-size: 32px; margin: 0 0 10px 0; font-weight: bold;">HÓA ĐƠN BÁN HÀNG</h1>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">Số hóa đơn: <strong>${invoiceNumber}</strong></p>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">Ngày xuất: <strong>${formatDate(invoiceDate)}</strong></p>
            
            <div style="position: absolute; top: 0; right: 0; text-align: right;">
              <h2 style="font-size: 18px; margin: 0 0 8px 0; color: #333;">${companyInfo.name}</h2>
              <p style="margin: 3px 0; color: #666; font-size: 13px;">${companyInfo.address}</p>
              <p style="margin: 3px 0; color: #666; font-size: 13px;">Điện thoại: ${companyInfo.phone}</p>
              <p style="margin: 3px 0; color: #666; font-size: 13px;">Email: ${companyInfo.email}</p>
            </div>
          </div>

          <!-- Order & Customer Info -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div style="width: 48%;">
              <h3 style="font-size: 16px; margin-bottom: 15px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px;">📋 Thông tin đơn hàng</h3>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Mã đơn hàng:</strong> #${order.id}</p>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Ngày đặt:</strong> ${formatDate(order.orderDate)}</p>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Trạng thái:</strong> ${order.status}</p>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Phương thức thanh toán:</strong> ${paymentMethod}</p>
            </div>
            <div style="width: 48%;">
              <h3 style="font-size: 16px; margin-bottom: 15px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px;">👤 Thông tin khách hàng</h3>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Tên khách hàng:</strong> ${order.customer?.name || 'N/A'}</p>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Mã khách hàng:</strong> ${order.customer?.id || 'N/A'}</p>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Địa chỉ giao hàng:</strong> ${order.shippingAddress}</p>
            </div>
          </div>

          <!-- Products Table -->
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 16px; margin-bottom: 15px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px;">🛍️ Chi tiết sản phẩm</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: left; font-weight: bold;">STT</th>
                  <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: left; font-weight: bold;">Tên sản phẩm</th>
                  <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: left; font-weight: bold;">Loại</th>
                  <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: center; font-weight: bold;">Số lượng</th>
                  <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: right; font-weight: bold;">Đơn giá</th>
                  <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: right; font-weight: bold;">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${orderDetails.map((item, index) => `
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 10px 8px;">${index + 1}</td>
                    <td style="border: 1px solid #ddd; padding: 10px 8px; font-weight: 500;">${item.product?.name || 'Unknown Product'}</td>
                    <td style="border: 1px solid #ddd; padding: 10px 8px;">${item.product?.category?.name || 'No Category'}</td>
                    <td style="border: 1px solid #ddd; padding: 10px 8px; text-align: center;">${item.quantity}</td>
                    <td style="border: 1px solid #ddd; padding: 10px 8px; text-align: right;">${formatPrice(item.price)}</td>
                    <td style="border: 1px solid #ddd; padding: 10px 8px; text-align: right; font-weight: 500;">${formatPrice(item.price * item.quantity)}</td>
                  </tr>
                `).join('')}
                
                <!-- Subtotal row -->
                <tr style="background-color: #f8f9fa;">
                  <td style="border: 1px solid #ddd; padding: 10px 8px;">&nbsp;</td>
                  <td style="border: 1px solid #ddd; padding: 10px 8px;">&nbsp;</td>
                  <td style="border: 1px solid #ddd; padding: 10px 8px;">&nbsp;</td>
                  <td style="border: 1px solid #ddd; padding: 10px 8px;">&nbsp;</td>
                  <td style="border: 1px solid #ddd; padding: 10px 8px; text-align: right; font-weight: bold;">Tạm tính:</td>
                  <td style="border: 1px solid #ddd; padding: 10px 8px; text-align: right; font-weight: bold;">${formatPrice(subtotal)}</td>
                </tr>
                
                ${order.requireInvoice ? `
                <!-- VAT row -->
                <tr style="background-color: #f8f9fa;">
                  <td style="border: 1px solid #ddd; padding: 10px 8px;">&nbsp;</td>
                  <td style="border: 1px solid #ddd; padding: 10px 8px;">&nbsp;</td>
                  <td style="border: 1px solid #ddd; padding: 10px 8px;">&nbsp;</td>
                  <td style="border: 1px solid #ddd; padding: 10px 8px;">&nbsp;</td>
                  <td style="border: 1px solid #ddd; padding: 10px 8px; text-align: right; font-weight: bold;">VAT (10%):</td>
                  <td style="border: 1px solid #ddd; padding: 10px 8px; text-align: right; font-weight: bold;">${formatPrice(vatAmount)}</td>
                </tr>
                ` : ''}
                
                <!-- Total row -->
                <tr style="background-color: #f8f9fa; border-top: 2px solid #3B82F6;">
                  <td style="border: 1px solid #ddd; padding: 12px 8px;">&nbsp;</td>
                  <td style="border: 1px solid #ddd; padding: 12px 8px;">&nbsp;</td>
                  <td style="border: 1px solid #ddd; padding: 12px 8px;">&nbsp;</td>
                  <td style="border: 1px solid #ddd; padding: 12px 8px;">&nbsp;</td>
                  <td style="border: 1px solid #ddd; padding: 12px 8px; text-align: right; font-weight: bold; font-size: 16px;">TỔNG CỘNG:</td>
                  <td style="border: 1px solid #ddd; padding: 12px 8px; text-align: right; font-weight: bold; font-size: 16px; color: #DC2626;">${formatPrice(total)}</td>
                </tr>
              </tbody>
            </table>
          </div>



          <!-- Footer -->
          <div style="border-top: 1px solid #ddd; padding-top: 30px; margin-top: 30px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
              <div style="width: 48%; text-align: center;">
                <p style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">Người bán hàng</p>
                <p style="color: #666; font-size: 12px;">(Ký tên và đóng dấu)</p>
                <div style="height: 60px;"></div>
              </div>
              <div style="width: 48%; text-align: center;">
                <p style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">Khách hàng</p>
                <p style="color: #666; font-size: 12px;">(Ký tên xác nhận)</p>
                <div style="height: 60px;"></div>
              </div>
            </div>
            <div style="text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 15px;">
              <p style="margin: 5px 0;">❤️Cảm ơn quý khách đã mua hàng!</p>
              <p style="margin: 5px 0;">Hóa đơn này được tạo tự động bởi hệ thống vào ${formatDate(new Date().toISOString())}</p>
            </div>
          </div>
        </div>
      `;

      // Create a temporary div to render the invoice
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = invoiceHTML;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      document.body.appendChild(tempDiv);

      // Convert to canvas and then to PDF
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      pdf.save(`Invoice_${order.id}_${invoiceNumber}.pdf`);

      // Remove loading notification
      if (loadingDiv.parentNode) {
        loadingDiv.parentNode.removeChild(loadingDiv);
      }

      // Try to create/update invoice in database
      try {
        const response = await api.post('/invoices/create', {
          orderId: order.id,
          paymentMethod: paymentMethod
        });
        
        if (response.data.success) {
          console.log('✅ Invoice saved to database successfully');
        } else {
          console.warn('⚠️ Failed to save invoice to database:', response.data.message);
        }
      } catch (dbError) {
        console.warn('⚠️ Error saving invoice to database:', dbError);
        // Don't throw - PDF export already succeeded
      }

      // Show success notification
      const successDiv = document.createElement('div');
      successDiv.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #059669; color: white; padding: 12px 20px; border-radius: 8px; z-index: 9999; font-family: Arial, sans-serif;">
          ✅ Hóa đơn đã được xuất thành công!
        </div>
      `;
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        if (successDiv.parentNode) {
          successDiv.parentNode.removeChild(successDiv);
        }
      }, 3000);

    } catch (error) {
      console.error('Lỗi khi xuất hóa đơn:', error);

      // Remove loading if exists
      const loadingDivs = document.querySelectorAll('[style*="Đang tạo hóa đơn"]');
      loadingDivs.forEach(div => {
        const parent = div.parentElement;
        if (parent && document.body.contains(parent)) {
          document.body.removeChild(parent);
        }
      });

      // Show error notification
      const errorDiv = document.createElement('div');
      errorDiv.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #DC2626; color: white; padding: 12px 20px; border-radius: 8px; z-index: 9999; font-family: Arial, sans-serif;">
          ❌ Có lỗi xảy ra khi tạo hóa đơn. Vui lòng thử lại!
        </div>
      `;
      document.body.appendChild(errorDiv);

      setTimeout(() => {
        if (document.body.contains(errorDiv)) {
          document.body.removeChild(errorDiv);
        }
      }, 3000);
    }
  }, [companyInfo, generateInvoiceNumber, formatPrice, formatDate]);

  return { exportToPDF };
}; 