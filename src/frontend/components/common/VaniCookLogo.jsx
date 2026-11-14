import React from 'react';
import { Link } from 'react-router-dom';

/**
 * VaniCook Brand Identity Mark & Wordmark
 * Combines:
 * 1. Culinary flame warmth (Terracotta & Leaf)
 * 2. Harmonic speech wave arcs (Vani Voice AI)
 * 3. Connected circular neighbourhood node
 */
export const VaniCookMark = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    {/* Outer subtle network ring */}
    <circle
      cx="20"
      cy="20"
      r="18.5"
      stroke="currentColor"
      strokeOpacity="0.15"
      strokeWidth="1.2"
      strokeDasharray="2 3"
    />

    {/* Primary Forest & Leaf Voice Wave Arcs */}
    <path
      d="M28 14C30.5 16.5 31.5 20 30.5 23.5"
      stroke="#A5BE83"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M32.5 11C36 15 37 21 35.5 26"
      stroke="#A5BE83"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeOpacity="0.7"
    />

    {/* Organic Culinary Flame with Community Core */}
    <path
      d="M20 7C20 7 24 12.5 24 17.5C24 20.8 21.8 23.2 19.5 23.5C18.2 21.8 18 19.5 18.8 17.5C16.8 19 15.5 21.2 15.5 23.8C15.5 27.5 18.2 30.5 22 30.5C26.5 30.5 30 26.8 30 22C30 16.5 24.5 11 20 7Z"
      fill="currentColor"
    />

    {/* Terracotta Hearth Spark / Core Voice Node */}
    <circle cx="21" cy="22" r="3.2" fill="#C47755" />
    <circle cx="12" cy="24" r="2.2" fill="#A5BE83" />
    <path
      d="M12 24C12 20 15 17 18 16"
      stroke="#C47755"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="1.5 2"
    />
  </svg>
);

export const VaniCookLogo = ({
  size = 'md',
  variant = 'default', // 'default' | 'light' | 'dark'
  showTagline = false,
  to = '/',
  className = '',
}) => {
  const sizeMap = {
    sm: { mark: 26, text: 'text-lg', tag: 'text-[9px]' },
    md: { mark: 34, text: 'text-2xl', tag: 'text-[10px]' },
    lg: { mark: 42, text: 'text-3xl', tag: 'text-xs' },
    xl: { mark: 52, text: 'text-4xl', tag: 'text-sm' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const textColor =
    variant === 'light'
      ? 'text-white'
      : variant === 'dark'
      ? 'text-[#102B21]'
      : 'text-forest';

  const accentColor =
    variant === 'light' ? 'text-fresh' : 'text-leaf-dark';

  const taglineColor =
    variant === 'light' ? 'text-white/70' : 'text-charcoal-muted';

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-300 ${
          variant === 'light'
            ? 'bg-forest-deep text-white border border-white/10'
            : 'bg-forest text-fresh shadow-soft'
        }`}
      >
        <VaniCookMark size={22} className="text-white" />
      </div>

      <div className="flex flex-col">
        <span
          className={`font-serif tracking-tight leading-none ${currentSize.text} ${textColor}`}
        >
          Vani<span className={accentColor}>Cook</span>
        </span>
        {showTagline && (
          <span
            className={`font-sans tracking-wide uppercase font-medium mt-0.5 ${currentSize.tag} ${taglineColor}`}
          >
            Your Neighbourhood Cook
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
};

export default VaniCookLogo;

