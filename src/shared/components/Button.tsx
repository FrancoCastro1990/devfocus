import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'font-sans font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent-purple/50 rounded-xl backdrop-blur-sm border';

  const variantClasses = {
    primary: 'bg-accent-purple/20 border-accent-purple/40 text-white hover:bg-accent-purple/30 hover:border-accent-purple/60 active:scale-95 shadow-glass',
    secondary: 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30 hover:text-white active:scale-95',
    danger: 'bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30 hover:border-red-500/60 active:scale-95',
    success: 'bg-accent-emerald/20 border-accent-emerald/40 text-white hover:bg-accent-emerald/30 hover:border-accent-emerald/60 active:scale-95',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
