import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, Lock, Eye, EyeOff, X, Mail } from "lucide-react";
import FormCard from "./FormCard";
import OTPPopup from "./OTPPopup";
import styles from "./SignUp.module.css";
import { authService } from "../../services/authService";

const SignUp = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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
          setPendingSignup(parsed.email);
          setHashedPassword(parsed.hashedPassword);
          setFormData((prev) => ({
            ...prev,
            username: parsed.username,
            email: parsed.email,
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
  const saveRegistrationState = (email, username, hashedPassword) => {
    const registrationData = {
      email,
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

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "", requirements: [] };

    let strength = 0;
    const requirements = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    // Calculate strength (0-5)
    if (requirements.length) strength++;
    if (requirements.lowercase) strength++;
    if (requirements.uppercase) strength++;
    if (requirements.number) strength++;
    if (requirements.special) strength++;

    const strengthColors = {
      0: "#ef4444", // red
      1: "#f97316", // orange
      2: "#eab308", // yellow
      3: "#3b82f6", // blue
      4: "#22c55e", // green
      5: "#16a34a", // dark green
    };

    return {
      strength,
      color: strengthColors[strength] || "#ef4444",
      requirements,
    };
  };

  const validateField = (name, value) => {
    switch (name) {
      case "username":
        if (!value.trim()) return "Username is required";
        if (value.length < 3) return "Username must be at least 3 characters";
        return undefined;

      case "email":
        if (!value.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Please enter a valid email address";
        return undefined;

      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter";
        if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
        if (!/\d/.test(value)) return "Password must contain at least one number";
        return undefined;

      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return undefined;

      default:
        return undefined;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

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
      const registrationData = {
        username: formData.username,
        email: formData.email.trim(),
        password: formData.password,
        roleSlug: "customer",
      };

      const response = await authService.register(registrationData);

      // Backend trả về: { account, message }
      // Kiểm tra response có message chứa "otp" hoặc có account object
      if (
        (response && response.message && 
          typeof response.message === "string" &&
          response.message.toLowerCase().includes("otp")) ||
        (response && response.account)
      ) {
        setPendingSignup(formData.email);
        // Backend không trả về password (bảo mật), sử dụng password từ form
        setHashedPassword(formData.password);
        setShowOTPPopup(true);
        setErrors({});

        // Save state to localStorage for recovery
        saveRegistrationState(
          formData.email,
          formData.username,
          formData.password
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

      // Check for network errors
      if (error.message === "Network Error" || error.code === "ERR_CONNECTION_REFUSED" || error.code === "ECONNREFUSED") {
        errorMessage = "Cannot connect to server. Please make sure the backend server is running.";
      } else if (error.message && error.message.includes("phone number")) {
        // Handle old validation error message
        errorMessage = "Please check your registration data. Email is required instead of phone number.";
      } else if (error.response?.status === 409) {
        errorMessage = "Username or email already registered";
      } else if (error.response?.status === 400) {
        // Handle validation errors
        const errorData = error.response.data;
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join(", ");
        } else {
          errorMessage = errorData?.message || "Invalid input format. Please check your registration data.";
        }
        console.error("Validation errors:", errorData);
      } else if (error.response?.status === 500) {
        // Lỗi server - có thể là lỗi gửi email OTP
        const serverMessage = error.response.data?.message || "";
        if (serverMessage.toLowerCase().includes("smtp") || 
            serverMessage.toLowerCase().includes("email") ||
            serverMessage.toLowerCase().includes("failed to send")) {
          errorMessage = "Không thể gửi email OTP. Vui lòng kiểm tra email của bạn hoặc thử lại sau.";
        } else {
          errorMessage = serverMessage || "Server error. Please try again later.";
        }
      } else if (!navigator.onLine) {
        errorMessage = "No internet connection. Please check your network.";
      } else if (error.message) {
        // Use the error message if available
        errorMessage = error.message;
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
        email: pendingSignup,
        otp: otp,
        password: hashedPassword,
        username: formData.username,
        roleSlug: "customer",
      });

      // console.log removed

      // Store registration data for login page
      sessionStorage.setItem(
        "lastRegisteredUser",
        JSON.stringify({
          email: formData.email,
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
    // Try to get email from current state or localStorage
    let emailToResend = pendingSignup;
    // console.log removed

    if (!emailToResend) {
      // console.log removed
      const savedRegistration = localStorage.getItem("pendingRegistration");
      if (savedRegistration) {
        try {
          const parsed = JSON.parse(savedRegistration);

          if (Date.now() - parsed.timestamp < 10 * 60 * 1000) {
            emailToResend = parsed.email;
            setPendingSignup(parsed.email); // Update state
            // console.log removed
          }
        } catch (error) {
          // Error parsing saved registration
        }
      }
    }

    if (!emailToResend) {
      setErrors({
        general: "Phiên đăng ký đã hết hạn. Vui lòng đăng ký lại từ đầu.",
      });
      setShowOTPPopup(false);
      clearRegistrationState();
      return;
    }

    try {
      const response = await authService.resendOTP({
        identifier: emailToResend,
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

        {/* Email field */}
        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>
              <Mail className={styles.iconSvg} size={18} />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Your email address"
              value={formData.email}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.email ? styles.error : ""}`}
            />
          </div>
          {errors.email && (
            <div className={styles.errorMessage}>
              <X className="w-4 h-4" />
              {errors.email}
            </div>
          )}
        </div>

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
              style={{
                borderColor: formData.password
                  ? getPasswordStrength(formData.password).color
                  : undefined,
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.passwordToggle}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className={styles.passwordStrength}>
              <div className={styles.strengthBars}>
                {[1, 2, 3, 4, 5].map((level) => {
                  const passwordStrength = getPasswordStrength(formData.password);
                  const isActive = level <= passwordStrength.strength;
                  return (
                    <div
                      key={level}
                      className={styles.strengthBar}
                      style={{
                        backgroundColor: isActive
                          ? passwordStrength.color
                          : "rgba(255, 255, 255, 0.2)",
                        transition: "all 0.3s ease",
                      }}
                    />
                  );
                })}
              </div>
              <div className={styles.passwordRequirements}>
                <div
                  style={{
                    fontSize: "11px",
                    color: "rgba(255, 255, 255, 0.7)",
                    marginTop: "8px",
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: "12px",
                    alignItems: "center",
                  }}
                >
                  {(() => {
                    const req = getPasswordStrength(formData.password).requirements;
                    return (
                      <>
                        <span
                          style={{
                            color: req.length ? "#22c55e" : "rgba(255, 255, 255, 0.5)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {req.length ? "✓" : "○"} 8+ chars
                        </span>
                        <span
                          style={{
                            color: req.lowercase ? "#22c55e" : "rgba(255, 255, 255, 0.5)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {req.lowercase ? "✓" : "○"} Lowercase
                        </span>
                        <span
                          style={{
                            color: req.uppercase ? "#22c55e" : "rgba(255, 255, 255, 0.5)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {req.uppercase ? "✓" : "○"} Uppercase
                        </span>
                        <span
                          style={{
                            color: req.number ? "#22c55e" : "rgba(255, 255, 255, 0.5)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {req.number ? "✓" : "○"} Number
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

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
              style={{
                borderColor:
                  formData.confirmPassword && formData.confirmPassword === formData.password
                    ? "#22c55e"
                    : formData.confirmPassword && formData.confirmPassword !== formData.password
                    ? "#ef4444"
                    : undefined,
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={styles.passwordToggle}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {formData.confirmPassword &&
            formData.confirmPassword === formData.password &&
            !errors.confirmPassword && (
              <div className={styles.successMessage}>
                <span style={{ fontSize: "12px" }}>✓ Passwords match</span>
              </div>
            )}
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
