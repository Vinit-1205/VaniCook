import React from 'react';

export const Input = ({
  label,
  error,
  icon: Icon,
  helperText,
  className = '',
  id,
  type = 'text',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-charcoal/70 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Icon className="h-4 w-4 text-charcoal/40" aria-hidden="true" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-charcoal placeholder-charcoal/40 transition-colors focus:outline-none focus:ring-2 focus:ring-forest ${
            Icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-400'
              : 'border-charcoal/15 hover:border-charcoal/30 focus:border-forest'
          }`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-charcoal/60">{helperText}</p>
      )}
    </div>
  );
};

