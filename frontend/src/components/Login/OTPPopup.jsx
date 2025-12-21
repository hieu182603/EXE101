import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import styles from './OTPPopup.module.css';

const OTPPopup = ({ isOpen, onClose, onVerify, onResend, error }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [localError, setLocalError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0].focus();
      setLocalError('');
      setOtp(['', '', '', '', '', '']);
    }
  }, [isOpen]);

  // Update local error when prop error changes
  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value) || value.length > 1) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setLocalError('');

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1].focus();
    }
    
    // Prevent closing on ESC key
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Kiểm tra xem dữ liệu paste có phải là 6 số không
    if (!/^\d{6}$/.test(pastedData)) {
      setLocalError('Please paste a valid 6-digit code');
      return;
    }

    const newOtp = pastedData.split('').slice(0, 6);
    setOtp(newOtp);
    setLocalError('');
    inputRefs.current[5].focus();
  };

  const handleVerify = () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setLocalError('Please enter all 6 digits');
      return;
    }
    if (!/^\d{6}$/.test(otpString)) {
      setLocalError('OTP must contain only numbers');
      return;
    }
    setLocalError('');
    onVerify(otpString);
  };

  // Handle overlay click - do NOT close automatically
  const handleOverlayClick = (e) => {
    // Prevent closing when clicking on overlay
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle popup content click to prevent event bubbling
  const handlePopupClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.popup} onClick={handlePopupClick}>
        <div className={styles.header}>
          <h2>Mobile Phone Verification</h2>
          <button 
            className={styles.closeButton}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <p>Enter the 6-digit verification code that was sent to your phone number.</p>
        
        <div className={styles.otpContainer}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`${styles.otpInput} ${(localError || error) ? styles.error : ''}`}
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        {(localError || error) && (
          <div className={styles.errorMessage}>{localError || error}</div>
        )}

        <button 
          className={styles.verifyButton}
          onClick={handleVerify}
          disabled={otp.some(digit => !digit)}
        >
          Verify Account
        </button>

        <div className={styles.resendContainer}>
          <span>Didn't receive code?</span>
          <button className={styles.resendButton} onClick={onResend}>
            Resend
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPPopup; 