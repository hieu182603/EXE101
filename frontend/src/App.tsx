import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@contexts/AuthContext';
import { CartProvider } from '@contexts/CartContext';
import { ToastProvider } from '@contexts/ToastContext';
import { NotificationProvider } from '@contexts/NotificationContext';
import AdminLayout from '@layouts/AdminLayout';
import MainLayout from '@layouts/MainLayout';
import SuspenseWrapper from '@components/ui/SuspenseWrapper';

// Lazy-loaded routes for code splitting
import {
  LazyHomePage,
  LazyCatalogPage,
  LazyProductDetail,
  LazyCartPage,
  LazyCheckoutPage,
  LazyWaitingPayment,
  LazyProfilePage,
  LazyOrderHistory,
  LazyQuoteRequest,
  LazyPolicyPage,
  LazyTrackingPage,
  LazyLoginPage,
  LazyRegisterPage,
  LazyForgotPassword,
  LazyAdminDashboard,
  LazyProductManagement,
  LazyOrderManagement,
  LazyCustomerManagement,
  LazyShipperManagement,
  LazyFeedbackManagement,
  LazyAccountManagement,
  LazyBannersManagement,
  LazyWishlistPage,
} from '@utils/lazyRoutes';

// Protected Route Component
function ProtectedRoute({
  children,
  requireAdmin = false
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user) {
    const roleName = typeof user.role === 'object' ? user.role.name : user.role;
    const isAdmin = roleName === 'admin' || roleName === 'manager' || roleName === 'staff';

    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <NotificationProvider>
          <AuthProvider>
            <CartProvider>
              <Routes>
            {/* User Store Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<SuspenseWrapper><LazyHomePage /></SuspenseWrapper>} />
              <Route path="/catalog" element={<SuspenseWrapper><LazyCatalogPage /></SuspenseWrapper>} />
              <Route path="/product/:id" element={<SuspenseWrapper><LazyProductDetail /></SuspenseWrapper>} />
              <Route path="/cart" element={<SuspenseWrapper><LazyCartPage /></SuspenseWrapper>} />
              <Route path="/checkout" element={<SuspenseWrapper><LazyCheckoutPage /></SuspenseWrapper>} />
              <Route path="/waiting-payment" element={<SuspenseWrapper><LazyWaitingPayment /></SuspenseWrapper>} />
              <Route path="/profile" element={<ProtectedRoute><SuspenseWrapper><LazyProfilePage /></SuspenseWrapper></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><SuspenseWrapper><LazyOrderHistory /></SuspenseWrapper></ProtectedRoute>} />
              <Route path="/tracking/:id" element={<ProtectedRoute><SuspenseWrapper><LazyTrackingPage /></SuspenseWrapper></ProtectedRoute>} />
              <Route path="/quote" element={<SuspenseWrapper><LazyQuoteRequest /></SuspenseWrapper>} />
              <Route path="/wishlist" element={<SuspenseWrapper><LazyWishlistPage /></SuspenseWrapper>} />
              <Route path="/policy" element={<SuspenseWrapper><LazyPolicyPage /></SuspenseWrapper>} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminLayout /></ProtectedRoute>}>
              <Route index element={<SuspenseWrapper><LazyAdminDashboard /></SuspenseWrapper>} />
              <Route path="products" element={<SuspenseWrapper><LazyProductManagement /></SuspenseWrapper>} />
              <Route path="orders" element={<SuspenseWrapper><LazyOrderManagement /></SuspenseWrapper>} />
              <Route path="customers" element={<SuspenseWrapper><LazyCustomerManagement /></SuspenseWrapper>} />
              <Route path="shippers" element={<SuspenseWrapper><LazyShipperManagement /></SuspenseWrapper>} />
              <Route path="feedback" element={<SuspenseWrapper><LazyFeedbackManagement /></SuspenseWrapper>} />
              <Route path="banners" element={<SuspenseWrapper><LazyBannersManagement /></SuspenseWrapper>} />
              <Route path="accounts" element={<SuspenseWrapper><LazyAccountManagement /></SuspenseWrapper>} />
            </Route>

            {/* Auth Routes */}
            <Route path="/login" element={<SuspenseWrapper><LazyLoginPage /></SuspenseWrapper>} />
            <Route path="/register" element={<SuspenseWrapper><LazyRegisterPage /></SuspenseWrapper>} />
            <Route path="/forgot-password" element={<SuspenseWrapper><LazyForgotPassword /></SuspenseWrapper>} />

            {/* Default */}
            <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </CartProvider>
          </AuthProvider>
        </NotificationProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
