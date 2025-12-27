import type { DashboardStats, RevenueStats } from '@/types';
import api from './apiInterceptor';

export class DashboardService {
  private static instance: DashboardService;

  static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.get('/orders/dashboard/stats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  async getRevenueStats(
    startDate: string,
    endDate: string,
    period: 'day' | 'month' | 'year' = 'month'
  ): Promise<RevenueStats> {
    try {
      const response = await api.get('/orders/analytics/trends', {
        params: { startDate, endDate, period }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
      throw error;
    }
  }
}
