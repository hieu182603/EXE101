
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthInput from '@components/ui/AuthInput';

// --- OTP Modal Component ---
const OTPModal = ({ isOpen, onClose, onVerify, email }: { isOpen: boolean; onClose: () => void; onVerify: () => void; email: string }) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-[#1a1a2e] border border-white/10 rounded-2xl p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200 text-center">
        <div className="size-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-400">
           <span className="material-symbols-outlined text-3xl">mark_email_read</span>
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Xác thực Email</h2>
        <p className="text-slate-400 text-xs mb-8">Mã OTP đã được gửi tới <b>{email}</b></p>

        <div className="flex justify-center gap-4 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="size-12 rounded-xl bg-slate-800 border border-slate-700 text-center text-xl font-bold text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
            />
          ))}
        </div>

        <button 
          onClick={onVerify}
          disabled={otp.some(d => !d)}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs rounded-xl uppercase tracking-widest shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Xác nhận
        </button>
      </div>
    </div>
  );
};

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'EMAIL' | 'OTP' | 'RESET'>('EMAIL');
  const [email, setEmail] = useState('');
  
  // Reset Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Validation Logic
  const hasLength = newPassword.length >= 8;
  const hasLower = /[a-z]/.test(newPassword);
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const strengthScore = [hasLength, hasLower, hasUpper, hasNumber].filter(Boolean).length;
  const showValidation = newPassword.length > 0;

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if(email) setStep('OTP');
  };

  const handleVerifyOtp = () => {
    setStep('RESET');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API Call
    alert("Mật khẩu đã được thay đổi thành công!");
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0f0c29] flex items-center justify-center p-4 relative overflow-hidden font-display">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[100px]"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <OTPModal isOpen={step === 'OTP'} onClose={() => setStep('EMAIL')} onVerify={handleVerifyOtp} email={email} />

      <div className="relative w-full max-w-[440px] bg-[#1a1a2e] border border-white/10 rounded-3xl p-8 shadow-2xl z-10">
        
        {step === 'EMAIL' && (
          <>
            <div className="text-center mb-8">
              <div className="size-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-purple-400 shadow-lg shadow-purple-500/10">
                <span className="material-symbols-outlined text-2xl">lock_reset</span>
              </div>
              <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Quên mật khẩu?</h1>
              <p className="text-slate-400 text-xs">Nhập email của bạn để nhận mã xác thực.</p>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-6">
              <AuthInput 
                icon="mail" 
                placeholder="Email của bạn" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs rounded-xl uppercase tracking-widest shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] transition-all active:scale-95">
                GỬI YÊU CẦU
              </button>
            </form>
          </>
        )}

        {step === 'RESET' && (
          <>
            <div className="text-center mb-8">
              <div className="size-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-lg shadow-emerald-500/10">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
              </div>
              <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Đặt lại mật khẩu</h1>
              <p className="text-slate-400 text-xs">Vui lòng nhập mật khẩu mới của bạn.</p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <AuthInput 
                icon="lock" 
                placeholder="Mật khẩu mới" 
                showEye={true} 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              {/* Password Strength Visual - Similar to Register */}
              <div className={`transition-all duration-300 overflow-hidden ${showValidation ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="flex gap-1 mb-2 px-1">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${i <= strengthScore ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                    ))}
                  </div>
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
                placeholder="Xác nhận mật khẩu" 
                showEye={true}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              
              <button className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs rounded-xl uppercase tracking-widest shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] transition-all active:scale-95">
                XÁC NHẬN ĐỔI
              </button>
            </form>
          </>
        )}

        <div className="mt-8 text-center pt-6 border-t border-white/5">
           <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-white flex items-center justify-center gap-2 group">
             <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
             Quay lại đăng nhập
           </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
