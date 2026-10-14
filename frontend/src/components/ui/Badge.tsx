import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'forest' | 'terracotta' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, { badge: string; dot: string }> = {
  forest: {
    badge: 'bg-forest-100 text-forest-800 border-forest-200',
    dot: 'bg-forest-600',
  },
  terracotta: {
    badge: 'bg-terracotta-100 text-terracotta-800 border-terracotta-200',
    dot: 'bg-terracotta',
  },
  success: {
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-600',
  },
  warning: {
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  danger: {
    badge: 'bg-red-50 text-red-800 border-red-200',
    dot: 'bg-red-600',
  },
  neutral: {
    badge: 'bg-stone-100 text-stone-700 border-stone-200',
    dot: 'bg-stone-500',
  },
};

const sizeStyles: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-xs font-medium',
  md: 'px-2.5 py-1 text-xs font-semibold',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'forest',
  size = 'sm',
  dot = false,
  className = '',
  children,
  ...props
}) => {
  const currentVariant = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${currentVariant.badge} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${currentVariant.dot}`} />}
      {children}
    </span>
  );
};

export default Badge;
