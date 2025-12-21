import api from './apiInterceptor';
import type {
  ApiResponse,
  IShipper,
  CreateShipperDto,
  UpdateShipperDto,
  ShippingStatistics,
  ShipperStatistics,
  ShippingConfiguration,
  AssignmentResult,
  AvailableZones,
  ApiError
} from './types';

export const shipperService = {
  
  async getAllShippers(): Promise<ApiResponse<IShipper[]>> {
    try {
      const response = await api.get<ApiResponse<IShipper[]>>('/shippers');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Get all shippers error:', apiError.response?.data?.message || apiError.message);
      throw error;
    }
  },

 
  async getAvailableShippers(): Promise<ApiResponse<IShipper[]>> {
    try {
      const response = await api.get<ApiResponse<IShipper[]>>('/shippers/available');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Get available shippers error:', apiError.response?.data?.message || apiError.message);
      throw error;
    }
  },

  
  async getShipperById(id: string): Promise<ApiResponse<IShipper>> {
    try {
      const response = await api.get<ApiResponse<IShipper>>(`/shippers/${id}`);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Get shipper by ID error:', apiError.response?.data?.message || apiError.message);
      throw error;
    }
  },

  async getShipperStatistics(id: string): Promise<ApiResponse<ShipperStatistics>> {
    try {
      const response = await api.get<ApiResponse<ShipperStatistics>>(`/shippers/${id}/statistics`);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Get shipper statistics error:', apiError.response?.data?.message || apiError.message);
      throw error;
    }
  },

  
  async createShipper(shipperData: CreateShipperDto): Promise<ApiResponse<IShipper>> {
    try {
      const response = await api.post<ApiResponse<IShipper>>('/shippers', shipperData);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Create shipper error:', apiError.response?.data?.message || apiError.message);
      throw error;
    }
  },

  
  async updateShipper(id: string, updateData: UpdateShipperDto): Promise<ApiResponse<IShipper>> {
    try {
      const response = await api.put<ApiResponse<IShipper>>(`/shippers/${id}`, updateData);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Update shipper error:', apiError.response?.data?.message || apiError.message);
      throw error;
    }
  },

  
  async deleteShipper(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete<ApiResponse<void>>(`/shippers/${id}`);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Delete shipper error:', apiError.response?.data?.message || apiError.message);
      throw error;
    }
  },

  async exportShippers(): Promise<ApiResponse<Blob>> {
    try {
      const response = await api.get('/shippers/export', {
        responseType: 'blob',
      });
      return {
        success: true,
        data: response.data,
        message: 'Export successful',
      };
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Export shippers error:', apiError.response?.data?.message || apiError.message);
      throw error;
    }
  },

  // New methods for automatic shipper assignment system
  async updateWorkingZone(shipperId: string, workingZones: string[]): Promise<ApiResponse<IShipper>> {
    try {
      const response = await api.put<ApiResponse<IShipper>>(`/api/order-assignment/working-zone/${shipperId}`, {
        workingZones
      });
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Update working zone error:', apiError.response?.data?.message || apiError.message);
      throw error;
    }
  },

  async updateAvailability(shipperId: string, isAvailable: boolean): Promise<ApiResponse<IShipper>> {
    try {
      const response = await api.put<ApiResponse<IShipper>>(`/shipping/shippers/${shipperId}/availability`, {
        isAvailable
      });
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Update availability error:', apiError.response?.data?.message || apiError.message);
      throw error;
    }
  },

  async updatePriority(shipperId: string, priority: number): Promise<ApiResponse<IShipper>> {
    try {
      const response = await api.put<ApiResponse<IShipper>>(`/shipping/shippers/${shipperId}/priority`, {
        priority
      });
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Update priority error:', apiError.response?.data?.message || apiError.message);
      throw error;
    }
  },

  async getShippingStatistics(): Promise<ApiResponse<ShippingStatistics>> {
    try {
      const response = await api.get<ApiResponse<ShippingStatistics>>('/shipping/statistics');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Get shipping statistics error:', apiError.response?.data?.message || apiError.message);
      throw error;
    }
  },

  async getShippingConfiguration(): Promise<ApiResponse<ShippingConfiguration>> {
    try {
      const response = await api.get<ApiResponse<ShippingConfiguration>>('/shipping/configuration');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Get shipping configuration error:', apiError.response?.data?.message || apiError.message);
      throw error;
    }
  },

  async triggerManualAssignment(): Promise<ApiResponse<AssignmentResult>> {
    try {
      const response = await api.post<ApiResponse<AssignmentResult>>('/shipping/auto-assign');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Trigger manual assignment error:', apiError.response?.data?.message || apiError.message);
      throw error;
    }
  },

  async resetDailyOrderCounts(): Promise<ApiResponse<AssignmentResult>> {
    try {
      const response = await api.post<ApiResponse<AssignmentResult>>('/shipping/reset-daily-counts');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Reset daily order counts error:', apiError.response?.data?.message || apiError.message);
      throw error;
    }
  },

  async getAvailableZones(): Promise<ApiResponse<AvailableZones>> {
    try {
      const response = await api.get<ApiResponse<AvailableZones>>('/api/order-assignment/available-zones');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Get available zones error:', apiError.response?.data?.message || apiError.message);
      throw error;
    }
  }
}; 