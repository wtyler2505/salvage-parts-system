import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  bordered?: boolean;
  hoverable?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  bordered = true,
  hoverable = false,
  className = '',
}) => {
  return (
    <div
      className={`
        bg-white dark:bg-neutral-800 rounded-lg overflow-hidden
        ${bordered ? 'border border-neutral-200 dark:border-neutral-700' : ''}
        ${hoverable ? 'transition-shadow hover:shadow-md' : 'shadow-sm'}
        ${className}
      `}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          {title && <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>}
        </div>
      )}
      
      <div className="px-6 py-4">
        {children}
      </div>
      
      {footer && (
        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-850 border-t border-neutral-200 dark:border-neutral-700">
          {footer}
        </div>
      )}
    </div>
  );
};

// CardHeader component for more flexibility
interface CardHeaderProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          {title && <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>}
          {children}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
};

// CardBody component
interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};

// CardFooter component
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`px-6 py-4 bg-neutral-50 dark:bg-neutral-850 border-t border-neutral-200 dark:border-neutral-700 ${className}`}>
      {children}
    </div>
  );
};