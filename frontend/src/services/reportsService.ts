import type {
  SalesReportData,
  InventoryReportData,
  CustomerReportData,
  ShipperReportData,
  ReportsSummary,
  ReportFilters
} from '@/types';
import api from './apiInterceptor';

export class ReportsService {
  private static instance: ReportsService;

  static getInstance(): ReportsService {
    if (!ReportsService.instance) {
      ReportsService.instance = new ReportsService();
    }
    return ReportsService.instance;
  }

  async getReportsSummary(): Promise<ReportsSummary> {
    try {
      const response = await api.get('/reports/summary');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching reports summary:', error);
      throw error;
    }
  }

  async getSalesReport(filters: ReportFilters = {}): Promise<SalesReportData> {
    try {
      const params: any = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;

      const response = await api.get('/reports/sales', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching sales report:', error);
      throw error;
    }
  }

  async exportSalesReport(filters: ReportFilters = {}, format: string = 'excel'): Promise<Blob> {
    try {
      const params: any = { format };
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await api.get('/reports/sales/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting sales report:', error);
      throw error;
    }
  }

  async getInventoryReport(): Promise<InventoryReportData> {
    try {
      const response = await api.get('/reports/inventory');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching inventory report:', error);
      throw error;
    }
  }

  async exportInventoryReport(format: string = 'excel'): Promise<Blob> {
    try {
      const response = await api.get('/reports/inventory/export', {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting inventory report:', error);
      throw error;
    }
  }

  async getCustomerReport(filters: ReportFilters = {}): Promise<CustomerReportData> {
    try {
      const params: any = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await api.get('/reports/customers', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching customer report:', error);
      throw error;
    }
  }

  async exportCustomerReport(filters: ReportFilters = {}, format: string = 'excel'): Promise<Blob> {
    try {
      const params: any = { format };
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await api.get('/reports/customers/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting customer report:', error);
      throw error;
    }
  }

  async getShipperReport(filters: ReportFilters = {}): Promise<ShipperReportData> {
    try {
      const params: any = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.shipperId) params.shipperId = filters.shipperId;

      const response = await api.get('/reports/shippers', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching shipper report:', error);
      throw error;
    }
  }

  // Utility method to download blob as file
  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Helper method to generate filename with timestamp
  generateFilename(prefix: string, extension: string = 'xlsx'): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${prefix}_${timestamp}.${extension}`;
  }
}
