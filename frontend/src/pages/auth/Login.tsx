
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthInput from '@components/ui/AuthInput';
import { authService } from '@services/authService';
import { useToast } from '@contexts/ToastContext';
import { useTranslation } from '../../hooks/useTranslation';

interface AuthPageProps {
  initialSignUp?: boolean;
}

// --- Component OTP Modal ---
const OTPModal = ({ 
  isOpen, 
  onClose, 
  onVerify, 
  email,
  onResend 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onVerify: (otp: string) => Promise<void>;
  email?: string;
  onResend?: () => Promise<void>;
}) => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Reset OTP when modal opens
      setOtp(['', '', '', '', '', '']);
      setError(null);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);
    setError(null);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError(t('auth.otp.enterOtp'));
      return;
    }
    
    setIsVerifying(true);
    setError(null);
    try {
      await onVerify(otpCode);
    } catch (err: any) {
      setError(err.message || t('auth.otp.invalidOtp'));
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!onResend) return;
    setIsResending(true);
    setError(null);
    try {
      await onResend();
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message || 'Không thể gửi lại OTP');
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-[#1a1a2e] border border-white/10 rounded-2xl p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200 text-center">
        <div className="size-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-400">
           <span className="material-symbols-outlined text-3xl">lock_open</span>
        </div>
        <h2 className="text-2xl font-black text-white mb-2">{t('auth.otp.title')}</h2>
        <p className="text-slate-400 text-xs mb-8">
          {t('auth.otp.subtitle', { email: email || '' })}
        </p>

        <div className="flex justify-center gap-3 mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="size-12 rounded-xl bg-slate-800 border border-slate-700 text-center text-xl font-bold text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
            />
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-xs mb-4">{error}</p>
        )}

        <button 
          onClick={handleVerify}
          disabled={otp.some(d => !d) || isVerifying}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs rounded-xl uppercase tracking-widest shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? t('auth.otp.verifying') : t('auth.otp.verify')}
        </button>

        {onResend && (
            <p className="mt-6 text-[10px] text-slate-500">
            { /* keep surrounding question as-is for now, only translate button */ }
            {t('auth.otp.noCodeQuestion', { defaultValue: 'Không nhận được mã?' })}
            <button 
              onClick={handleResend}
              disabled={isResending}
              className="text-purple-400 font-bold hover:underline disabled:opacity-50"
            >
              {isResending ? t('auth.otp.resending') : t('auth.otp.resend')}
            </button>
          </p>
        )}
      </div>
    </div>
  );
};


