import api from './apiInterceptor';
import { AxiosError } from 'axios';

// Interfaces
export interface IShipper {
  id: string;
  name: string;
  phone: string;
}

export interface IOrder {
  id: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  customer?: ICustomer;
  shipper?: IShipper;
}

export interface ICustomer {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  role: {
    id: string;
    name: string;
    slug: string;
  };
  customerOrders?: IOrder[];
  createdAt: string;
  isRegistered: boolean;
}

export interface CreateCustomerDto {
  username: string;
  password: string;
  fullName: string;
  phone: string;
}

export interface UpdateCustomerDto {
  username?: string;
  password?: string;
  fullName?: string;
  phone?: string;
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export const customerService = {
  async getAllCustomers(): Promise<ApiResponse<ICustomer[]>> {
    try {
      const response = await api.get<ApiResponse<ICustomer[]>>('/customers');
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Get all customers error:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  async searchCustomers(searchTerm: string): Promise<ApiResponse<ICustomer[]>> {
    try {
      const response = await api.get<ApiResponse<ICustomer[]>>(`/customers/search?q=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Search customers error:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  async getCustomerById(id: string): Promise<ApiResponse<ICustomer>> {
    try {
      const response = await api.get<ApiResponse<ICustomer>>(`/customers/${id}`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Get customer by ID error:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  async createCustomer(customerData: CreateCustomerDto): Promise<ApiResponse<ICustomer>> {
    try {
      const response = await api.post<ApiResponse<ICustomer>>('/customers', customerData);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Create customer error:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  async updateCustomer(id: string, updateData: UpdateCustomerDto): Promise<ApiResponse<ICustomer>> {
    try {
      const response = await api.put<ApiResponse<ICustomer>>(`/customers/${id}`, updateData);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Update customer error:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  async deleteCustomer(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete<ApiResponse<void>>(`/customers/${id}`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Delete customer error:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  async importCustomers(formData: FormData): Promise<ApiResponse<void>> {
    try {
      const response = await api.post<ApiResponse<void>>('/customers/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Import customers error:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  async exportCustomers(): Promise<ApiResponse<Blob>> {
    try {
      const response = await api.get('/customers/export', {
        responseType: 'blob',
      });
      return {
        success: true,
        data: response.data,
        message: 'Export successful',
      };
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Export customers error:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  }
}; 