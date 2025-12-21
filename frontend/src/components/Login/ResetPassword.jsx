import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import FormCard from './FormCard';
import styles from './ForgotPassword.module.css';

const ResetPassword = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value, allValues = formData) => {
    switch (name) {
      case 'newPassword':
        if (!value) return 'New password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return 'Password must contain uppercase, lowercase, and number';
        }
        return undefined;
        
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== allValues.newPassword) return 'Passwords do not match';
        return undefined;
        
      default:
        return undefined;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    const error = validateField(name, value, newFormData);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }

    // Validate confirm password when new password changes
    if (name === 'newPassword' && formData.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword, newFormData);
      if (confirmError) {
        setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: undefined }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Password has been reset successfully!');
      onNavigate('login');
    } catch (error) {
      alert('Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <FormCard>
      <div className={styles.authHeader}>
        <h1 className={styles.authTitle}>Reset Password</h1>
        <p className={styles.authSubtitle}>Enter your new password</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.authForm}>
        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>
              <Lock size={20} />
            </div>
            <input
              type={showPassword.newPassword ? 'text' : 'password'}
              name="newPassword"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.newPassword ? styles.error : ''}`}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => togglePasswordVisibility('newPassword')}
            >
              {showPassword.newPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.newPassword && <span className={styles.errorMessage}>{errors.newPassword}</span>}
        </div>

        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>
              <Lock size={20} />
            </div>
            <input
              type={showPassword.confirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.confirmPassword ? styles.error : ''}`}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => togglePasswordVisibility('confirmPassword')}
            >
              {showPassword.confirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && <span className={styles.errorMessage}>{errors.confirmPassword}</span>}
        </div>

        <button 
          type="submit" 
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <div className={styles.authLinks}>
        <button 
          type="button" 
          className={styles.linkBtn}
          onClick={() => onNavigate('login')}
        >
          Back to Sign In
        </button>
      </div>
    </FormCard>
  );
};

export default ResetPassword; 