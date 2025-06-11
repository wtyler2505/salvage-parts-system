import React, { forwardRef } from 'react';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  containerClassName?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(({
  label,
  description,
  checked,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={`relative flex items-start ${containerClassName}`}>
      <div className="flex items-center h-5">
        <label className="inline-flex items-center cursor-pointer">
          <div className="relative">
            <input
              ref={ref}
              type="checkbox"
              className="sr-only"
              checked={checked}
              {...props}
            />
            <div className={`
              w-10 h-5 bg-neutral-300 dark:bg-neutral-700 rounded-full 
              transition-colors duration-200 ease-in-out
              ${checked ? 'bg-primary-600' : ''}
              ${className}
            `}></div>
            <div className={`
              absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full 
              transition-transform duration-200 ease-in-out
              ${checked ? 'transform translate-x-5' : ''}
            `}></div>
          </div>
        </label>
      </div>
      {(label || description) && (
        <div className="ml-3 text-sm">
          {label && (
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {label}
            </span>
          )}
          {description && (
            <p className="text-neutral-500 dark:text-neutral-400">{description}</p>
          )}
        </div>
      )}
    </div>
  );
});

Switch.displayName = 'Switch';