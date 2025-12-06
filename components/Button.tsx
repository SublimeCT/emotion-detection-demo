import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'secondary' | 'outline';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  icon, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "font-hud uppercase tracking-wider font-bold py-2 px-6 rounded-sm transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-sky-600 hover:bg-sky-500 text-white shadow-[0_0_15px_rgba(2,132,199,0.5)] border border-sky-400",
    danger: "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-400",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white border border-slate-500",
    outline: "bg-transparent hover:bg-sky-900/30 text-sky-400 border border-sky-500/50 hover:border-sky-400"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {/* Glitch effect overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-white/10 -translate-x-full skew-x-12 group-hover:animate-[shimmer_0.5s_infinite]"></div>
      {icon && <span className="text-lg">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
