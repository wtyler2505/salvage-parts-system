import React from 'react';

interface TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'body-sm' | 'body-xs' | 'caption' | 'overline';
  weight?: 'normal' | 'medium' | 'semibold';
  color?: 'default' | 'muted' | 'primary' | 'success' | 'warning' | 'error';
  align?: 'left' | 'center' | 'right';
  truncate?: boolean;
  className?: string;
  as?: React.ElementType;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  weight = 'normal',
  color = 'default',
  align = 'left',
  truncate = false,
  className = '',
  as,
  ...props
}) => {
  const variantClasses = {
    h1: 'text-4xl leading-tight',
    h2: 'text-3xl leading-tight',
    h3: 'text-2xl leading-tight',
    h4: 'text-xl leading-snug',
    h5: 'text-lg leading-snug',
    h6: 'text-base leading-snug',
    body: 'text-base leading-normal',
    'body-sm': 'text-sm leading-normal',
    'body-xs': 'text-xs leading-normal',
    caption: 'text-xs leading-tight',
    overline: 'text-xs uppercase tracking-wider leading-tight',
  };
  
  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
  };
  
  const colorClasses = {
    default: 'text-neutral-900 dark:text-neutral-100',
    muted: 'text-neutral-500 dark:text-neutral-400',
    primary: 'text-primary-600 dark:text-primary-400',
    success: 'text-success-600 dark:text-success-400',
    warning: 'text-warning-600 dark:text-warning-400',
    error: 'text-error-600 dark:text-error-400',
  };
  
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  
  // Determine the element to render based on variant or as prop
  const Component = as || (
    variant === 'h1' ? 'h1' :
    variant === 'h2' ? 'h2' :
    variant === 'h3' ? 'h3' :
    variant === 'h4' ? 'h4' :
    variant === 'h5' ? 'h5' :
    variant === 'h6' ? 'h6' : 'p'
  );
  
  return (
    <Component
      className={`
        ${variantClasses[variant]}
        ${weightClasses[weight]}
        ${colorClasses[color]}
        ${alignClasses[align]}
        ${truncate ? 'truncate' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
};

// Heading component for convenience
interface HeadingProps extends Omit<TextProps, 'variant'> {
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export const Heading: React.FC<HeadingProps> = ({
  children,
  level,
  weight = 'semibold',
  ...rest
}) => {
  const variant = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  
  return (
    <Text variant={variant} weight={weight} {...rest}>
      {children}
    </Text>
  );
};