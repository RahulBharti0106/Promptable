import React from 'react';
import { Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className, 
  disabled, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primaryHover focus:ring-primary",
    secondary: "bg-surfaceHighlight text-slate-200 hover:bg-slate-700 focus:ring-slate-500",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 focus:ring-red-500",
    ghost: "hover:bg-white/5 text-slate-400 hover:text-white"
  };

  return (
    <button 
      className={twMerge(baseStyles, variants[variant], className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};