import React from 'react';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';

interface AlertProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  title,
  children,
  variant = 'info',
  onClose,
  className = '',
}) => {
  const variantStyles = {
    info: 'bg-info-50 text-info-700 dark:bg-info-900/20 dark:text-info-300 border-info-500',
    success: 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300 border-success-500',
    warning: 'bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-300 border-warning-500',
    error: 'bg-error-50 text-error-700 dark:bg-error-900/20 dark:text-error-300 border-error-500',
  };
  
  const variantIcons = {
    info: <Info className="h-5 w-5 text-info-500" />,
    success: <CheckCircle className="h-5 w-5 text-success-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning-500" />,
    error: <XCircle className="h-5 w-5 text-error-500" />,
  };
  
  return (
    <div className={`rounded-md p-4 border-l-4 ${variantStyles[variant]} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {variantIcons[variant]}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium">{title}</h3>
          )}
          <div className={`text-sm ${title ? 'mt-2' : ''}`}>
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={`
                  inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${variant === 'info' ? 'text-info-500 hover:bg-info-100 focus:ring-info-500' : ''}
                  ${variant === 'success' ? 'text-success-500 hover:bg-success-100 focus:ring-success-500' : ''}
                  ${variant === 'warning' ? 'text-warning-500 hover:bg-warning-100 focus:ring-warning-500' : ''}
                  ${variant === 'error' ? 'text-error-500 hover:bg-error-100 focus:ring-error-500' : ''}
                `}
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};