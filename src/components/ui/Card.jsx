/**
 * Reusable Card Component
 * Provides consistent card styling and layout
 */

import React from 'react';

/**
 * Card component with consistent theme
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {boolean} props.interactive - Enable hover effects
 * @param {function} props.onClick - Click handler (enables interactive mode)
 * @param {string} props.className - Additional Tailwind classes
 */
export const Card = ({
  children,
  interactive = false,
  onClick,
  className = '',
  ...props
}) => {
  const isClickable = interactive || onClick;

  const baseStyles = 'bg-[#161b22] border border-gray-800 rounded-2xl p-6';
  const interactiveStyles = isClickable
    ? 'hover:border-purple-500/70 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-600/30'
    : '';

  return (
    <div
      className={`${baseStyles} ${interactiveStyles} ${className}`}
      onClick={onClick}
      role={isClickable ? 'button' : 'region'}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
