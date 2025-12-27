import { AxiosError } from 'axios';
import api from './apiInterceptor';
import { logger } from '@/utils/logger';

// Extend window interface for debugging
declare global {
    interface Window {
        authService: typeof authService;
    }
}

// ================================
// TYPE DEFINITIONS
// ================================
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface VerifyLoginData {
    username: string;
    otp: string;
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
  roleSlug?: string;
}

interface VerifyRegisterData {
    username: string;
    password: string;
    email: string;
    roleSlug: string;
    otp: string;
}

interface ApiResponse {
    success: boolean;
    message: string;
    data?: unknown;
}

interface ApiErrorResponse {
    message?: string;
    error?: string;
}

interface AuthError extends Error {
    code?: string;
    response?: {
        status: number;
        data: ApiErrorResponse;
    };
}

interface VerifyRegisterResponse {
    data: string; // accessToken
    status: number;
}

// ================================
// UTILITY FUNCTIONS
// ================================
const formatPhoneNumber = (
  phone: string,
  format: 'international' | 'local' = 'international'
): string => {
  // Remove all non-digits
  let phoneNumber = phone.replace(/\D/g, '');

  // Normalize
  if (phoneNumber.startsWith('0')) {
    phoneNumber = phoneNumber.substring(1);
  } else if (phoneNumber.startsWith('84')) {
    phoneNumber = phoneNumber.substring(2);
  }

  // Validate
  if (phoneNumber.length !== 9) {
    throw new Error('Invalid phone number format. Must be exactly 9 digits');
  }

  // Return requested format
  return format === 'international' ? '+84' + phoneNumber : '0' + phoneNumber;
};


const handleAuthError = (error: AuthError): never => {
    const errorResponse = error.response?.data;
    const status = error.response?.status;

    let errorMessage = 'An unexpected error occurred';

    if (status === 401) {
        errorMessage = 'Invalid credentials or session expired';
    } else if (status === 400) {
        errorMessage = errorResponse?.message || errorResponse?.error || 'Invalid input data';
    } else if (status === 404) {
        errorMessage = 'Account not found';
    } else if (status === 429) {
        errorMessage = 'Too many attempts. Please try again later';
    } else if (!navigator.onLine) {
        errorMessage = 'No internet connection';
    }

    error.message = errorMessage;
    throw error;
};

// Helper type guard
function isErrorWithMessage(error: unknown): error is { message: string } {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
    );
}

