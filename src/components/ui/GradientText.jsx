/**
 * Gradient Text Component
 * Reusable gradient text styling for titles and headings
 */

import React from 'react';

/**
 * GradientText component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Text content
 * @param {string} props.variant - 'primary' (default), 'secondary', 'success', 'danger'
 * @param {string} props.className - Additional Tailwind classes
 */
export const GradientText = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-purple-300 via-purple-400 to-pink-400',
    secondary: 'bg-gradient-to-r from-blue-300 to-blue-500',
    success: 'bg-gradient-to-r from-emerald-300 to-emerald-500',
    danger: 'bg-gradient-to-r from-red-300 to-red-500',
  };

  return (
    <span
      className={`text-transparent bg-clip-text ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default GradientText;
