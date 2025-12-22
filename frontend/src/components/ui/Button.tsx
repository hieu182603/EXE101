
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: string;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  className = '', 
  loading,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-xl";
  
  const variants = {
    // Updated shadow color to match Indigo primary
    primary: "bg-primary text-white hover:bg-white hover:text-black shadow-lg shadow-primary/20 hover:shadow-primary/40",
    secondary: "bg-surface-accent text-white hover:bg-white/10",
    outline: "border-2 border-border-dark text-white hover:bg-white/5",
    ghost: "text-slate-400 hover:text-primary hover:bg-primary/5",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
    xl: "px-10 py-4 text-lg rounded-2xl"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {loading ? (
        <span className="animate-spin material-symbols-outlined text-[20px]">progress_activity</span>
      ) : icon && (
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      )}
      {children}
    </button>
  );
};

export default Button;