export const authService = {
    // ================================
    // REGISTRATION FLOW
    // ================================
    
    /**
     * Bước 1: Đăng ký tài khoản - Gửi thông tin và nhận OTP
     * @param userData { username, email, password }
     * @returns {Promise<ApiResponse>} Thông báo OTP hoặc lỗi
     */
    async register(userData: RegisterData): Promise<ApiResponse> {
        // Validate required fields
        if (!userData.email || !userData.password || !userData.username) {
            throw new Error('Username, email and password are required');
        }

        // Prepare request data
        const cleanedData = {
            username: userData.username.trim(),
            email: userData.email.trim(),
            password: userData.password,
            roleSlug: userData.roleSlug || 'customer' 
        };

        try {
            // Make API call
            const response = await api.post<ApiResponse>('/account/register', cleanedData);
            return response.data;
        } catch (error: any) {
            // Extract detailed error message from response
            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.errors?.[0] ||
                                error.message || 
                                'Đăng ký thất bại. Vui lòng thử lại.';
            const enhancedError = new Error(errorMessage);
            (enhancedError as any).response = error.response;
            throw enhancedError;
        }
    },

    /**
     * Bước 2: Xác thực OTP đăng ký - Hoàn tất tạo tài khoản
     * @param verifyData { username, password, phone, roleSlug, otp }
     * @returns {Promise<VerifyRegisterResponse>} 
     */
    async verifyRegister(verifyData: VerifyRegisterData): Promise<VerifyRegisterResponse> {
        try {
            const formattedData = {
                username: verifyData.username,
                password: verifyData.password,
                email: verifyData.email,
                roleSlug: verifyData.roleSlug || 'customer', 
                otp: verifyData.otp
            };

            const response = await api.post('/account/verify-register', formattedData);
            
            const handleSuccessResponse = async (accessToken: string) => {
                // Store token after successful registration to enable cart operations
                localStorage.setItem('authToken', accessToken);
                
                // Add small delay to ensure token is available for API interceptor
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Fetch and store user profile after registration
                try {
                    // Call getUserProfile method directly from authService
                    const userProfile = await authService.getUserProfile();
                    if (userProfile) {
                        localStorage.setItem('user', JSON.stringify(userProfile));
                        
                        // Trigger auth context update
                        window.dispatchEvent(new CustomEvent('auth:login', {
                            detail: { user: userProfile, token: accessToken }
                        }));
                    }
                } catch (error) {
                    // Even if profile fetch fails, we still have the token
                    // Try to create minimal user object from registration data
                    const minimalUser = {
                        username: verifyData.username,
                        email: verifyData.email,
                        role: 'customer',
                        isRegistered: true
                    };
                    // Phone will be populated when getUserProfile() succeeds
                    localStorage.setItem('user', JSON.stringify(minimalUser));
                    
                    // Still trigger auth context update with minimal data
                    window.dispatchEvent(new CustomEvent('auth:login', {
                        detail: { user: minimalUser, token: accessToken }
                    }));
                }
                
                return { data: accessToken, status: response.status };
            };
            
            // Handle both old string format and new JSON format
            if (typeof response.data === 'string') {
                // Old format - treat as access token if not error message
                if (response.data.includes('OTP') || response.data.includes('wrong') || response.data.includes('expired')) {
                    throw new Error(response.data);
                }
                return await handleSuccessResponse(response.data);
            } else if (response.data && response.data.success) {
                // New JSON format - success
                return await handleSuccessResponse(response.data.data);
            } else {
                logger.error('❌ JSON error response format:', response.data);
                // New JSON format - error
                throw new Error(response.data?.message || 'Verification failed');
            }
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            logger.error('❌ OTP verification error details:', {
                status: axiosError.response?.status,
                statusText: axiosError.response?.statusText,
                data: axiosError.response?.data,
                message: axiosError.message,
                config: {
                    url: axiosError.config?.url,
                    method: axiosError.config?.method
                }
            });
            console.groupEnd();
            throw error;
        }
    },

    /**
     * Gửi lại OTP (có thể dùng cho cả đăng ký và login)
     * @param identifier email hoặc phone (cho registration)
     * @param username tên đăng nhập (cho login) 
     * @param isForLogin boolean - true nếu dùng cho login, false nếu dùng cho register
     * @returns Promise<ApiResponse>
     */
    async resendOTP({ identifier, username, isForLogin = false }: { identifier?: string, username?: string, isForLogin?: boolean }): Promise<ApiResponse> {
        try {
            let requestData;
            
            if (isForLogin && username) {
                // Login flow - use username directly
                requestData = { username: username.trim() };
            } else if (!isForLogin && identifier) {
                // Registration flow - use identifier (email or phone)
                requestData = { identifier: identifier.trim() };
            } else {
                throw new Error('Invalid parameters: provide username for login or identifier (email/phone) for registration');
            }
            
            const response = await api.post('/account/resend-otp', requestData);
            
            return {
                success: true,
                message: typeof response.data === 'string' ? response.data : 'OTP đã được gửi lại'
            };
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            return {
                success: false,
                message: (axiosError.response?.data as ApiErrorResponse)?.message || 'Không thể gửi lại OTP. Vui lòng thử lại.'
            };
        }
    },

    // ================================
    // LOGIN FLOW
    // ================================
    
    /**
     
     * @param credentials { username, password }
     * @returns {Promise<string>} Thông báo OTP hoặc lỗi
     */
    async login(credentials: LoginCredentials): Promise<string> {
        try {
            if (!credentials.email || !credentials.password) {
                throw new Error('Email and password are required');
            }
            
            const cleanedCredentials = {
                email: credentials.email.trim(),
                password: credentials.password
            };
            
            const response = await api.post('/account/login', cleanedCredentials);
            const accessToken = response.data as string;

            // Persist token
            localStorage.setItem('authToken', accessToken);

            // Small delay to ensure interceptor sees token
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Fetch and store user profile
            try {
                const userProfile = await authService.getUserProfile();
                const userData = userProfile?.data || userProfile;
                if (userData) {
                    localStorage.setItem('user', JSON.stringify(userData));
                    // Notify AuthContext
                    window.dispatchEvent(
                        new CustomEvent('auth:login', {
                            detail: { user: userData, token: accessToken },
                        })
                    );
                }
            } catch (profileError) {
                // If profile fetch fails, still keep token
            }
            
            return accessToken;
        } catch (error: unknown) {
            if (isErrorWithMessage(error) && 'response' in error) {
                return handleAuthError(error as AuthError);
            }
            throw new Error('An unexpected error occurred');
        }
    },

    /**
     
     * @param verifyData { username, otp }
     * @returns {Promise<string>} accessToken hoặc lỗi
     */
    async verifyLogin(verifyData: VerifyLoginData): Promise<string> {
        try {
            if (!verifyData.username || !verifyData.otp) {
                throw new Error('Username and OTP are required');
            }
            const response = await api.post('/account/verify-login', {
                username: verifyData.username,
                otp: verifyData.otp
            });

            const accessToken =
                typeof response.data === 'string' ? response.data : response.data?.data || response.data;

            // Persist token
            localStorage.setItem('authToken', accessToken);

            // Small delay to ensure interceptor sees token
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Fetch and store user profile
            try {
                const userProfile = await authService.getUserProfile();
                const userData = userProfile?.data || userProfile;
                if (userData) {
                    localStorage.setItem('user', JSON.stringify(userData));
                    // Notify AuthContext
                    window.dispatchEvent(
                        new CustomEvent('auth:login', {
                            detail: { user: userData, token: accessToken },
                        })
                    );
                }
            } catch (profileError) {
                // If profile fetch fails, still keep token
            }

            return accessToken;
        } catch (error: unknown) {
            if (isErrorWithMessage(error) && 'response' in error) {
                return handleAuthError(error as AuthError);
            }
            throw new Error('An unexpected error occurred');
        }
    },

    // ================================
    // PASSWORD MANAGEMENT
    // ================================
    
    /**
     * Request password reset - gửi OTP để reset password
     * @param username tên đăng nhập
     * @returns Promise<{ success: boolean, message: string }>
     */
    async requestPasswordReset(email: string) {
        try {
            const response = await api.post('/account/forgot-password', { email: email });
            return {
                success: true,
                message: typeof response.data === 'string' ? response.data : 'OTP đã được gửi'
            };
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            return {
                success: false,
                message: (axiosError.response?.data as ApiErrorResponse)?.message || 'Failed to send OTP'
            };
        }
    },

    /**
     * Xác thực OTP và reset password
     * @param username tên đăng nhập
     * @param otp mã OTP
     * @param newPassword mật khẩu mới
     * @returns Promise<{ success: boolean, message: string }>
     */
    async verifyResetOTP({ email, otp, newPassword }: { email: string, otp: string, newPassword: string }) {
        try {
            const response = await api.post('/account/verify-change-password', {
                email: email,
                otp,
                newPassword
            });
            return {
                success: true,
                message: typeof response.data === 'string' ? response.data : 'Password reset successfully'
            };
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            return {
                success: false,
                message: (axiosError.response?.data as ApiErrorResponse)?.message || 'Failed to reset password'
            };
        }
    },

    // ================================
    // USER MANAGEMENT
    // ================================
    
    /**
     
     * @returns 
     */
    async getUserProfile() {
        const response = await api.get('/account/details');
        return response.data;
    },

    /**
     * Đăng xuất
     */
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    },

    /**
     * Kiểm tra trạng thái đăng nhập
     * @returns boolean
     */
    isAuthenticated() {
        const token = localStorage.getItem('authToken');
        return !!token;
    },

    /**
     * Lấy token
     * @returns string | null
     */
    getToken() {
        return localStorage.getItem('authToken');
    },

    /**
     * Lấy thông tin user từ localStorage
     * @returns any | null
     */
    getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Get username by phone number
     * @param phone Phone number
     * @returns Promise<string | null> Username if found, null otherwise
     */
    async getUsernameByPhone(phone: string): Promise<string | null> {
        try {
            // Note: This endpoint doesn't exist in backend yet
            // For now, return null or implement alternative logic
            // TODO: Implement when backend endpoint is available
            console.warn(`getUsernameByPhone: Endpoint not implemented in backend for phone: ${phone}`);
            return null;
        } catch (error) {
            logger.error('Error getting username by phone:', error);
            return null;
        }
    },

    /**
     * Debug utility - Check complete auth state
     * @returns object with auth state details
     */
    debugAuthState() {
        const token = this.getToken();
        const user = this.getUser();
        const isAuth = this.isAuthenticated();
        
        const authState = {
            // Token info
            hasToken: !!token,
            tokenLength: token?.length,
            tokenPreview: token?.substring(0, 30) + '...' || 'No token',
            
            // User info
            hasUser: !!user,
            userInfo: user,
            
            // Auth status
            isAuthenticated: isAuth,
            
            // SessionStorage info
            registrationSuccess: !!sessionStorage.getItem('registrationSuccess'),
            loginSuccess: !!sessionStorage.getItem('loginSuccess'),
            
            // Current timestamp
            timestamp: new Date().toLocaleString()
        };
        
        return authState;
    },

    // Utility functions for testing
    formatPhoneNumber
};

