import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';

interface User {
    id?: string;
    username: string;
    name?: string;
    email?: string;
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
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showError } = useToast();
    const [user, setUser] = useState(authService.getUser());
    const [token, setToken] = useState(authService.getToken());
    const [isLoading, setIsLoading] = useState(true);

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
            // Clear auth state
            setUser(null);
            setToken(null);

            // Show notification to user
            if (event.detail?.message) {
                showError(event.detail.message);
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
        const token = authService.getToken();
        const user = authService.getUser();

        if (token && user) {
            setToken(token);
            setUser(user);

            // Refresh user data from API to ensure role is up-to-date
            const refreshUserData = async () => {
                setIsLoading(true);
                try {
                    const userProfile = await authService.getUserProfile();
                    const freshUserData = userProfile.data || userProfile;

                    if (freshUserData && freshUserData.username) {
                        setUser(freshUserData);
                        localStorage.setItem('user', JSON.stringify(freshUserData));
                    }
                } catch (error) {
                    // Failed to refresh user data from API, using cached data
                } finally {
                    setIsLoading(false);
                }
            };

            // Refresh user data in background
            refreshUserData();
        } else {
            setToken(null);
            setUser(null);
            setIsLoading(false);
        }
    }, []);

    // Add method to force clear auth state
    const clearAuthState = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    };

    // Listen for custom events to clear auth state and handle auto-login
    useEffect(() => {
        const handleClearAuth = () => {
            clearAuthState();
        };

        const handleAutoLogin = (event: CustomEvent) => {
            const { user: userData, token: authToken } = event.detail;
            if (userData && authToken) {
                setUser(userData);
                setToken(authToken);
            }
        };

        window.addEventListener('auth:clear', handleClearAuth);
        window.addEventListener('auth:login', handleAutoLogin as EventListener);

        return () => {
            window.removeEventListener('auth:clear', handleClearAuth);
            window.removeEventListener('auth:login', handleAutoLogin as EventListener);
        };
    }, []);

    // Centralized logout navigation handler — listen for auth:logout and navigate
    useEffect(() => {
        const handleLogoutNav = (event: CustomEvent) => {
            const redirectTo = event?.detail?.redirectTo || '/login';
            // Ensure auth state cleared
            clearAuthState();
            // Only navigate if not already on the target
            if (!window.location.pathname.includes(redirectTo)) {
                window.location.href = redirectTo;
            }
        };

        window.addEventListener('auth:logout', handleLogoutNav as EventListener);

        return () => {
            window.removeEventListener('auth:logout', handleLogoutNav as EventListener);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, clearAuthState, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        // Return default auth context instead of throwing
        return {
            user: null,
            token: null,
            login: () => { },
            logout: () => { },
            isAuthenticated: () => false,
            clearAuthState: () => { },
            isLoading: false
        };
    }
    return context;
}; 