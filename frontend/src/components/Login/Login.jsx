import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Lock, ArrowLeft } from "lucide-react";
import FormCard from "./FormCard";
import styles from "./Login.module.css";
import { authService } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";
import { formatDateTime } from "../../utils/dateFormatter";

const Login = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for stored registration or reset data
  useEffect(() => {
    // Check for registration data
    const lastRegisteredUser = sessionStorage.getItem("lastRegisteredUser");
    if (lastRegisteredUser) {
      try {
        const { username, timestamp } = JSON.parse(lastRegisteredUser);
        // Only use data if it's less than 5 minutes old
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          setFormData((prev) => ({ ...prev, username }));
        }
        // Clear the stored data
        sessionStorage.removeItem("lastRegisteredUser");
      } catch (error) {
        console.error("Error parsing lastRegisteredUser:", error);
      }
    }

    // Check for password reset data
    const lastResetUser = sessionStorage.getItem("lastResetUser");
    if (lastResetUser) {
      try {
        const { phone, timestamp } = JSON.parse(lastResetUser);
        // Only use data if it's less than 5 minutes old
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          // We need to get the username associated with this phone number
          authService
            .getUsernameByPhone(phone)
            .then((username) => {
              if (username) {
                setFormData((prev) => ({ ...prev, username }));
              }
            })
            .catch((error) => console.error("Error getting username:", error));
        }
        // Clear the stored data
        sessionStorage.removeItem("lastResetUser");
      } catch (error) {
        console.error("Error parsing lastResetUser:", error);
      }
    }
  }, []);

  const validateField = (name, value) => {
    switch (name) {
      case "username":
        if (!value.trim()) {
          return "Username is required";
        }

        // Simple username validation
        if (value.length < 3) {
          return "Username must be at least 3 characters";
        }
        return "";

      case "password":
        if (!value) {
          return "Password is required";
        }
        if (value.length < 6) {
          return "Password must be at least 6 characters";
        }
        return "";
      default:
        return "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      const fieldError = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: fieldError,
      }));
    }

    if (errors.general) {
      setErrors((prev) => ({
        ...prev,
        general: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.group("🔍 [DEBUG] Login Form Submission");


    const usernameError = validateField("username", formData.username);
    const passwordError = validateField("password", formData.password);



    if (usernameError || passwordError) {
      setErrors({
        username: usernameError,
        password: passwordError,
      });
      // console.log removed
      console.groupEnd();
      return;
    }

    setIsSubmitting(true);
    try {
      // Simple username processing - just trim whitespace
      const processedUsername = formData.username.trim();

      // console.log removed

      const loginData = {
        username: processedUsername,
        password: formData.password,
      };



      const response = await authService.login(loginData);



      // Handle direct JWT token response (no OTP)
      const responseToken =
        typeof response === "string" ? response : response?.data;
      const isValidToken =
        responseToken &&
        typeof responseToken === "string" &&
        responseToken.length > 10;



      if (isValidToken) {
        // console.log removed

        // Store success state for better UX
        sessionStorage.setItem(
          "loginSuccess",
          JSON.stringify({
            username: processedUsername,
            timestamp: Date.now(),
          })
        );

        // console.log removed

        // Successful login - authenticate user directly
        login({ username: processedUsername }, responseToken);
        
        // Add small delay to ensure token is stored and available for API interceptor
        await new Promise(resolve => setTimeout(resolve, 100));

        // Fetch user profile to get role information
        try {
          const userProfile = await authService.getUserProfile();


          // Extract user data from response structure
          const userData = userProfile.data || userProfile;

          // Sửa logic kiểm tra role
          const roleName = typeof userData.role === "object" ? userData.role.name : userData.role;
          const isAdminOrStaffOrShipper =
            roleName === "admin" ||
            roleName === "manager" ||
            roleName === "staff" ||
            roleName === "shipper";

          if (isAdminOrStaffOrShipper) {
            // Redirect all admin/manager/staff/shipper to admin dashboard
            navigate("/admin", {
              state: {
                welcomeMessage: `Chào mừng ${roleName} trở lại!`,
                loginTime: formatDateTime(new Date()),
              },
            });
          } else {
            // Redirect regular users to homepage
            navigate("/", {
              state: {
                welcomeMessage: `Chào mừng bạn trở lại!`,
                loginTime: new Date().toLocaleTimeString("vi-VN"),
              },
            });
          }
        } catch (error) {
          console.error("❌ Error fetching user profile:", error);
          // If profile fetch fails, redirect to homepage as fallback
          navigate("/", {
            state: {
              welcomeMessage: `Chào mừng bạn trở lại!`,
              loginTime: new Date().toLocaleTimeString("vi-VN"),
            },
          });
        }
        // console.log removed
      } else {
        console.error("❌ Invalid login response:", response);
        setErrors({ general: "Unexpected response from server" });
      }
    } catch (error) {
      console.error("❌ Login error details:", {
        error,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        originalUsername: formData.username,
        config: error.config,
      });

      let errorMessage = "Login failed. Please check your credentials.";

      if (error.response?.status === 401) {
        errorMessage =
          "Invalid username or password. Please check and try again.";
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || "Invalid input format";
      } else if (error.response?.status === 404) {
        errorMessage = "Account not found. Please check your username.";
      } else if (error.response?.status === 429) {
        errorMessage = "Too many attempts. Please try again later.";
      } else if (!navigator.onLine) {
        errorMessage = "No internet connection. Please check your network.";
      }

      // console.log removed
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
      console.groupEnd();
    }
  };

  useEffect(() => {
    // Check for stored registration or reset data
    const lastRegisteredUser = sessionStorage.getItem("lastRegisteredUser");
    if (lastRegisteredUser) {
      try {
        const { username, timestamp } = JSON.parse(lastRegisteredUser);
        // Only use data if it's less than 5 minutes old
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          setFormData((prev) => ({ ...prev, username }));
        }
        // Clear the stored data
        sessionStorage.removeItem("lastRegisteredUser");
      } catch (error) {
        console.error("Error parsing lastRegisteredUser:", error);
      }
    }

    // Check for password reset data
    const lastResetUser = sessionStorage.getItem("lastResetUser");
    if (lastResetUser) {
      try {
        const { phone, timestamp } = JSON.parse(lastResetUser);
        // Only use data if it's less than 5 minutes old
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          // We need to get the username associated with this phone number
          authService
            .getUsernameByPhone(phone)
            .then((username) => {
              if (username) {
                setFormData((prev) => ({ ...prev, username }));
              }
            })
            .catch((error) => console.error("Error getting username:", error));
        }
        // Clear the stored data
        sessionStorage.removeItem("lastResetUser");
      } catch (error) {
        console.error("Error parsing lastResetUser:", error);
      }
    }
  }, []);

  return (
    <FormCard>
      <button
        type="button"
        onClick={() => navigate("/")}
        className={styles.backArrowBtn}
        aria-label="Back to Home"
      >
        <ArrowLeft size={20} />
      </button>

      <div className={styles.authHeader}>
        <h1 className={styles.authTitle}>Welcome Back!</h1>
        <p className={styles.authSubtitle}>
          Sign in to access premium PC components
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.authForm}>
        {errors.general && (
          <div
            className={styles.errorMessage}
            style={{ marginBottom: "1rem", textAlign: "center" }}
          >
            {errors.general}
          </div>
        )}

        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>
              <User size={20} />
            </div>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleInputChange}
              className={`${styles.input} ${
                errors.username ? styles.error : ""
              }`}
              autoComplete="username"
            />
          </div>
          {errors.username && (
            <span className={styles.errorMessage}>{errors.username}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>
              <Lock size={20} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              className={`${styles.input} ${
                errors.password ? styles.error : ""
              }`}
              autoComplete="current-password"
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <span className={styles.errorMessage}>{errors.password}</span>
          )}
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>

        <div className={styles.authLinks}>
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className={styles.linkBtn}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className={styles.linkBtn}
          >
            Forgot Password?
          </button>
        </div>
      </form>
    </FormCard>
  );
};

export default Login;
