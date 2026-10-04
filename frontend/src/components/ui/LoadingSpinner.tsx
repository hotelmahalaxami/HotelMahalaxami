import React from 'react';

interface Props {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClass = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

const LoadingSpinner: React.FC<Props> = ({ fullScreen = false, size = 'md' }) => {
  const spinner = (
    <div
      className={`${sizeClass[size]} animate-spin rounded-full border-2 border-gray-600 border-t-brand-500`}
      role="status"
      aria-label="Loading"
    />
  );

  if (fullScreen) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-surface">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
