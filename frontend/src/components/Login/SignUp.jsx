import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, Lock, Eye, EyeOff, X } from "lucide-react";
import FormCard from "./FormCard";
import OTPPopup from "./OTPPopup";
import styles from "./SignUp.module.css";
import { authService } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";

const SignUp = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOTPPopup, setShowOTPPopup] = useState(false);
  const [pendingSignup, setPendingSignup] = useState(null);
  const [hashedPassword, setHashedPassword] = useState(null);

  // Recovery state from localStorage on component mount
  useEffect(() => {
    const savedRegistration = localStorage.getItem("pendingRegistration");

    if (savedRegistration) {
      try {
        const parsed = JSON.parse(savedRegistration);

        // Check if not expired (10 minutes)
        if (Date.now() - parsed.timestamp < 10 * 60 * 1000) {
          setPendingSignup(parsed.phone);
          setHashedPassword(parsed.hashedPassword);
          setFormData((prev) => ({
            ...prev,
            username: parsed.username,
            phone: parsed.phone.replace("0", ""), // Convert back to 9-digit format
          }));
          setShowOTPPopup(true);
        } else {
          // Expired, clean up
          localStorage.removeItem("pendingRegistration");
        }
      } catch (error) {
        localStorage.removeItem("pendingRegistration");
      }
    }
  }, []);

  // Save registration state to localStorage
  const saveRegistrationState = (phone, username, hashedPassword) => {
    const registrationData = {
      phone,
      username,
      hashedPassword: hashedPassword,
      timestamp: Date.now(),
    };

    localStorage.setItem(
      "pendingRegistration",
      JSON.stringify(registrationData)
    );
  };

  // Clear registration state from localStorage
  const clearRegistrationState = () => {
    localStorage.removeItem("pendingRegistration");
  };

  const validateField = (name, value) => {
    switch (name) {
      case "username":
        if (!value.trim()) return "Username is required";
        if (value.length < 3) return "Username must be at least 3 characters";
        return undefined;

      case "phone":
        if (!value.trim()) return "Phone number is required";
        if (!/^\d{9}$/.test(value))
          return "Please enter a valid 9-digit phone number";
        return undefined;

      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        return undefined;

      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return undefined;

      case "name":
        if (!value.trim()) return "Name is required";
        return undefined;

      default:
        return undefined;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const phoneValue = value.replace(/\D/g, "").slice(0, 9);
      setFormData((prev) => ({ ...prev, [name]: phoneValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedPhone = "0" + formData.phone;

      const registrationData = {
        username: formData.username,
        phone: formattedPhone,
        password: formData.password,
        name: formData.name,
        roleSlug: "customer",
      };

      const response = await authService.register(registrationData);

      if (
        (response && response.success) ||
        (response &&
          typeof response.message === "string" &&
          response.message.toLowerCase().includes("otp"))
      ) {
        setPendingSignup(formattedPhone);
        // Fix: Access account from correct path in response
        const accountData = response.data?.account || response.account;
        const passwordHashed = accountData?.password || formData.password;

        setHashedPassword(passwordHashed);
        setShowOTPPopup(true);
        setErrors({});

        // Save state to localStorage for recovery
        saveRegistrationState(
          formattedPhone,
          formData.username,
          passwordHashed
        );
      } else {
        console.error("❌ Unexpected registration response:", response);
        setErrors({
          general: response?.message || "Unexpected response from server",
        });
      }
    } catch (error) {
      console.error("❌ Registration error:", {
        error,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      let errorMessage = "Registration failed. Please try again.";

      if (error.response?.status === 409) {
        errorMessage = "Username or phone number already registered";
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || "Invalid input format";
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

  const handleVerifyOTP = async (otp) => {
    console.group("🔍 [DEBUG] OTP Verification");
    // console.log removed

    if (!pendingSignup || !hashedPassword) {
      console.error("❌ Missing required data:", {
        pendingSignup,
        hasHashedPassword: !!hashedPassword,
      });
      setErrors({ general: "Missing registration data" });
      console.groupEnd();
      return;
    }

    try {
      const response = await authService.verifyRegister({
        phone: pendingSignup,
        otp: otp,
        password: hashedPassword,
        username: formData.username,
      });

      // console.log removed

      // Store registration data for login page
      sessionStorage.setItem(
        "lastRegisteredUser",
        JSON.stringify({
          username: formData.username,
          timestamp: Date.now(),
        })
      );

      // Clear registration state
      clearRegistrationState();

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("❌ OTP verification failed:", error);
      setErrors({
        general: error.response?.data?.message || "Failed to verify OTP",
      });
    }

    console.groupEnd();
  };

  const handleResendOTP = async () => {
    // Try to get phone from current state or localStorage
    let phoneToResend = pendingSignup;
    // console.log removed

    if (!phoneToResend) {
      // console.log removed
      const savedRegistration = localStorage.getItem("pendingRegistration");
      if (savedRegistration) {
        try {
          const parsed = JSON.parse(savedRegistration);

          if (Date.now() - parsed.timestamp < 10 * 60 * 1000) {
            phoneToResend = parsed.phone;
            setPendingSignup(parsed.phone); // Update state
            // console.log removed
          }
        } catch (error) {
          // Error parsing saved registration
        }
      }
    }

    if (!phoneToResend) {
      setErrors({
        general: "Phiên đăng ký đã hết hạn. Vui lòng đăng ký lại từ đầu.",
      });
      setShowOTPPopup(false);
      clearRegistrationState();
      return;
    }

    try {
      const response = await authService.resendOTP({
        phone: phoneToResend,
        isForLogin: false,
      });

      if (response && response.success) {
        alert("Mã OTP mới đã được gửi về số điện thoại của bạn");
        // Update timestamp in localStorage
        const savedRegistration = localStorage.getItem("pendingRegistration");
        if (savedRegistration) {
          const parsed = JSON.parse(savedRegistration);
          parsed.timestamp = Date.now(); // Reset timestamp
          localStorage.setItem("pendingRegistration", JSON.stringify(parsed));
        }
      } else {
        setErrors({ general: response?.message || "Failed to resend OTP" });
      }
    } catch (error) {
      setErrors({
        general:
          error.response?.data?.message ||
          "Failed to resend OTP. Please try again.",
      });
    }
  };

  // Handle popup close
  const handleCloseOTP = () => {
    setShowOTPPopup(false);
    setPendingSignup(null);
    setHashedPassword(null);
    clearRegistrationState();
  };

  return (
    <FormCard>
      <div className={styles.authHeader}>
        <h1 className={styles.authTitle}>Create Account</h1>
        <p className={styles.authSubtitle}>
          Join us to explore premium PC components
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.authForm}>
        {errors.general && (
          <div className={styles.errorMessage}>
            <X className="w-4 h-4" />
            {errors.general}
          </div>
        )}

        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>
              <User className={styles.iconSvg} size={18} />
            </div>
            <input
              type="text"
              name="username"
              placeholder="Choose your username"
              value={formData.username}
              onChange={handleInputChange}
              className={`${styles.input} ${
                errors.username ? styles.error : ""
              }`}
            />
          </div>
          {errors.username && (
            <div className={styles.errorMessage}>
              <X className="w-4 h-4" />
              {errors.username}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>
              <Phone className={styles.iconSvg} size={18} />
            </div>
            <div className={styles.prefixWrapper}>+84</div>
            <input
              type="tel"
              name="phone"
              placeholder="Enter 9 digits"
              value={formData.phone}
              onChange={handleInputChange}
              className={`${styles.input} ${styles.withPrefix} ${
                errors.phone ? styles.error : ""
              }`}
              maxLength="9"
            />
          </div>
          {errors.phone && (
            <div className={styles.errorMessage}>
              <X className="w-4 h-4" />
              {errors.phone}
            </div>
          )}
        </div>

        {/* Name field below phone */}
        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>
              <User className={styles.iconSvg} size={18} />
            </div>
            <input
              type="text"
              name="name"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.name ? styles.error : ""}`}
            />
          </div>
          {errors.name && (
            <div className={styles.errorMessage}>
              <X className="w-4 h-4" />
              {errors.name}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>
              <Lock className={styles.iconSvg} size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create your password"
              value={formData.password}
              onChange={handleInputChange}
              className={`${styles.input} ${
                errors.password ? styles.error : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.passwordToggle}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errors.password && (
            <div className={styles.errorMessage}>
              <X className="w-4 h-4" />
              {errors.password}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>
              <Lock className={styles.iconSvg} size={18} />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`${styles.input} ${
                errors.confirmPassword ? styles.error : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={styles.passwordToggle}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <div className={styles.errorMessage}>
              <X className="w-4 h-4" />
              {errors.confirmPassword}
            </div>
          )}
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className={styles.loadingWrapper}>
              <div className={styles.spinner}></div>
              Creating Account...
            </div>
          ) : (
            "CREATE ACCOUNT"
          )}
        </button>

        <div className={styles.authLinks}>
          <p className={styles.signInText}>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className={styles.signInLink}
            >
              SIGN IN
            </button>
          </p>
        </div>
      </form>

      {showOTPPopup && (
        <OTPPopup
          isOpen={showOTPPopup}
          onClose={handleCloseOTP}
          onVerify={handleVerifyOTP}
          onResend={handleResendOTP}
          error={errors.general}
        />
      )}
    </FormCard>
  );
};

export default SignUp;