// --- Main Auth Page Component ---
export const AuthPage: React.FC<AuthPageProps> = ({ initialSignUp = false }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(initialSignUp);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // State for Sign Up Form
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationData, setRegistrationData] = useState<{
    username: string;
    email: string;
    password: string;
  } | null>(null);

  // State for Sign In Form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Validation Logic
  const hasLength = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  // Calculate Strength Score (0 to 4)
  const strengthScore = [hasLength, hasLower, hasUpper, hasNumber].filter(Boolean).length;
  const showValidation = password.length > 0;

  useEffect(() => {
    setIsSignUp(initialSignUp);
  }, [initialSignUp]);

  const handleToggle = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsSignUp(!isSignUp);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const result = await authService.login({
        email: loginEmail,
        password: loginPassword
      });
      // Login successful - navigate to home
      toast.showSuccess(t('auth.login.loginSuccess'));
      navigate('/');
    } catch (error: any) {
      toast.showError(error.message || t('auth.login.loginFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!username || !email || !password || !confirmPassword) {
      toast.showWarning(t('auth.validation.required'));
      return;
    }

    if (password !== confirmPassword) {
      toast.showError(t('auth.validation.passwordMismatch'));
      return;
    }

    if (!hasLength || !hasLower || !hasUpper || !hasNumber) {
      toast.showError(t('auth.validation.passwordRequirements'));
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Validate username format (only letters, numbers, underscores, hyphens)
      const usernameRegex = /^[a-zA-Z0-9_-]+$/;
      if (!usernameRegex.test(username.trim())) {
        toast.showError(t('auth.validation.usernameFormat'));
        return;
      }

      if (username.trim().length < 3 || username.trim().length > 30) {
        toast.showError(t('auth.validation.usernameLength'));
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        toast.showError(t('auth.validation.invalidEmail'));
        return;
      }

      // Call register API to send OTP
      await authService.register({
        username: username.trim(),
        email: email.trim(),
        password: password,
        roleSlug: 'customer'
      });
      
      // Save registration data for OTP verification
      setRegistrationData({
        username: username.trim(),
        email: email.trim(),
        password: password
      });
      
      // Show success message
      toast.showSuccess(t('auth.register.otpSent'));
      
      // Show OTP Modal
      setShowOTP(true);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Extract detailed error message
      let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
      
      if (error.response?.data) {
        const data = error.response.data;
        if (data.message) {
          errorMessage = data.message;
        } else if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          errorMessage = data.errors[0];
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    if (!registrationData) {
      throw new Error('Thông tin đăng ký không hợp lệ');
    }

    try {
      setIsSubmitting(true);
      // Verify OTP and complete registration
      await authService.verifyRegister({
        username: registrationData.username,
        email: registrationData.email,
        password: registrationData.password,
        roleSlug: 'customer',
        otp: otp
      });
      
      // Registration successful
      setShowOTP(false);
      toast.showSuccess(t('auth.register.registerSuccess'));
      navigate('/');
    } catch (error: any) {
      throw error; // Let OTP modal handle the error display
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (!registrationData) return;
    
    try {
      await authService.resendOTP({
        identifier: registrationData.email,
        isForLogin: false
      });
      toast.showSuccess(t('auth.otp.resendSuccess'));
    } catch (error: any) {
      toast.showError(error.message || t('auth.otp.resendFailed'));
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0c29] flex items-center justify-center p-4 relative overflow-hidden font-display">
      
      {/* --- BACK TO HOME BUTTON --- */}
      <Link to="/" className="absolute top-8 left-8 z-50 flex items-center gap-2 text-white/40 hover:text-white transition-all group">
        <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all backdrop-blur-md">
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
        </div>
        <span className="text-xs font-bold tracking-widest uppercase hidden sm:block">{t('auth.login.backToHome')}</span>
      </Link>

      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[100px]"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      {/* Main Container */}
      <div className={`relative bg-[#1a1a2e] rounded-[24px] shadow-2xl shadow-black/50 overflow-hidden w-full max-w-[850px] min-h-[520px] z-10 border border-white/5`}>
        
        {/* --- OTP MODAL OVERLAY --- */}
        <OTPModal 
          isOpen={showOTP} 
          onClose={() => setShowOTP(false)} 
          onVerify={handleVerifyOTP}
          email={registrationData?.email}
          onResend={handleResendOTP}
        />

        {/* --- SIGN UP FORM CONTAINER --- */}
        <div className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 ${isSignUp ? 'translate-x-[100%] opacity-100 z-50' : 'opacity-0 z-10'}`}>
          <form onSubmit={handleSignUpSubmit} className="bg-[#151525] flex flex-col items-center justify-center h-full px-8 text-center relative">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2 tracking-tight">{t('auth.register.title')}</h1>
            <p className="text-slate-400 text-[11px] mb-6">{t('auth.register.subtitle')}</p>

            <div className="w-full space-y-2">
              <AuthInput 
                icon="person" 
                placeholder={t('auth.register.username')} 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <AuthInput 
                icon="mail" 
                placeholder={t('auth.register.email')} 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              
              <AuthInput 
                icon="lock" 
                placeholder={t('auth.register.password')} 
                showEye={true} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              
              {/* Password Strength Visual - Only Show When Typing */}
              <div className={`transition-all duration-300 overflow-hidden ${showValidation ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                  {/* Strength Bars */}
                  <div className="flex gap-1 mb-2 px-1">
                    {[1, 2, 3, 4].map((i) => (
                        <div 
                            key={i} 
                            className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                                i <= strengthScore ? 'bg-emerald-500' : 'bg-slate-700'
                            }`}
                        ></div>
                    ))}
                  </div>

                  {/* Validation Rules */}
                  <div className="flex justify-between px-1 mb-3 flex-wrap gap-y-1">
                    <span className={`text-[9px] flex items-center gap-1 transition-colors ${hasLength ? 'text-emerald-500' : 'text-slate-500'}`}>
                        <span className="material-symbols-outlined text-[10px]">{hasLength ? 'check' : 'circle'}</span> 8+ chars
                    </span>
                    <span className={`text-[9px] flex items-center gap-1 transition-colors ${hasLower ? 'text-emerald-500' : 'text-slate-500'}`}>
                        <span className="material-symbols-outlined text-[10px]">{hasLower ? 'check' : 'circle'}</span> Lowercase
                    </span>
                    <span className={`text-[9px] flex items-center gap-1 transition-colors ${hasUpper ? 'text-emerald-500' : 'text-slate-500'}`}>
                        <span className="material-symbols-outlined text-[10px]">{hasUpper ? 'check' : 'circle'}</span> Uppercase
                    </span>
                    <span className={`text-[9px] flex items-center gap-1 transition-colors ${hasNumber ? 'text-emerald-500' : 'text-slate-500'}`}>
                        <span className="material-symbols-outlined text-[10px]">{hasNumber ? 'check' : 'circle'}</span> Number
                    </span>
                  </div>
              </div>
              
              <AuthInput 
                icon="lock_reset" 
                placeholder={t('auth.register.confirmPassword')} 
                showEye={true}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs rounded-xl uppercase tracking-widest shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('auth.register.creating') : t('auth.register.createAccount')}
            </button>

            <div className="mt-5 pt-5 border-t border-white/5 w-full">
                <p className="text-[11px] text-slate-500">
                {t('auth.register.hasAccount')} 
                <button type="button" onClick={handleToggle} className="text-purple-400 font-bold ml-1 hover:underline outline-none">{t('auth.register.signIn')}</button>
                </p>
            </div>
          </form>
        </div>

        {/* --- SIGN IN FORM CONTAINER --- */}
        <div className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 z-20 ${isSignUp ? 'translate-x-[100%] opacity-0' : 'translate-x-0 opacity-100'}`}>
          <form onSubmit={handleSignInSubmit} className="bg-[#151525] flex flex-col items-center justify-center h-full px-10 text-center">
            
            <div className="mb-5 size-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
               <span className="material-symbols-outlined text-white text-2xl">bolt</span>
            </div>

            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">{t('auth.login.title')}</h1>
            <p className="text-slate-400 text-xs mb-8">{t('auth.login.subtitle')}</p>

            <div className="w-full space-y-3">
              <AuthInput 
                icon="mail" 
                placeholder={t('auth.login.email')} 
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <AuthInput 
                icon="lock" 
                placeholder={t('auth.login.password')} 
                showEye={true}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>

            <div className="w-full flex justify-between items-center mt-3 mb-6">
               <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="rounded border-slate-700 bg-slate-800 text-purple-600 focus:ring-purple-500/50 size-3.5" />
                  <span className="text-[11px] text-slate-400 group-hover:text-white transition-colors">{t('auth.login.rememberMe')}</span>
               </label>
               <Link to="/forgot-password" className="text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors">{t('auth.login.forgotPassword')}</Link>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs rounded-xl uppercase tracking-widest shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('auth.login.loggingIn') : t('auth.login.loginButton')}
            </button>

            <div className="mt-6 pt-6 border-t border-white/5 w-full">
                <p className="text-[11px] text-slate-500">
                {t('auth.login.noAccount')} 
                <button type="button" onClick={handleToggle} className="text-purple-400 font-bold ml-1 hover:underline outline-none">{t('auth.login.createAccount')}</button>
                </p>
            </div>
          </form>
        </div>

        {/* --- OVERLAY CONTAINER (The Moving Image) --- */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-[100] ${isSignUp ? '-translate-x-full' : ''} ${showOTP ? 'z-[10]' : ''}`}>
          
          <div className={`relative -left-full h-full w-[200%] transform transition-transform duration-700 ease-in-out ${isSignUp ? 'translate-x-1/2' : 'translate-x-0'}`}>
            
            {/* Background Image for Overlay */}
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?q=80&w=2000&auto=format&fit=crop')" }}>
               <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-[#1a1a2e]/60 to-purple-900/90 mix-blend-multiply"></div>
               <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent"></div>
            </div>

            {/* Overlay Panel: Left (Visible when Sign Up is Active) */}
            <div className={`absolute top-0 flex flex-col items-center justify-center w-1/2 h-full px-8 text-center transform transition-transform duration-700 ease-in-out ${isSignUp ? 'translate-x-0' : '-translate-x-[20%]'}`}>
              <div className="relative">
                <div className="absolute -top-10 -left-10 size-20 bg-purple-500 rounded-full blur-[50px] opacity-50"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tighter drop-shadow-lg">TechStore<span className="text-purple-400">.</span></h1>
                    <p className="text-sm text-slate-200 font-medium tracking-wide uppercase opacity-90">Premium Gear for Pros</p>
                </div>
              </div>
              
              <div className="mt-12 space-y-4 text-left max-w-xs mx-auto">
                 <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <div className="size-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300">
                        <span className="material-symbols-outlined">rocket_launch</span>
                    </div>
                    <div>
                        <p className="text-white font-bold text-xs">Fast Shipping</p>
                        <p className="text-[10px] text-slate-400">Nationwide delivery within 24h</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <div className="size-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-300">
                        <span className="material-symbols-outlined">verified_user</span>
                    </div>
                    <div>
                        <p className="text-white font-bold text-xs">Genuine Product</p>
                        <p className="text-[10px] text-slate-400">100% Authentic Warranty</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Overlay Panel: Right (Visible when Sign In is Active) */}
            <div className={`absolute top-0 right-0 flex flex-col items-center justify-center w-1/2 h-full px-8 text-center transform transition-transform duration-700 ease-in-out ${isSignUp ? 'translate-x-[20%]' : 'translate-x-0'}`}>
               <div className="relative">
                <div className="absolute -bottom-10 -right-10 size-20 bg-pink-500 rounded-full blur-[50px] opacity-50"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tighter drop-shadow-lg">Join Us<span className="text-pink-400">.</span></h1>
                    <p className="text-sm text-slate-200 font-medium tracking-wide uppercase opacity-90">Level Up Your Setup</p>
                </div>
              </div>

               <div className="mt-12 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 w-full max-w-xs">
                  <p className="text-slate-300 text-xs leading-relaxed italic">
                    "TechStore provided me with the best workstation setup I could imagine. The quality is unmatched."
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                     <img src="https://picsum.photos/50/50" alt="User" className="size-8 rounded-full border border-white/20" />
                     <div className="text-left">
                        <p className="text-white font-bold text-[10px]">Alex Designer</p>
                        <div className="flex text-yellow-400 text-[10px]">
                            <span className="material-symbols-outlined text-[10px] fill">star</span>
                            <span className="material-symbols-outlined text-[10px] fill">star</span>
                            <span className="material-symbols-outlined text-[10px] fill">star</span>
                            <span className="material-symbols-outlined text-[10px] fill">star</span>
                            <span className="material-symbols-outlined text-[10px] fill">star</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

const LoginPage: React.FC = () => {
  return <AuthPage initialSignUp={false} />;
};

export default LoginPage;
