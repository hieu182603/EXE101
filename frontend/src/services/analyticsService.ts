import type {
  OrderAnalytics,
  OrderStatusTrends,
  ProductPerformance,
  ProductSalesTrends,
  CustomerGrowth,
  TopCustomer,
  ShipperPerformance,
  ShipperDeliveryTrends
} from '@/types';
import api from './apiInterceptor';

export class AnalyticsService {
  private static instance: AnalyticsService;

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Order Analytics
  async getOrderAnalytics(
    startDate: string,
    endDate: string,
    period: 'day' | 'month' | 'year' = 'month'
  ): Promise<OrderAnalytics> {
    try {
      const response = await api.get('/orders/analytics/trends', {
        params: { startDate, endDate, period }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching order analytics:', error);
      throw error;
    }
  }

  async getOrderStatusTrends(
    startDate: string,
    endDate: string
  ): Promise<OrderStatusTrends[]> {
    try {
      const response = await api.get('/orders/analytics/status-trends', {
        params: { startDate, endDate }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching order status trends:', error);
      throw error;
    }
  }

  // Product Analytics
  async getProductPerformance(
    startDate: string,
    endDate: string,
    limit: number = 10
  ): Promise<ProductPerformance[]> {
    try {
      const response = await api.get('/products/analytics/performance', {
        params: { startDate, endDate, limit }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching product performance:', error);
      throw error;
    }
  }

  async getProductSalesTrends(
    startDate: string,
    endDate: string,
    period: 'day' | 'month' | 'year' = 'month'
  ): Promise<ProductSalesTrends[]> {
    try {
      const response = await api.get('/products/analytics/sales-trends', {
        params: { startDate, endDate, period }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching product sales trends:', error);
      throw error;
    }
  }

  // Customer Analytics
  async getCustomerGrowth(
    startDate: string,
    endDate: string,
    period: 'day' | 'month' | 'year' = 'month'
  ): Promise<CustomerGrowth[]> {
    try {
      const response = await api.get('/customers/analytics/growth', {
        params: { startDate, endDate, period }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching customer growth:', error);
      throw error;
    }
  }

  async getTopCustomersBySpending(
    startDate: string,
    endDate: string,
    limit: number = 10
  ): Promise<TopCustomer[]> {
    try {
      const response = await api.get('/customers/analytics/top-spenders', {
        params: { startDate, endDate, limit }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching top customers:', error);
      throw error;
    }
  }

  // Shipper Analytics
  async getShipperPerformance(
    startDate: string,
    endDate: string,
    limit: number = 10
  ): Promise<ShipperPerformance[]> {
    try {
      const response = await api.get('/shippers/analytics/performance', {
        params: { startDate, endDate, limit }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching shipper performance:', error);
      throw error;
    }
  }

  async getShipperDeliveryTrends(
    startDate: string,
    endDate: string,
    period: 'day' | 'month' | 'year' = 'month'
  ): Promise<ShipperDeliveryTrends[]> {
    try {
      const response = await api.get('/shippers/analytics/delivery-trends', {
        params: { startDate, endDate, period }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching shipper delivery trends:', error);
      throw error;
    }
  }
}
