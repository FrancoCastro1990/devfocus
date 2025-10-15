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
    primary: 'bg-accent-purple/40 border-accent-purple/60 text-white hover:bg-accent-purple/50 hover:border-accent-purple/80 active:scale-95 shadow-glass',
    secondary: 'bg-white/15 border-white/35 text-white hover:bg-white/25 hover:border-white/45 active:scale-95',
    danger: 'bg-red-500/40 border-red-500/60 text-red-100 hover:bg-red-500/50 hover:border-red-500/80 active:scale-95',
    success: 'bg-accent-emerald/40 border-accent-emerald/60 text-white hover:bg-accent-emerald/50 hover:border-accent-emerald/80 active:scale-95',
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
