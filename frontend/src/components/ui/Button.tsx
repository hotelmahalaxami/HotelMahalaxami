import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'forest' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'subtle-danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-terracotta text-white hover:bg-terracotta-600 active:bg-terracotta-700 focus-visible:ring-terracotta shadow-sm',
  forest: 'bg-forest text-white hover:bg-forest-900 active:bg-forest-950 focus-visible:ring-forest shadow-sm',
  secondary: 'bg-forest-50 text-forest-800 border border-forest-200 hover:bg-forest-100 focus-visible:ring-forest',
  outline: 'bg-white text-pos-text border border-pos-border hover:bg-ivory hover:border-forest-300 focus-visible:ring-forest',
  ghost: 'bg-transparent text-pos-text hover:bg-forest-50 hover:text-forest-800 focus-visible:ring-forest',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-600 shadow-sm',
  'subtle-danger': 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 focus-visible:ring-red-600',
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-2.5 py-1.5 text-xs font-medium rounded-md gap-1.5',
  md: 'px-3.5 py-2 text-sm font-medium rounded-lg gap-2',
  lg: 'px-4.5 py-2.5 text-base font-medium rounded-lg gap-2.5',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
