import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);

// Helper to check if we're in registration flow
const checkRegistrationFlow = () => {
  const justRegistered = sessionStorage.getItem("registrationSuccess");
  const currentPath = window.location.pathname;

  console.log("🔍 Registration flow check:", {
    hasRegistrationFlag: !!justRegistered,
    currentPath,
    isLoginPage: currentPath === "/login",
    isSignupPage: currentPath === "/signup",
  });

  if (justRegistered) {
    try {
      const regData = JSON.parse(justRegistered);
      const timeSinceReg = Date.now() - regData.timestamp;
      console.log("📊 Registration timing:", {
        timestamp: new Date(regData.timestamp).toLocaleTimeString(),
        timeSinceReg,
        isWithinGracePeriod: timeSinceReg < 10000,
      });

      if (timeSinceReg < 3000) {
        // Reduced to 3 seconds grace period
        return true;
      }
    } catch (e) {
      console.warn("❌ Invalid registration data:", e);
    }
  }

  // Also block if we're on signup or just navigated to login
  if (currentPath === "/signup" || currentPath === "/login") {
    console.log("🚫 Blocking API calls on auth pages");
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
    console.log("🌐 API Request:", {
      url: (config.baseURL || "") + url,
      method: config.method?.toUpperCase(),
      isAuthRoute: authRoutes.some((route) => url.includes(route)),
    });

    if (config.data) {
      console.log("📤 Request data:", {
        ...config.data,
        password: config.data.password ? "***" : undefined,
      });
    }

    // Check if this route needs authentication
    const needsAuth = !authRoutes.some((route) => url.includes(route));
    if (needsAuth) {
      const token = localStorage.getItem("authToken");

      // Only block API calls during registration flow if we don't have a token
      if (!token) {
        const inRegistrationFlow = checkRegistrationFlow();
        if (inRegistrationFlow) {
          console.log(
            "🚫 BLOCKING API call during registration flow (no token):",
            url
          );
          console.log("⏱️ Registration grace period active");
          // Reject the request with a custom error
          return Promise.reject(new Error("API_BLOCKED_REGISTRATION_FLOW"));
        }
      }

      console.log("🔐 Authentication check:", {
        needsAuth: true,
        hasToken: !!token,
        tokenLength: token?.length,
        tokenStart: token?.substring(0, 20) + "..." || "No token",
        inRegistrationFlow: !token && checkRegistrationFlow(),
        url: url,
        currentHeaders: Object.keys(config.headers || {}),
      });

      if (token) {
        config.headers.Authorization = token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`;
        console.log("✅ Authorization header added:", {
          headerSet: !!config.headers.Authorization,
          headerLength: config.headers.Authorization?.length,
          headerFormat: config.headers.Authorization?.substring(0, 20) + "...",
          url: url,
        });
      } else {
        console.warn("⚠️ No auth token found for protected route:", {
          url: url,
          localStorage: !!localStorage.getItem("authToken"),
          localStorageLength: localStorage.getItem("authToken")?.length,
        });
      }
    } else {
      console.log("🔓 Auth route - no token needed");
    }

    return config;
  },
  (error) => {
    console.error("❌ Request error:", error.message);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log("📨 Response success:", {
      status: response.status,
      url: response.config?.url,
      method: response.config?.method?.toUpperCase(),
      dataType: typeof response.data,
      dataPreview:
        typeof response.data === "string"
          ? response.data.substring(0, 100) +
            (response.data.length > 100 ? "..." : "")
          : response.data,
    });
    return response;
  },
  async (error) => {
    // Handle blocked API calls during registration
    if (error.message === "API_BLOCKED_REGISTRATION_FLOW") {
      console.log("🚫 API call blocked during registration - this is expected");
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
