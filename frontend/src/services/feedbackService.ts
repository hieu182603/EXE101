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
}

export const feedbackService = new FeedbackService();
export type { Feedback }; 