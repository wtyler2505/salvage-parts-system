import React from 'react';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  label,
  className = '',
}) => {
  if (orientation === 'vertical') {
    return (
      <div className={`inline-flex h-full items-center ${className}`}>
        <div className="h-full w-px bg-neutral-200 dark:bg-neutral-700"></div>
      </div>
    );
  }
  
  if (label) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200 dark:border-neutral-700"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white dark:bg-neutral-900 px-2 text-sm text-neutral-500 dark:text-neutral-400">
            {label}
          </span>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`h-px w-full bg-neutral-200 dark:bg-neutral-700 ${className}`}></div>
  );
};