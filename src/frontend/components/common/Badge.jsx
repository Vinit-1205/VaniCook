import React from 'react';

export const Badge = ({
  children,
  variant = 'default', // 'default' | 'success' | 'warning' | 'info' | 'forest' | 'sage'
  size = 'sm',
  className = '',
}) => {
  const variants = {
    default: 'bg-cream-alt text-charcoal-muted border-charcoal/10',
    forest: 'bg-forest/10 text-forest border-forest/20 font-semibold',
    fresh: 'bg-fresh/25 text-forest-dark border-fresh/40 font-semibold',
    sage: 'bg-sage text-charcoal border-sage-dark/40',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    info: 'bg-sky-50 text-sky-800 border-sky-200',
  };

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};

