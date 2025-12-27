import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Button from '@components/ui/Button';
import type { AdminOutletContext } from '@layouts/AdminLayout';
import { ReportsService } from '@/services/reportsService';
import type {
  SalesReportData,
  InventoryReportData,
  CustomerReportData,
  ShipperReportData,
  ReportsSummary,
  ReportFilters
} from '@/types';
import { useTranslation } from '../../hooks/useTranslation';

const AdminReports: React.FC = () => {
  const { getDateRangeLabel } = useOutletContext<AdminOutletContext>();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState<string | null>(null);

  // Report data
  const [reportsSummary, setReportsSummary] = useState<ReportsSummary | null>(null);
  const [salesReport, setSalesReport] = useState<SalesReportData | null>(null);
  const [inventoryReport, setInventoryReport] = useState<InventoryReportData | null>(null);
  const [customerReport, setCustomerReport] = useState<CustomerReportData | null>(null);
  const [shipperReport, setShipperReport] = useState<ShipperReportData | null>(null);

  // Filters
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const reportsService = ReportsService.getInstance();

  // Load reports summary
  useEffect(() => {
    const loadReportsSummary = async () => {
      try {
        const summary = await reportsService.getReportsSummary();
        setReportsSummary(summary);
      } catch (error) {
        console.error('Error loading reports summary:', error);
      }
    };

    loadReportsSummary();
  }, []);

  const handleGenerateReport = async (reportType: string) => {
    setLoading(true);
    setActiveReport(reportType);

    try {
      switch (reportType) {
        case 'sales':
          const salesData = await reportsService.getSalesReport(filters);
          setSalesReport(salesData);
          break;
        case 'inventory':
          const inventoryData = await reportsService.getInventoryReport();
          setInventoryReport(inventoryData);
          break;
        case 'customers':
          const customerData = await reportsService.getCustomerReport(filters);
          setCustomerReport(customerData);
          break;
        case 'shippers':
          const shipperData = await reportsService.getShipperReport(filters);
          setShipperReport(shipperData);
          break;
      }
    } catch (error) {
      console.error(`Error generating ${reportType} report:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (reportType: string, format: string = 'excel') => {
    try {
      let blob: Blob;

      switch (reportType) {
        case 'sales':
          blob = await reportsService.exportSalesReport(filters, format);
          break;
        case 'inventory':
          blob = await reportsService.exportInventoryReport(format);
          break;
        case 'customers':
          blob = await reportsService.exportCustomerReport(filters, format);
          break;
        default:
          throw new Error('Unsupported report type for export');
      }

      reportsService.downloadBlob(blob, reportsService.generateFilename(`${reportType}_report`));
    } catch (error) {
      console.error(`Error exporting ${reportType} report:`, error);
    }
  };

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Helper for currency
  const fmt = (num: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Báo cáo</h1>
          <p className="text-slate-400 text-sm mt-1">
            Xuất báo cáo chi tiết về kinh doanh và hoạt động
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-white mb-4">Thiết lập bộ lọc</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Ngày bắt đầu</label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full bg-background-dark border border-border-dark text-white text-sm rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Ngày kết thúc</label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full bg-background-dark border border-border-dark text-white text-sm rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Trạng thái đơn hàng</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full bg-background-dark border border-border-dark text-white text-sm rounded-lg px-3 py-2"
            >
              <option value="">Tất cả</option>
              <option value="pending">Đang chờ</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="processing">Đang xử lý</option>
              <option value="shipped">Đang giao</option>
              <option value="delivered">Đã giao</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Danh mục</label>
            <input
              type="text"
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              placeholder="Tên danh mục..."
              className="w-full bg-background-dark border border-border-dark text-white text-sm rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Available Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportsSummary?.availableReports.map((report) => {
          // Safely check if report data exists
          const hasReportData =
            (report.id === 'sales' && salesReport) ||
            (report.id === 'inventory' && inventoryReport) ||
            (report.id === 'customers' && customerReport) ||
            (report.id === 'shippers' && shipperReport);

          return (
            <div key={report.id} className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-sm group hover:border-primary/30 transition-all relative overflow-hidden cursor-pointer">
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:scale-110 group-hover:rotate-3 transition-all">
                    <span className="material-symbols-outlined">
                      {report.id === 'sales' ? 'analytics' :
                        report.id === 'inventory' ? 'inventory' :
                          report.id === 'customers' ? 'group' : 'local_shipping'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {report.exportFormats.includes('excel') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="download"
                        onClick={() => handleExportReport(report.id, 'excel')}
                        disabled={!hasReportData}
                        className="hover:bg-primary/10 transition-all hover:scale-110"
                      />
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">{report.name}</h3>
                <p className="text-sm text-slate-400 mb-4 group-hover:text-slate-300 transition-colors">{report.description}</p>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full group-hover:scale-105 transition-transform"
                  onClick={() => handleGenerateReport(report.id)}
                  loading={loading && activeReport === report.id}
                >
                  Tạo báo cáo
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Results */}
      {salesReport && (
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Báo cáo bán hàng</h3>
            <Button
              variant="outline"
              size="sm"
              icon="download"
              onClick={() => handleExportReport('sales', 'excel')}
            >
              Export Excel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-background-dark p-4 rounded-lg">
              <p className="text-slate-400 text-sm">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-white">{fmt(salesReport.totalRevenue)}</p>
            </div>
            <div className="bg-background-dark p-4 rounded-lg">
              <p className="text-slate-400 text-sm">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-white">{salesReport.totalOrders}</p>
            </div>
            <div className="bg-background-dark p-4 rounded-lg">
              <p className="text-slate-400 text-sm">Tổng khách hàng</p>
              <p className="text-2xl font-bold text-white">{salesReport.totalCustomers}</p>
            </div>
            <div className="bg-background-dark p-4 rounded-lg">
              <p className="text-slate-400 text-sm">Giá trị trung bình</p>
              <p className="text-2xl font-bold text-white">{fmt(salesReport.averageOrderValue)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-bold">Top sản phẩm bán chạy</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-slate-500 uppercase bg-background-dark/50">
                  <tr>
                    <th className="px-4 py-2">Sản phẩm</th>
                    <th className="px-4 py-2 text-center">Đã bán</th>
                    <th className="px-4 py-2 text-center">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {salesReport.topProducts.slice(0, 5).map((product, i) => (
                    <tr key={i} className="border-t border-border-dark">
                      <td className="px-4 py-2 text-white">{product.productName || product.name}</td>
                      <td className="px-4 py-2 text-center text-white">{product.totalSold || product.sold}</td>
                      <td className="px-4 py-2 text-center text-green-500">{fmt(product.totalRevenue || product.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {inventoryReport && (
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Báo cáo tồn kho</h3>
            <Button
              variant="outline"
              size="sm"
              icon="download"
              onClick={() => handleExportReport('inventory', 'excel')}
            >
              Export Excel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-background-dark p-4 rounded-lg">
              <p className="text-slate-400 text-sm">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-white">{inventoryReport.totalProducts}</p>
            </div>
            <div className="bg-background-dark p-4 rounded-lg">
              <p className="text-slate-400 text-sm">Sản phẩm hết hàng</p>
              <p className="text-2xl font-bold text-red-500">{inventoryReport.outOfStockProducts.length}</p>
            </div>
            <div className="bg-background-dark p-4 rounded-lg">
              <p className="text-slate-400 text-sm">Giá trị tồn kho</p>
              <p className="text-2xl font-bold text-white">{fmt(inventoryReport.inventoryValue)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-bold">Sản phẩm sắp hết hàng</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-slate-500 uppercase bg-background-dark/50">
                  <tr>
                    <th className="px-4 py-2">Sản phẩm</th>
                    <th className="px-4 py-2 text-center">Tồn kho</th>
                    <th className="px-4 py-2 text-center">Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryReport.lowStockProducts.slice(0, 5).map((product, i) => (
                    <tr key={i} className="border-t border-border-dark">
                      <td className="px-4 py-2 text-white">{product.productName || product.name}</td>
                      <td className="px-4 py-2 text-center text-yellow-500">{product.stockQuantity}</td>
                      <td className="px-4 py-2 text-center text-white">{fmt(product.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {customerReport && (
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Báo cáo khách hàng</h3>
            <Button
              variant="outline"
              size="sm"
              icon="download"
              onClick={() => handleExportReport('customers', 'excel')}
            >
              Export Excel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-background-dark p-4 rounded-lg">
              <p className="text-slate-400 text-sm">Tổng khách hàng</p>
              <p className="text-2xl font-bold text-white">{customerReport.totalCustomers}</p>
            </div>
            <div className="bg-background-dark p-4 rounded-lg">
              <p className="text-slate-400 text-sm">Khách hàng mới</p>
              <p className="text-2xl font-bold text-white">{customerReport.newCustomers}</p>
            </div>
            <div className="bg-background-dark p-4 rounded-lg">
              <p className="text-slate-400 text-sm">Tỷ lệ giữ chân</p>
              <p className="text-2xl font-bold text-white">{customerReport.customerRetentionRate.toFixed(1)}%</p>
            </div>
            <div className="bg-background-dark p-4 rounded-lg">
              <p className="text-slate-400 text-sm">Đơn hàng trung bình</p>
              <p className="text-2xl font-bold text-white">{customerReport.averageOrdersPerCustomer.toFixed(1)}</p>
            </div>
          </div>
        </div>
      )}

      {shipperReport && (
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Báo cáo shipper</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-background-dark p-4 rounded-lg">
              <p className="text-slate-400 text-sm">Tổng shipper</p>
              <p className="text-2xl font-bold text-white">{shipperReport.totalShippers}</p>
            </div>
            <div className="bg-background-dark p-4 rounded-lg">
              <p className="text-slate-400 text-sm">Shipper hoạt động</p>
              <p className="text-2xl font-bold text-white">{shipperReport.activeShippers.length}</p>
            </div>
            <div className="bg-background-dark p-4 rounded-lg">
              <p className="text-slate-400 text-sm">Tỷ lệ giao hàng</p>
              <p className="text-2xl font-bold text-white">{shipperReport.deliveryStats.averageDeliveryRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
