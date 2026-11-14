import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  padding = 'p-6',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-charcoal/5 shadow-card transition-all duration-200 ${
        hoverEffect ? 'hover:shadow-premium hover:-translate-y-0.5' : ''
      } ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

