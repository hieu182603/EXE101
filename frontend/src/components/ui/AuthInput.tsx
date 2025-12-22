
import React, { useState } from 'react';

interface AuthInputProps {
  icon: string;
  type?: string;
  placeholder: string;
  showEye?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AuthInput = ({ icon, type = "text", placeholder, showEye = false, value, onChange }: AuthInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showEye ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative w-full mb-3 group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors pointer-events-none">
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      </div>
      <input 
        type={inputType} 
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-4 bg-slate-100 border border-transparent text-slate-900 text-sm font-medium rounded-lg focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
      />
      {showEye && (
        <button 
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
        </button>
      )}
    </div>
  );
};

export default AuthInput;
