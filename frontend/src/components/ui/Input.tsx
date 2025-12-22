
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, icon, error, className = '', ...props }) => {
  return (
    <div className="space-y-2 w-full">
      {label && <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">
            {icon}
          </span>
        )}
        <input 
          className={`w-full h-12 bg-background-dark border border-border-dark rounded-xl text-white focus:border-primary transition-all placeholder:text-slate-700 ${icon ? 'pl-12' : 'px-4'} ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-[10px] text-red-500 font-bold">{error}</p>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="space-y-2 w-full">
      {label && <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">{label}</label>}
      <textarea 
        className={`w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary transition-all placeholder:text-slate-700 min-h-[100px] ${className}`}
        {...props}
      />
    </div>
  );
};
