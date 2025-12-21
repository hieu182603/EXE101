import api from './apiInterceptor';

export interface CartItem {
    id: string;
    quantity: number;
    product: {
        id: string;
        name: string;
        slug: string;
        price: number;
        url?: string;
        stock: number;
        category?: string;
        isActive: boolean;
        images?: Array<{
            id: string;
            url: string;
            alt?: string;
        }>;
    };
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message: string;
    error?: string;
}



interface Cart {
    id: string;
    totalAmount: number;
    cartItems: CartItem[];
    account: {
        id: string;
        username: string;
    };
}



export const cartService = {


    async addToCart(productId: string, quantity: number): Promise<ApiResponse<Cart>> {
        
        try {
            const response = await api.post('/cart/add', { 
                productId: productId, 
                quantity 
            });
    
            
            // Validate backend response structure
            if (!response.data || typeof response.data.success !== 'boolean') {
                throw new Error('Invalid response format from backend');
            }
            
            return response.data;
        } catch (error: unknown) {
            const axiosError = error as { response?: { status?: number; data?: ApiResponse<Cart> }; message?: string };
            console.error('❌ Add to cart failed:', {
                error,
                status: axiosError.response?.status,
                backendMessage: axiosError.response?.data?.message,
                backendError: axiosError.response?.data?.error
            });
            
            // Re-throw with backend error message if available
            if (axiosError.response?.data?.message) {
                const backendError = new Error(axiosError.response.data.message);
                (backendError as any).response = axiosError.response;
                throw backendError;
            }
            
            throw error;
        }
    },

    async viewCart(): Promise<ApiResponse<Cart>> {
        try {
            const response = await api.get('/cart/view');
            
            // Validate backend response structure
            if (!response.data || typeof response.data.success !== 'boolean') {
                throw new Error('Invalid response format from backend');
            }
            
            return response.data;
        } catch (error: unknown) {
            const axiosError = error as { response?: { status?: number; statusText?: string; data?: ApiResponse<Cart> }; message?: string; config?: { headers?: { Authorization?: string } } };
            console.error('❌ View cart failed:', {
                error,
                status: axiosError.response?.status,
                statusText: axiosError.response?.statusText,
                backendMessage: axiosError.response?.data?.message,
                backendError: axiosError.response?.data?.error,
                hasAuthHeader: !!axiosError.config?.headers?.Authorization
            });
            
            // Re-throw with backend error message if available
            if (axiosError.response?.data?.message) {
                const backendError = new Error(axiosError.response.data.message);
                (backendError as any).response = axiosError.response;
                throw backendError;
            }
            
            throw error;
        }
    },

    async increaseQuantity(productId: string, amount: number = 1): Promise<ApiResponse<Cart>> {
        try {
            const response = await api.post('/cart/increase', {
                productId: productId,
                amount: amount
            });

            
            if (!response.data || typeof response.data.success !== 'boolean') {
                throw new Error('Invalid response format from backend');
            }
            
            return response.data;
        } catch (error: unknown) {
            const axiosError = error as { response?: { status?: number; data?: ApiResponse<Cart> }; message?: string };
            console.error('❌ Increase quantity failed:', {
                error,
                status: axiosError.response?.status,
                backendMessage: axiosError.response?.data?.message,
                backendError: axiosError.response?.data?.error
            });
            
            if (axiosError.response?.data?.message) {
                const backendError = new Error(axiosError.response.data.message);
                (backendError as any).response = axiosError.response;
                throw backendError;
            }
            
            throw error;
        }
    },

    async decreaseQuantity(productId: string, amount: number = 1): Promise<ApiResponse<Cart>> {
        try {
            const response = await api.post('/cart/decrease', {
                productId: productId,
                amount: amount
            });

            
            if (!response.data || typeof response.data.success !== 'boolean') {
                throw new Error('Invalid response format from backend');
            }
            
            return response.data;
        } catch (error: unknown) {
            const axiosError = error as { response?: { status?: number; data?: ApiResponse<Cart> }; message?: string };
            console.error('❌ Decrease quantity failed:', {
                error,
                status: axiosError.response?.status,
                backendMessage: axiosError.response?.data?.message,
                backendError: axiosError.response?.data?.error
            });
            
            if (axiosError.response?.data?.message) {
                const backendError = new Error(axiosError.response.data.message);
                (backendError as any).response = axiosError.response;
                throw backendError;
            }
            
            throw error;
        }
    },

    async removeItem(productId: string): Promise<ApiResponse<Cart>> {
        try {
            const response = await api.patch('/cart/remove', {
                productId: productId
            });

            
            if (!response.data || typeof response.data.success !== 'boolean') {
                throw new Error('Invalid response format from backend');
            }
            
            return response.data;
        } catch (error: unknown) {
            const axiosError = error as { response?: { status?: number; data?: ApiResponse<Cart> }; message?: string };
            console.error('❌ Remove item failed:', {
                error,
                status: axiosError.response?.status,
                backendMessage: axiosError.response?.data?.message,
                backendError: axiosError.response?.data?.error
            });
            
            if (axiosError.response?.data?.message) {
                const backendError = new Error(axiosError.response.data.message);
                (backendError as any).response = axiosError.response;
                throw backendError;
            }
            
            throw error;
        }
    },

    async clearCart(): Promise<ApiResponse<void>> {
        try {
            const response = await api.post('/cart/clear');

            
            if (!response.data || typeof response.data.success !== 'boolean') {
                throw new Error('Invalid response format from backend');
            }
            
            return response.data;
        } catch (error: unknown) {
            const axiosError = error as { response?: { status?: number; data?: ApiResponse<void> }; message?: string };
            console.error('❌ Clear cart failed:', {
                error,
                status: axiosError.response?.status,
                backendMessage: axiosError.response?.data?.message,
                backendError: axiosError.response?.data?.error
            });
            
            if (axiosError.response?.data?.message) {
                const backendError = new Error(axiosError.response.data.message);
                (backendError as any).response = axiosError.response;
                throw backendError;
            }
            
            throw error;
        }
    }
}; 