import { lazy } from 'react';

/**
 * Lazy-loaded route components for code splitting and performance optimization
 * 
 * Usage in App.tsx:
 * ```tsx
 * import { LazyHomePage, LazyCartPage } from '@utils/lazyRoutes';
 * 
 * <Route path="/" element={<LazyHomePage />} />
 * ```
 */

// Store Pages - Lazy loaded
export const LazyHomePage = lazy(() => import('@pages/HomePage'));
export const LazyAllProductsPage = lazy(() => import('@pages/AllProductsPage'));
export const LazyCartPage = lazy(() => import('@pages/CartPage'));
export const LazyCheckoutPage = lazy(() => import('@pages/CheckoutPage'));
export const LazyVNPayPaymentPage = lazy(() => import('@pages/VNPayPaymentPage'));
export const LazyOrderHistoryPage = lazy(() => import('@pages/OrderHistoryPage'));
export const LazyRequestForQuotaPage = lazy(() => import('@pages/RequestForQuotaPage'));
export const LazyUserDetailsPage = lazy(() => import('@pages/UserDetailsPage'));

// Auth Pages - Lazy loaded
export const LazyLogin = lazy(() => import('@components/Login/Login'));
export const LazySignUp = lazy(() => import('@components/Login/SignUp'));
export const LazyForgotPassword = lazy(() => import('@components/Login/ForgotPassword'));

// About Pages - Lazy loaded
export const LazyContactUs = lazy(() => import('@components/About/ContactUs'));
export const LazyAboutus = lazy(() => import('@components/About/Aboutus'));

// Admin Pages - Lazy loaded (heavy components)
export const LazyAdminApp = lazy(() => import('@components/admin').then(module => ({ default: module.AdminApp })));
export const LazyCustomerManagement = lazy(() => import('@components/CustomerManager/CustomerManagement'));
export const LazyShipperManagement = lazy(() => import('@components/ShipperManager/ShipperManagement'));

