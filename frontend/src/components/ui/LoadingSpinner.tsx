import React from 'react';

interface Props {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'forest' | 'terracotta' | 'white';
}

const sizeClass = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
};

const colorClass = {
  forest: 'border-forest-200 border-t-forest-800',
  terracotta: 'border-terracotta-200 border-t-terracotta',
  white: 'border-white/20 border-t-white',
};

const LoadingSpinner: React.FC<Props> = ({ fullScreen = false, size = 'md', color = 'forest' }) => {
  const spinner = (
    <div
      className={`${sizeClass[size]} ${colorClass[color]} animate-spin rounded-full`}
      role="status"
      aria-label="Loading"
    />
  );

  if (fullScreen) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-ivory">
        <div className="flex flex-col items-center gap-3">
          {spinner}
          <span className="text-xs font-medium text-pos-muted">Loading POS...</span>
        </div>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
