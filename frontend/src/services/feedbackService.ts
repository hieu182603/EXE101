import apiInterceptor from './apiInterceptor';

interface Feedback {
  id: string;
  content: string;
  createdAt: string;
  account: {
    id: string;
    username: string;
    name?: string;
  };
  product?: {
    id: string;
    name: string;
  };
  images?: {
    id: string;
    url: string;
  }[];
}

class FeedbackService {
  async getFeedbacksByProduct(productId: string): Promise<Feedback[]> {
    try {
      const response = await apiInterceptor.get(`/feedbacks/product/${productId}`);
      // Return the actual feedbacks array from response.data.data
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching feedbacks by product:', error);
      throw error;
    }
  }

  async getAllFeedbacks(): Promise<Feedback[]> {
    try {
      const response = await apiInterceptor.get('/feedbacks');
      // Handle different response structures
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching all feedbacks:', error);
      return [];
    }
  }

  async getFeedbacksPaginated(page: number = 1, pageSize: number = 10): Promise<{ feedbacks: Feedback[]; total: number; page: number; pageSize: number }> {
    try {
      const response = await apiInterceptor.get(`/feedbacks/paginated?page=${page}&pageSize=${pageSize}`);
      // Handle different response structures
      if (response.data?.data) {
        return {
          feedbacks: response.data.data.feedbacks || response.data.data || [],
          total: response.data.data.total || 0,
          page: response.data.data.page || page,
          pageSize: response.data.data.pageSize || pageSize
        };
      }
      if (Array.isArray(response.data)) {
        return {
          feedbacks: response.data,
          total: response.data.length,
          page,
          pageSize
        };
      }
      return { feedbacks: [], total: 0, page, pageSize };
    } catch (error) {
      console.error('Error fetching paginated feedbacks:', error);
      return { feedbacks: [], total: 0, page, pageSize };
    }
  }

  async deleteFeedback(id: string): Promise<boolean> {
    try {
      await apiInterceptor.delete(`/feedbacks/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting feedback:', error);
      return false;
    }
  }
}

export const feedbackService = new FeedbackService();
export type { Feedback }; 