/**
 * Send OTP for guest checkout - uses existing OTP endpoint
 */
export const sendOtpForGuest = async (phone: string): Promise<ApiResponse> => {
  try {
    const formattedPhone = formatPhoneNumber(phone);
    const response = await api.post('/otp/send', { phone: formattedPhone });
    return {
      success: true,
      message: 'OTP sent successfully',
      data: response.data?.data || { message: 'OTP sent successfully' }
    };
  } catch (error) {
    return handleAuthError(error as AuthError);
  }
};

/**
 * Verify OTP for guest checkout - uses existing OTP endpoint
 */
export const verifyOtpForGuest = async (phone: string, otp: string): Promise<ApiResponse> => {
  try {
    const formattedPhone = formatPhoneNumber(phone);
    const response = await api.post('/otp/verify', { 
      phone: formattedPhone,
      otp: otp
    });
    return {
      success: response.data || false,
      message: response.data ? 'OTP verified successfully' : 'OTP is wrong or expired',
      data: { verified: response.data || false }
    };
  } catch (error) {
    return handleAuthError(error as AuthError);
  }
};

/**
 * Send OTP for customer phone change
 */
export const sendOtpForCustomer = async (username: string): Promise<ApiResponse> => {
  try {
    await api.post('/account/send-otp', { username });
    return {
      success: true,
      message: 'OTP sent successfully',
      data: { message: 'OTP sent successfully' }
    };
  } catch (error) {
    return handleAuthError(error as AuthError);
  }
};

/**
 * Verify OTP for customer phone change
 */
export const verifyOtpForCustomer = async (identifier: string, otp: string): Promise<ApiResponse> => {
  try {
    // Use /otp/verify endpoint which accepts identifier (email or phone)
    const response = await api.post('/otp/verify', { identifier, otp });
    return {
      success: true,
      message: 'OTP verified successfully',
      data: { verified: response.data }
    };
  } catch (error) {
    return handleAuthError(error as AuthError);
  }
};

// Expose authService to window for debugging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    window.authService = authService;
} 