
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthInput from '@components/ui/AuthInput';

interface AuthPageProps {
  initialSignUp?: boolean;
}

// --- Component OTP Modal ---
const OTPModal = ({ isOpen, onClose, onVerify }: { isOpen: boolean; onClose: () => void; onVerify: () => void }) => {
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

    // Auto focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
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
        <h2 className="text-2xl font-black text-white mb-2">Xác thực OTP</h2>
        <p className="text-slate-400 text-xs mb-8">Mã xác thực 4 số đã được gửi đến email của bạn.</p>

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

        <p className="mt-6 text-[10px] text-slate-500">
          Không nhận được mã? <button className="text-purple-400 font-bold hover:underline">Gửi lại</button>
        </p>
      </div>
    </div>
  );
};


// --- Main Auth Page Component ---
export const AuthPage: React.FC<AuthPageProps> = ({ initialSignUp = false }) => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(initialSignUp);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // State for Password Validation
  const [password, setPassword] = useState("");
  const [showOTP, setShowOTP] = useState(false);

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

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Show OTP Modal instead of direct navigate
    setShowOTP(true);
  };

  const handleVerifyOTP = () => {
    setShowOTP(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0f0c29] flex items-center justify-center p-4 relative overflow-hidden font-display">
      
      {/* --- BACK TO HOME BUTTON --- */}
      <Link to="/" className="absolute top-8 left-8 z-50 flex items-center gap-2 text-white/40 hover:text-white transition-all group">
        <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all backdrop-blur-md">
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
        </div>
        <span className="text-xs font-bold tracking-widest uppercase hidden sm:block">Back to Home</span>
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
        <OTPModal isOpen={showOTP} onClose={() => setShowOTP(false)} onVerify={handleVerifyOTP} />

        {/* --- SIGN UP FORM CONTAINER --- */}
        <div className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 ${isSignUp ? 'translate-x-[100%] opacity-100 z-50' : 'opacity-0 z-10'}`}>
          <form onSubmit={handleSignUpSubmit} className="bg-[#151525] flex flex-col items-center justify-center h-full px-8 text-center relative">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2 tracking-tight">Create Account</h1>
            <p className="text-slate-400 text-[11px] mb-6">Join us to explore premium PC components</p>

            <div className="w-full space-y-2">
              <AuthInput icon="person" placeholder="Full Name" />
              <AuthInput icon="mail" placeholder="Email Address" type="email" />
              
              <AuthInput 
                icon="lock" 
                placeholder="Password" 
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
              
              <AuthInput icon="lock_reset" placeholder="Confirm Password" showEye={true} />
            </div>

            <button className="w-full mt-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs rounded-xl uppercase tracking-widest shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] transition-all active:scale-95">
              Create Account
            </button>

            <div className="mt-5 pt-5 border-t border-white/5 w-full">
                <p className="text-[11px] text-slate-500">
                Already have an account? 
                <button type="button" onClick={handleToggle} className="text-purple-400 font-bold ml-1 hover:underline outline-none">Sign In</button>
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

            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome Back!</h1>
            <p className="text-slate-400 text-xs mb-8">Sign in to access your tech dashboard</p>

            <div className="w-full space-y-3">
              <AuthInput icon="mail" placeholder="Email Address" type="email" />
              <AuthInput icon="lock" placeholder="Password" showEye={true} />
            </div>

            <div className="w-full flex justify-between items-center mt-3 mb-6">
               <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="rounded border-slate-700 bg-slate-800 text-purple-600 focus:ring-purple-500/50 size-3.5" />
                  <span className="text-[11px] text-slate-400 group-hover:text-white transition-colors">Remember me</span>
               </label>
               <Link to="/forgot-password" className="text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors">Forgot Password?</Link>
            </div>

            <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs rounded-xl uppercase tracking-widest shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] transition-all active:scale-95">
              Sign In
            </button>

            <div className="mt-6 pt-6 border-t border-white/5 w-full">
                <p className="text-[11px] text-slate-500">
                Don't have an account? 
                <button type="button" onClick={handleToggle} className="text-purple-400 font-bold ml-1 hover:underline outline-none">Create Account</button>
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
