import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface User {
    username: string;
    phone?: string;
    role: string | { name: string };
    isRegistered: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (userData: User, token: string) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
    clearAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState(authService.getUser());
    const [token, setToken] = useState(authService.getToken());

    const login = (userData: User, token: string) => {
        setUser(userData);
        setToken(token);
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setToken(null);
    };

    const isAuthenticated = () => {
        return authService.isAuthenticated();
    };

    // Handle unauthorized events from API interceptor
    useEffect(() => {
        const handleUnauthorized = (event: CustomEvent) => {
            console.log('Unauthorized access detected:', event.detail?.message);
            
            // Clear auth state
            setUser(null);
            setToken(null);
            
            // Show notification to user
            if (event.detail?.message) {
                // You can replace this with a toast notification
                alert(event.detail.message);
            }
            
            // Emit a custom event for navigation instead of direct navigation
            window.dispatchEvent(new CustomEvent('auth:logout', { 
                detail: { redirectTo: '/login' } 
            }));
        };

        // Listen for unauthorized events
        window.addEventListener('auth:unauthorized', handleUnauthorized as EventListener);
        
        // Cleanup listener
        return () => {
            window.removeEventListener('auth:unauthorized', handleUnauthorized as EventListener);
        };
    }, []);

    // Verify token on mount and refresh user data if needed
    useEffect(() => {
        console.group('🔑 [DEBUG] AuthContext Mount/State Check');
        
        const token = authService.getToken();
        const user = authService.getUser();
        
        console.log('📊 Auth state check:', {
            hasToken: !!token,
            hasUser: !!user,
            tokenLength: token?.length,
            userInfo: user ? { username: user.username, role: user.role } : null
        });
        
        if (token && user) {
            setToken(token);
            setUser(user);
            console.log('✅ Auth state restored from localStorage');
            
            // Refresh user data from API to ensure role is up-to-date
            const refreshUserData = async () => {
                try {
                    const userProfile = await authService.getUserProfile();
                    const freshUserData = userProfile.data || userProfile;
                    
                    if (freshUserData && freshUserData.username) {
                        setUser(freshUserData);
                        localStorage.setItem('user', JSON.stringify(freshUserData));
                        console.log('✅ User data refreshed from API');
                    }
                } catch (error) {
                    console.warn('⚠️ Failed to refresh user data from API, using cached data:', error);
                }
            };
            
            // Refresh user data in background
            refreshUserData();
        } else {
            console.log('❌ No valid auth state - clearing');
            setToken(null);
            setUser(null);
        }
        
        console.groupEnd();
    }, []);

    // Add method to force clear auth state
    const clearAuthState = () => {
        console.log('🧹 Force clearing auth state...');
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    };

    // Listen for custom events to clear auth state and handle auto-login
    useEffect(() => {
        const handleClearAuth = () => {
            console.log('📢 Received clear auth event');
            clearAuthState();
        };

        const handleAutoLogin = (event: CustomEvent) => {
            console.log('📢 Received auto-login event from registration:', event.detail);
            const { user: userData, token: authToken } = event.detail;
            if (userData && authToken) {
                setUser(userData);
                setToken(authToken);
                console.log('✅ Auth state updated from registration auto-login');
            }
        };

        window.addEventListener('auth:clear', handleClearAuth);
        window.addEventListener('auth:login', handleAutoLogin as EventListener);
        
        return () => {
            window.removeEventListener('auth:clear', handleClearAuth);
            window.removeEventListener('auth:login', handleAutoLogin as EventListener);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, clearAuthState }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        console.warn('useAuth called without AuthProvider. Using default values.');
        // Return default auth context instead of throwing
        return {
            user: null,
            token: null,
            login: () => {},
            logout: () => {},
            isAuthenticated: () => false,
            clearAuthState: () => {}
        };
    }
    return context;
}; 