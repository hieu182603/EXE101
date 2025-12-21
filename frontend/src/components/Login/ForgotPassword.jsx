import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, ArrowLeft } from "lucide-react";
import FormCard from "./FormCard";
import OTPPopup from "./OTPPopup";
import styles from "./ForgotPassword.module.css";
import { authService, verifyOtpForCustomer } from "../../services/authService";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingReset, setPendingReset] = useState(null);
  const [verifiedOTP, setVerifiedOTP] = useState(null);
  const [showOTPPopup, setShowOTPPopup] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case "username":
        if (!value.trim()) return "Username is required";
        if (value.length < 3) return "Username must be at least 3 characters";
        return undefined;

      case "newPassword":
        if (!value.trim()) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        if (!/\d/.test(value))
          return "Password must contain at least one number";
        return undefined;

      case "confirmPassword":
        if (!value.trim()) return "Confirm password is required";
        if (value !== formData.newPassword) return "Passwords do not match";
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

    const error = validateField(name, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      const usernameError = validateField("username", formData.username);
      if (usernameError) {
        setErrors({ username: usernameError });
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await authService.requestPasswordReset(
          formData.username
        );

        if (response && response.success) {
          setPendingReset(formData.username);
          setShowOTPPopup(true);
          setErrors({});
        } else if (
          response &&
          typeof response.message === "string" &&
          response.message.toLowerCase().includes("otp")
        ) {
          setPendingReset(formData.username);
          setShowOTPPopup(true);
          setErrors({});
        } else {
          throw new Error("Failed to send OTP");
        }
      } catch (error) {
        setErrors({
          username:
            error.response?.data?.message ||
            "Failed to send OTP. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else if (step === 2) {
      // Validate password fields for step 2
      const newPasswordError = validateField(
        "newPassword",
        formData.newPassword
      );
      const confirmPasswordError = validateField(
        "confirmPassword",
        formData.confirmPassword
      );

      if (newPasswordError || confirmPasswordError) {
        setErrors({
          newPassword: newPasswordError,
          confirmPassword: confirmPasswordError,
        });
        return;
      }

      if (!verifiedOTP) {
        setErrors({ general: "OTP verification required" });
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await authService.verifyResetOTP({
          username: pendingReset,
          otp: verifiedOTP,
          newPassword: formData.newPassword,
        });

        if (response && response.success) {
          // Store the username for login page
          sessionStorage.setItem(
            "lastResetUser",
            JSON.stringify({
              username: formData.username,
              timestamp: Date.now(),
            })
          );
          setShowSuccessDialog(true); // Show success dialog
          return;
        } else {
          throw new Error("Failed to reset password");
        }
      } catch (error) {
        setErrors({
          general:
            error.response?.data?.message ||
            "Failed to reset password. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleVerifyOTP = async (otp) => {
    if (!pendingReset) {
      setErrors({ general: "No pending reset session" });
      return;
    }
    setOtpError("");
    try {
      // Call OTP verification API
      const response = await verifyOtpForCustomer(pendingReset, otp);
      const isVerified =
        response &&
        (response.success === true || response.code === 200) &&
        response.data &&
        response.data.verified &&
        response.data.verified.data === true;
      if (isVerified) {
        // OTP is valid, proceed
        setVerifiedOTP(otp);
        setShowOTPPopup(false);
        setStep(2);
        setErrors({});
      } else {
        // OTP is invalid, show error in OTPPopup
        setOtpError("OTP is wrong or is expired");
      }
    } catch (error) {
      setOtpError(
        error?.message || "OTP verification failed. Please try again."
      );
    }
  };

  const handleResendOTP = async () => {
    if (!pendingReset) {
      setErrors({ general: "No pending reset session" });
      return;
    }

    try {
      const response = await authService.resendOTP({
        username: pendingReset,
        isForLogin: true,
      });

      if (response && response.success) {
        setErrors({ general: "New OTP sent to your phone" });
      } else {
        throw new Error("Failed to resend OTP");
      }
    } catch (error) {
      setErrors({ general: "Failed to resend OTP. Please try again." });
    }
  };

  return (
    <>
      <FormCard>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className={styles.backArrowBtn}
          aria-label="Back to Sign In"
        >
          <ArrowLeft size={20} />
        </button>

        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>Reset Password</h1>
          <p className={styles.authSubtitle}>
            {step === 1 && "Enter your username to reset password"}
            {step === 2 && "Enter OTP code and your new password"}
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

          {step === 1 && (
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
          )}

          {step === 2 && (
            <>
              <div className={styles.formGroup}>
                <div className={styles.inputWrapper}>
                  <div className={styles.inputIcon}>
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className={`${styles.input} ${
                      errors.newPassword ? styles.error : ""
                    }`}
                    autoComplete="new-password"
                  />
                </div>
                {errors.newPassword && (
                  <span className={styles.errorMessage}>
                    {errors.newPassword}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <div className={styles.inputWrapper}>
                  <div className={styles.inputIcon}>
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`${styles.input} ${
                      errors.confirmPassword ? styles.error : ""
                    }`}
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirmPassword && (
                  <span className={styles.errorMessage}>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Processing..."
              : step === 1
              ? "Send OTP"
              : "Reset Password"}
          </button>

          {/* Success message and button below form */}
          {showSuccessDialog && (
            <div
              style={{
                marginTop: "2rem",
                padding: "1.5rem",
                background: "#e6ffed",
                border: "1px solid #34d399",
                borderRadius: "10px",
                textAlign: "center",
                color: "#065f46",
                fontWeight: "bold",
                fontSize: "1.2rem",
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                Password Reset Successful!
              </div>
              <div
                style={{
                  marginBottom: "1rem",
                  fontWeight: "normal",
                  fontSize: "1rem",
                }}
              >
                Your password has been reset successfully.
              </div>
              <button
                style={{
                  background: "#34d399",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.75rem 1.5rem",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/login")}
              >
                Go to Login
              </button>
            </div>
          )}
        </form>

        {showOTPPopup && (
          <OTPPopup
            isOpen={showOTPPopup}
            onClose={() => {
              setShowOTPPopup(false);
              setPendingReset(null);
              setOtpError("");
            }}
            onVerify={handleVerifyOTP}
            onResend={handleResendOTP}
            error={otpError}
          />
        )}
      </FormCard>
    </>
  );
};

export default ForgotPassword;
