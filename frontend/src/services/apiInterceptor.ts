import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to check if we're in registration flow
const checkRegistrationFlow = () => {
  const justRegistered = sessionStorage.getItem("registrationSuccess");
  const currentPath = window.location.pathname;

  if (justRegistered) {
    try {
      const regData = JSON.parse(justRegistered);
      const timeSinceReg = Date.now() - regData.timestamp;

      if (timeSinceReg < 3000) {
        // Reduced to 3 seconds grace period
        return true;
      }
    } catch (e) {
      // Invalid registration data
    }
  }

  // Also block if we're on signup or just navigated to login
  if (currentPath === "/signup" || currentPath === "/login") {
    return true;
  }

  return false;
};

const authRoutes = [
    '/account/login',
    '/account/verify-login',
    '/account/register',
    '/account/verify-register',
    '/account/verify-registration',
    '/account/resend-otp',
    '/account/forgot-password',
    '/account/verify-change-password',
    '/products/categories/all',
    '/feedbacks'
];

api.interceptors.request.use(
  (config) => {
    const url = config.url || "";

    // Check if this route needs authentication
    const needsAuth = !authRoutes.some((route) => url.includes(route));
    if (needsAuth) {
      const token = localStorage.getItem("authToken");

      // Only block API calls during registration flow if we don't have a token
      if (!token) {
        const inRegistrationFlow = checkRegistrationFlow();
        if (inRegistrationFlow) {
          // Reject the request with a custom error
          return Promise.reject(new Error("API_BLOCKED_REGISTRATION_FLOW"));
        }
      }

      if (token) {
        config.headers.Authorization = token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle blocked API calls during registration
    if (error.message === "API_BLOCKED_REGISTRATION_FLOW") {
      return Promise.resolve({
        data: { success: false, message: "Registration flow active" },
        status: 200,
        statusText: "OK",
        headers: {},
        config: error.config,
      });
    }

    // Handle 401 error (no refresh token logic)
    const isLoginRequest =
      error.config &&
      error.config.url &&
      error.config.url.includes("/account/login");
    if (error.response?.status === 401 && !isLoginRequest) {
      // Clear auth data and redirect to login
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.dispatchEvent(
        new CustomEvent("auth:unauthorized", {
          detail: { message: "Session expired. Please login again." },
        })
      );
      if (!window.location.pathname.includes("/login")) {
        alert("Session expired. Please login again.");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
    // For login requests, just reject and let the login page handle the error
    return Promise.reject(error);
  }
);

export default api;
