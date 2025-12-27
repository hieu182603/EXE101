import { lazy } from 'react';

/**
 * Lazy-loaded route components for code splitting and performance optimization
 * 
 * Usage in App.tsx:
 * ```tsx
 * import { LazyHomePage, LazyCartPage } from '@utils/lazyRoutes';
 * import SuspenseWrapper from '@components/ui/SuspenseWrapper';
 * 
 * <Route path="/" element={<SuspenseWrapper><LazyHomePage /></SuspenseWrapper>} />
 * ```
 */

// Store Pages - Lazy loaded
export const LazyHomePage = lazy(() => import('@pages/store/Home'));
export const LazyCatalogPage = lazy(() => import('@pages/store/Catalog'));
export const LazyProductDetail = lazy(() => import('@pages/store/ProductDetail'));
export const LazyCartPage = lazy(() => import('@pages/store/Cart'));
export const LazyCheckoutPage = lazy(() => import('@pages/store/Checkout'));
export const LazyWaitingPayment = lazy(() => import('@pages/store/WaitingPayment'));
export const LazyProfilePage = lazy(() => import('@pages/store/Profile'));
export const LazyOrderHistory = lazy(() => import('@pages/store/OrderHistory'));
export const LazyQuoteRequest = lazy(() => import('@pages/store/QuoteRequest'));
export const LazyPolicyPage = lazy(() => import('@pages/store/Policy'));
export const LazyTrackingPage = lazy(() => import('@pages/store/Tracking'));
export const LazyWishlistPage = lazy(() => import('@pages/store/Wishlist'));

// Auth Pages - Lazy loaded
export const LazyLoginPage = lazy(() => import('@pages/auth/Login'));
export const LazyRegisterPage = lazy(() => import('@pages/auth/Register'));
export const LazyForgotPassword = lazy(() => import('@pages/auth/ForgotPassword'));

// Admin Pages - Lazy loaded (heavy components)
export const LazyAdminDashboard = lazy(() => import('@pages/admin/Dashboard'));
export const LazyAdminAnalytics = lazy(() => import('@pages/admin/Analytics'));
export const LazyAdminReports = lazy(() => import('@pages/admin/Reports'));
export const LazyProductManagement = lazy(() => import('@pages/admin/Products'));
export const LazyOrderManagement = lazy(() => import('@pages/admin/Orders'));
export const LazyCustomerManagement = lazy(() => import('@pages/admin/Customers'));
export const LazyShipperManagement = lazy(() => import('@pages/admin/Shippers'));
export const LazyFeedbackManagement = lazy(() => import('@pages/admin/Feedback'));
export const LazyAccountManagement = lazy(() => import('@pages/admin/Accounts'));
export const LazyBannersManagement = lazy(() => import('@pages/admin/Banners'));
