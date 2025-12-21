import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import ContactUs from "./components/About/ContactUs.jsx";
import Aboutus from "./components/About/Aboutus.jsx";
import Login from "./components/Login/Login.jsx";
import SignUp from "./components/Login/SignUp.jsx";
import ForgotPassword from "./components/Login/ForgotPassword.jsx";
import HomePage from "./Page/HomePage";
import CartPage from "./Page/CartPage.jsx";
import CheckoutPage from "./Page/CheckoutPage.jsx";
import AllProductsPage from "./Page/AllProductsPage";
import VNPayPaymentPage from "./Page/VNPayPaymentPage.jsx";
import OrderHistoryPage from "./Page/OrderHistoryPage.jsx";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navigation from "./components/Navigation";
import Header from "./components/header";
import { Fragment, useEffect } from "react";
import type { ReactNode } from "react";
import CustomerManagement from "./components/CustomerManager/CustomerManagement.jsx";
import ShipperManagement from "./components/ShipperManager/ShipperManagement.jsx";
import { AdminApp } from "./components/admin";
import RequestForQuotaPage from "./Page/RequestForQuotaPage";
import UserDetailsPage from "./Page/UserDetailsPage.jsx";

function AuthBgWrapper({ children }: { children: ReactNode }) {
  return <div className="auth-bg-custom">{children}</div>;
}

// Component để kiểm tra role và chuyển hướng phù hợp khi reload trang
function RoleBasedRedirect() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      // Chỉ kiểm tra khi đã đăng nhập và đang ở trang chủ
      if (isAuthenticated() && user && location.pathname === "/") {
        const roleName = user
          ? typeof user.role === "object"
            ? user.role.name
            : user.role
          : null;
        const isAdminOrStaffOrShipper =
          roleName === "admin" ||
          roleName === "manager" ||
          roleName === "staff" ||
          roleName === "shipper";

              if (isAdminOrStaffOrShipper) {
        navigate("/admin", { replace: true });
      }
      }
    };

    // Thêm delay nhỏ để đảm bảo auth state đã được load
    const timer = setTimeout(checkRoleAndRedirect, 100);
    return () => clearTimeout(timer);
  }, [user, isAuthenticated, navigate, location.pathname]);

  return null;
}

// Protected Route Component for admin access
function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // For admin routes, we'll let the component handle the redirect
  // since the user data might not be fully loaded yet
  if (requireAdmin && !user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Component để handle navigation events từ AuthContext
function AuthNavigationHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthLogout = (event: CustomEvent) => {
      const redirectTo = event.detail?.redirectTo || "/login";
      navigate(redirectTo, { replace: true });
    };

    window.addEventListener("auth:logout", handleAuthLogout as EventListener);

    return () => {
      window.removeEventListener(
        "auth:logout",
        handleAuthLogout as EventListener
      );
    };
  }, [navigate]);

  return null;
}

// Tách logic route để dùng useLocation
function AppContent() {
  const location = useLocation();
  const hideHeaderAndNavRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/about",
    "/contact",
    "/cart",
    "/checkout",
    "/vnpay-payment",
    "/manage-customers",
    "/manage-shippers",
    "/admin",
    "/order-history",
  ];
  const shouldHide = hideHeaderAndNavRoutes.includes(location.pathname);

  return (
    <Fragment>
      <AuthNavigationHandler />
      <RoleBasedRedirect />
      {!shouldHide && <Header />}
      {!shouldHide && <Navigation />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/all-products" element={<AllProductsPage />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/about" element={<Aboutus />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/vnpay-payment" element={<VNPayPaymentPage />} />
        <Route
          path="/login"
          element={
            <AuthBgWrapper>
              <Login />
            </AuthBgWrapper>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthBgWrapper>
              <SignUp />
            </AuthBgWrapper>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AuthBgWrapper>
              <ForgotPassword />
            </AuthBgWrapper>
          }
        />

        <Route path="/request-for-quota" element={<RequestForQuotaPage />} />
        <Route path="/user/details" element={<UserDetailsPage />} />

        <Route
          path="/manage-customers"
          element={
            <ProtectedRoute requireAdmin={true}>
              <CustomerManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-shippers"
          element={
            <ProtectedRoute requireAdmin={true}>
              <ShipperManagement />
            </ProtectedRoute>
          }
        />
        <Route path="/order-history" element={<OrderHistoryPage />} />
        <Route
          path="/login"
          element={
            <AuthBgWrapper>
              <Login />
            </AuthBgWrapper>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthBgWrapper>
              <SignUp />
            </AuthBgWrapper>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AuthBgWrapper>
              <ForgotPassword />
            </AuthBgWrapper>
          }
        />

        {/* Admin Dashboard Route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminApp />
            </ProtectedRoute>
          }
        />

        {/* Redirect any unknown paths to home page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Fragment>
  );
}

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
