import React, { forwardRef } from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
  containerClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  description,
  error,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={`relative flex items-start ${containerClassName}`}>
      <div className="flex items-center h-5">
        <input
          ref={ref}
          type="checkbox"
          className={`
            h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-primary-600 
            focus:ring-primary-500 focus:ring-offset-0
            ${error ? 'border-error-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {(label || description) && (
        <div className="ml-3 text-sm">
          {label && (
            <label className="font-medium text-neutral-700 dark:text-neutral-300">
              {label}
            </label>
          )}
          {description && (
            <p className="text-neutral-500 dark:text-neutral-400">{description}</p>
          )}
          {error && (
            <p className="mt-1 text-sm text-error-600 dark:text-error-400">{error}</p>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';