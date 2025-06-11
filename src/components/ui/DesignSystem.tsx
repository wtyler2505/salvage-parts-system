import React from 'react';
import { 
  AlertTriangle, 
  Check, 
  Info, 
  X, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight,
  Settings,
  Search,
  Plus,
  Minus,
  Edit,
  Trash,
  Eye,
  EyeOff,
  Save,
  Download,
  Upload,
  Loader
} from 'lucide-react';

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500';
  
  const variantStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300 focus:ring-neutral-500',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500',
    danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
    warning: 'bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-500',
    info: 'bg-info-600 text-white hover:bg-info-700 focus:ring-info-500',
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500'
  };
  
  const sizeStyles = {
    sm: 'text-xs px-3 py-2 h-8',
    md: 'text-sm px-4 py-2 h-10',
    lg: 'text-base px-6 py-3 h-12'
  };
  
  const disabledStyles = 'opacity-50 cursor-not-allowed';
  
  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${(disabled || isLoading) ? disabledStyles : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader className="w-4 h-4 mr-2 animate-spin" />
      )}
      {!isLoading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
};

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`${fullWidth ? 'w-full' : ''} mb-4`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          className={`
            block h-10 px-3 py-2 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
            border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm
            placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}
            ${fullWidth ? 'w-full' : ''}
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      {helperText && !error && (
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-error-600 dark:text-error-400">{error}</p>
      )}
    </div>
  );
};

// Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  fullWidth?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  helperText,
  error,
  options,
  fullWidth = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`${fullWidth ? 'w-full' : ''} mb-4`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`
            block h-10 px-3 py-2 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
            border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm
            appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            ${error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}
            ${fullWidth ? 'w-full' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-neutral-500" />
        </div>
      </div>
      {helperText && !error && (
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-error-600 dark:text-error-400">{error}</p>
      )}
    </div>
  );
};

// Checkbox Component
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  helperText,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-4">
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          className={`
            h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-primary-600 
            focus:ring-primary-500 focus:ring-offset-0
            ${error ? 'border-error-500' : ''}
            ${className}
          `}
          {...props}
        />
        <span className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">{label}</span>
      </label>
      {helperText && !error && (
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 ml-6">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-error-600 dark:text-error-400 ml-6">{error}</p>
      )}
    </div>
  );
};

// Radio Component
interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
}

export const Radio: React.FC<RadioProps> = ({
  label,
  helperText,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-4">
      <label className="inline-flex items-center">
        <input
          type="radio"
          className={`
            h-4 w-4 border-neutral-300 dark:border-neutral-700 text-primary-600 
            focus:ring-primary-500 focus:ring-offset-0
            ${error ? 'border-error-500' : ''}
            ${className}
          `}
          {...props}
        />
        <span className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">{label}</span>
      </label>
      {helperText && !error && (
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 ml-6">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-error-600 dark:text-error-400 ml-6">{error}</p>
      )}
    </div>
  );
};

// Switch Component
interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helperText?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  label,
  helperText,
  checked,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-center">
        <label className="inline-flex items-center cursor-pointer">
          <div className="relative">
            <input
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
          {label && <span className="ml-3 text-sm text-neutral-700 dark:text-neutral-300">{label}</span>}
        </label>
      </div>
      {helperText && (
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 ml-14">{helperText}</p>
      )}
    </div>
  );
};

// Card Component
interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  footer,
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden ${className}`}>
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

// Alert Component
interface AlertProps {
  title?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  title,
  variant = 'info',
  children,
  onClose,
  className = '',
}) => {
  const variantStyles = {
    info: 'bg-info-50 text-info-700 dark:bg-info-900/20 dark:text-info-300 border-info-500',
    success: 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300 border-success-500',
    warning: 'bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-300 border-warning-500',
    error: 'bg-error-50 text-error-700 dark:bg-error-900/20 dark:text-error-300 border-error-500'
  };
  
  const variantIcons = {
    info: <Info className="h-5 w-5 text-info-500" />,
    success: <Check className="h-5 w-5 text-success-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning-500" />,
    error: <X className="h-5 w-5 text-error-500" />
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

// Badge Component
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
    secondary: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300',
    success: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300',
    danger: 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-300',
    warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300',
    info: 'bg-info-100 text-info-800 dark:bg-info-900/30 dark:text-info-300'
  };
  
  const sizeStyles = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2.5 py-0.5'
  };
  
  return (
    <span className={`
      inline-flex items-center font-medium rounded-full
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${className}
    `}>
      {children}
    </span>
  );
};

// Tooltip Component
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
}) => {
  const positionStyles = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-1',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-1',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-1',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-1'
  };
  
  const arrowStyles = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-neutral-900 dark:border-t-neutral-700 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-neutral-900 dark:border-b-neutral-700 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-neutral-900 dark:border-l-neutral-700 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-neutral-900 dark:border-r-neutral-700 border-t-transparent border-b-transparent border-l-transparent'
  };
  
  return (
    <div className="relative group inline-block">
      {children}
      <div className={`
        absolute z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100
        transition-opacity duration-200 bg-neutral-900 dark:bg-neutral-700 text-white
        text-xs rounded py-1 px-2 whitespace-nowrap
        ${positionStyles[position]}
        ${className}
      `}>
        {content}
        <div className={`
          absolute w-0 h-0 border-4
          ${arrowStyles[position]}
        `}></div>
      </div>
    </div>
  );
};

// Spinner Component
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };
  
  const colorStyles = {
    primary: 'text-primary-600 dark:text-primary-500',
    secondary: 'text-neutral-600 dark:text-neutral-400',
    white: 'text-white'
  };
  
  return (
    <svg
      className={`animate-spin ${sizeStyles[size]} ${colorStyles[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};

// Tabs Component
interface TabProps {
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabProps[];
  activeTab: number;
  onChange: (index: number) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  className = '',
}) => {
  const variantStyles = {
    default: {
      container: 'border-b border-neutral-200 dark:border-neutral-700',
      tab: (isActive: boolean) => `
        py-2 px-4 text-sm font-medium border-b-2 -mb-px
        ${isActive 
          ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
          : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300'}
      `
    },
    pills: {
      container: 'space-x-2',
      tab: (isActive: boolean) => `
        py-2 px-4 text-sm font-medium rounded-full
        ${isActive 
          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' 
          : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-300 dark:hover:bg-neutral-800'}
      `
    },
    underline: {
      container: '',
      tab: (isActive: boolean) => `
        py-2 px-1 mx-3 text-sm font-medium border-b-2
        ${isActive 
          ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
          : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300'}
      `
    }
  };
  
  return (
    <div className={`${className}`}>
      <div className={`flex ${variantStyles[variant].container}`}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`
              flex items-center transition-colors
              ${variantStyles[variant].tab(index === activeTab)}
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            onClick={() => !tab.disabled && onChange(index)}
            disabled={tab.disabled}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className = '',
}) => {
  if (!isOpen) return null;
  
  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-neutral-500 bg-opacity-75"
          aria-hidden="true"
          onClick={onClose}
        ></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className={`
          inline-block align-bottom bg-white dark:bg-neutral-800 rounded-lg text-left 
          overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle 
          w-full ${sizeStyles[size]} ${className}
        `}>
          {title && (
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">{title}</h3>
                <button
                  type="button"
                  className="text-neutral-400 hover:text-neutral-500 focus:outline-none focus:text-neutral-500"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
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
      </div>
    </div>
  );
};

// Dropdown Component
interface DropdownItemProps {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItemProps[];
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'left',
  className = '',
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div className={`
          origin-top-${align} absolute ${align}-0 mt-2 w-56 rounded-md shadow-lg 
          bg-white dark:bg-neutral-800 ring-1 ring-black ring-opacity-5 focus:outline-none
          z-10 ${className}
        `}>
          <div className="py-1" role="menu" aria-orientation="vertical">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!item.disabled && item.onClick) {
                    item.onClick();
                    setIsOpen(false);
                  }
                }}
                className={`
                  ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${item.danger ? 'text-error-600 dark:text-error-400' : 'text-neutral-700 dark:text-neutral-300'}
                  group flex items-center w-full px-4 py-2 text-sm
                  hover:bg-neutral-100 dark:hover:bg-neutral-700
                `}
                role="menuitem"
                disabled={item.disabled}
              >
                {item.icon && <span className="mr-3 h-5 w-5">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Accordion Component
interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  defaultOpen = false,
  icon,
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  
  return (
    <div className="border-b border-neutral-200 dark:border-neutral-700">
      <button
        className="flex justify-between items-center w-full py-4 px-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          {icon && <span className="mr-3">{icon}</span>}
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-neutral-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-neutral-500" />
        )}
      </button>
      {isOpen && (
        <div className="pb-4 px-4">
          {children}
        </div>
      )}
    </div>
  );
};

export const Accordion: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`border border-neutral-200 dark:border-neutral-700 rounded-md ${className}`}>
      {children}
    </div>
  );
};

// Pagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first, last, and pages around current
      const leftSiblingIndex = Math.max(currentPage - 1, 1);
      const rightSiblingIndex = Math.min(currentPage + 1, totalPages);
      
      const showLeftDots = leftSiblingIndex > 2;
      const showRightDots = rightSiblingIndex < totalPages - 1;
      
      if (!showLeftDots && showRightDots) {
        // Show first few pages
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push('dots');
        pages.push(totalPages);
      } else if (showLeftDots && !showRightDots) {
        // Show last few pages
        pages.push(1);
        pages.push('dots');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else if (showLeftDots && showRightDots) {
        // Show pages around current
        pages.push(1);
        pages.push('dots');
        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
          pages.push(i);
        }
        pages.push('dots');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  return (
    <nav className={`flex items-center justify-between ${className}`}>
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            relative inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-700
            text-sm font-medium rounded-md text-neutral-700 dark:text-neutral-300
            ${currentPage === 1 
              ? 'bg-neutral-100 dark:bg-neutral-800 cursor-not-allowed' 
              : 'bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700'}
          `}
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            ml-3 relative inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-700
            text-sm font-medium rounded-md text-neutral-700 dark:text-neutral-300
            ${currentPage === totalPages 
              ? 'bg-neutral-100 dark:bg-neutral-800 cursor-not-allowed' 
              : 'bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700'}
          `}
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`
                relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-300 dark:border-neutral-700
                bg-white dark:bg-neutral-800 text-sm font-medium text-neutral-500 dark:text-neutral-400
                ${currentPage === 1 ? 'cursor-not-allowed' : 'hover:bg-neutral-50 dark:hover:bg-neutral-700'}
              `}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {getPageNumbers().map((page, index) => (
              page === 'dots' ? (
                <span
                  key={`dots-${index}`}
                  className="relative inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page as number)}
                  className={`
                    relative inline-flex items-center px-4 py-2 border text-sm font-medium
                    ${currentPage === page 
                      ? 'z-10 bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-600 dark:text-primary-400' 
                      : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700'}
                  `}
                >
                  {page}
                </button>
              )
            ))}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`
                relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-300 dark:border-neutral-700
                bg-white dark:bg-neutral-800 text-sm font-medium text-neutral-500 dark:text-neutral-400
                ${currentPage === totalPages ? 'cursor-not-allowed' : 'hover:bg-neutral-50 dark:hover:bg-neutral-700'}
              `}
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </nav>
  );
};

// Avatar Component
interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  initials,
  size = 'md',
  shape = 'circle',
  className = '',
}) => {
  const sizeStyles = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl'
  };
  
  const shapeStyles = {
    circle: 'rounded-full',
    square: 'rounded-md'
  };
  
  return (
    <div className={`
      inline-flex items-center justify-center bg-primary-100 dark:bg-primary-900/30
      text-primary-800 dark:text-primary-300 font-medium
      ${sizeStyles[size]}
      ${shapeStyles[shape]}
      ${className}
    `}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${shapeStyles[shape]} h-full w-full object-cover`}
        />
      ) : (
        <span>{initials || alt.charAt(0)}</span>
      )}
    </div>
  );
};

// Progress Component
interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  label,
  showValue = false,
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const percentage = Math.round((value / max) * 100);
  
  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };
  
  const colorStyles = {
    primary: 'bg-primary-600',
    success: 'bg-success-600',
    warning: 'bg-warning-500',
    error: 'bg-error-600'
  };
  
  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</div>}
          {showValue && <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{percentage}%</div>}
        </div>
      )}
      <div className={`w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`${colorStyles[color]} rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// Skeleton Component
interface SkeletonProps {
  height?: string;
  width?: string;
  circle?: boolean;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  height = '1rem',
  width = '100%',
  circle = false,
  className = '',
}) => {
  return (
    <div
      className={`
        animate-pulse bg-neutral-200 dark:bg-neutral-700
        ${circle ? 'rounded-full' : 'rounded'}
        ${className}
      `}
      style={{ height, width }}
    ></div>
  );
};

// Design System Demo Component
export const DesignSystemDemo: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState(0);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-8">Design System</h1>
      
      <Tabs
        tabs={[
          { label: 'Colors', icon: <Palette className="w-4 h-4" /> },
          { label: 'Typography', icon: <Type className="w-4 h-4" /> },
          { label: 'Components', icon: <Layers className="w-4 h-4" /> }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-8"
      />
      
      {activeTab === 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {['primary', 'neutral', 'success', 'warning', 'error', 'info'].map(color => (
              <div key={color} className="space-y-2">
                <h3 className="text-sm font-medium capitalize">{color}</h3>
                <div className="space-y-1">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                    <div key={shade} className="flex items-center">
                      <div 
                        className={`w-6 h-6 rounded mr-2 bg-${color}-${shade}`}
                        style={{ backgroundColor: `var(--color-${color}-${shade})` }}
                      ></div>
                      <span className="text-xs">{shade}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Typography</h2>
          <div className="space-y-4 mb-8">
            <div>
              <h1 className="text-4xl font-semibold">Heading 1</h1>
              <p className="text-sm text-neutral-500">font-size: var(--font-size-4xl)</p>
            </div>
            <div>
              <h2 className="text-3xl font-semibold">Heading 2</h2>
              <p className="text-sm text-neutral-500">font-size: var(--font-size-3xl)</p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold">Heading 3</h3>
              <p className="text-sm text-neutral-500">font-size: var(--font-size-2xl)</p>
            </div>
            <div>
              <h4 className="text-xl font-semibold">Heading 4</h4>
              <p className="text-sm text-neutral-500">font-size: var(--font-size-xl)</p>
            </div>
            <div>
              <h5 className="text-lg font-semibold">Heading 5</h5>
              <p className="text-sm text-neutral-500">font-size: var(--font-size-lg)</p>
            </div>
            <div>
              <h6 className="text-base font-semibold">Heading 6</h6>
              <p className="text-sm text-neutral-500">font-size: var(--font-size-base)</p>
            </div>
            <div>
              <p className="text-base">Body text (base)</p>
              <p className="text-sm text-neutral-500">font-size: var(--font-size-base)</p>
            </div>
            <div>
              <p className="text-sm">Small text</p>
              <p className="text-sm text-neutral-500">font-size: var(--font-size-sm)</p>
            </div>
            <div>
              <p className="text-xs">Extra small text</p>
              <p className="text-sm text-neutral-500">font-size: var(--font-size-xs)</p>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 2 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Components</h2>
          
          <section className="mb-8">
            <h3 className="text-lg font-medium mb-4">Buttons</h3>
            <div className="flex flex-wrap gap-4 mb-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="success">Success</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="info">Info</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="flex flex-wrap gap-4 mb-4">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button leftIcon={<Plus className="w-4 h-4" />}>With Icon</Button>
              <Button rightIcon={<ChevronDown className="w-4 h-4" />}>With Icon</Button>
              <Button isLoading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </section>
          
          <section className="mb-8">
            <h3 className="text-lg font-medium mb-4">Form Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input 
                  label="Text Input" 
                  placeholder="Enter text" 
                  helperText="This is a helper text"
                />
                <Input 
                  label="With Error" 
                  placeholder="Enter text" 
                  error="This field is required"
                />
                <Input 
                  label="With Icon" 
                  placeholder="Search..." 
                  leftIcon={<Search className="w-4 h-4 text-neutral-400" />}
                />
              </div>
              <div>
                <Select 
                  label="Select Input" 
                  options={[
                    { value: 'option1', label: 'Option 1' },
                    { value: 'option2', label: 'Option 2' },
                    { value: 'option3', label: 'Option 3' }
                  ]}
                />
                <div className="mb-4">
                  <Checkbox label="Remember me" />
                  <Checkbox label="Disabled option" disabled />
                </div>
                <div className="mb-4">
                  <Radio label="Option 1" name="radio-group" />
                  <Radio label="Option 2" name="radio-group" />
                </div>
                <Switch label="Enable notifications" />
              </div>
            </div>
          </section>
          
          <section className="mb-8">
            <h3 className="text-lg font-medium mb-4">Cards & Alerts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card 
                title="Card Title" 
                subtitle="Card subtitle or description"
                footer={
                  <div className="flex justify-end">
                    <Button variant="primary" size="sm">Action</Button>
                  </div>
                }
              >
                <p className="text-neutral-600 dark:text-neutral-400">
                  This is the main content of the card. You can put any content here.
                </p>
              </Card>
              
              <div className="space-y-4">
                <Alert variant="info">This is an informational alert.</Alert>
                <Alert variant="success" title="Success">Operation completed successfully.</Alert>
                <Alert variant="warning" title="Warning" onClose={() => {}}>
                  This action cannot be undone.
                </Alert>
                <Alert variant="error" title="Error">
                  An error occurred while processing your request.
                </Alert>
              </div>
            </div>
          </section>
          
          <section className="mb-8">
            <h3 className="text-lg font-medium mb-4">Badges & Tooltips</h3>
            <div className="flex flex-wrap gap-4 mb-6">
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
            </div>
            
            <div className="flex flex-wrap gap-6">
              <Tooltip content="Top tooltip">
                <Button variant="secondary" size="sm">Hover me (top)</Button>
              </Tooltip>
              <Tooltip content="Bottom tooltip" position="bottom">
                <Button variant="secondary" size="sm">Hover me (bottom)</Button>
              </Tooltip>
              <Tooltip content="Left tooltip" position="left">
                <Button variant="secondary" size="sm">Hover me (left)</Button>
              </Tooltip>
              <Tooltip content="Right tooltip" position="right">
                <Button variant="secondary" size="sm">Hover me (right)</Button>
              </Tooltip>
            </div>
          </section>
          
          <section className="mb-8">
            <h3 className="text-lg font-medium mb-4">Other Components</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-base font-medium mb-2">Accordion</h4>
                <Accordion>
                  <AccordionItem title="Section 1" defaultOpen>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Content for section 1. This section is expanded by default.
                    </p>
                  </AccordionItem>
                  <AccordionItem title="Section 2">
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Content for section 2.
                    </p>
                  </AccordionItem>
                  <AccordionItem title="Section 3" icon={<Settings className="w-4 h-4" />}>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Content for section 3 with an icon.
                    </p>
                  </AccordionItem>
                </Accordion>
              </div>
              
              <div>
                <h4 className="text-base font-medium mb-2">Progress</h4>
                <div className="space-y-4">
                  <Progress value={25} label="25%" showValue />
                  <Progress value={50} color="success" size="md" label="Success" />
                  <Progress value={75} color="warning" size="lg" label="Warning" />
                  <Progress value={90} color="error" label="Error" />
                </div>
                
                <h4 className="text-base font-medium mt-6 mb-2">Avatars</h4>
                <div className="flex flex-wrap gap-4">
                  <Avatar initials="JD" size="xs" />
                  <Avatar initials="JD" size="sm" />
                  <Avatar initials="JD" size="md" />
                  <Avatar initials="JD" size="lg" />
                  <Avatar initials="JD" size="xl" shape="square" />
                </div>
                
                <h4 className="text-base font-medium mt-6 mb-2">Loading States</h4>
                <div className="flex flex-wrap gap-4">
                  <Spinner size="sm" />
                  <Spinner size="md" />
                  <Spinner size="lg" />
                  <Spinner color="secondary" />
                </div>
              </div>
            </div>
          </section>
          
          <section className="mb-8">
            <h3 className="text-lg font-medium mb-4">Interactive Components</h3>
            <div className="space-y-4">
              <div>
                <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
                <Modal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  title="Modal Title"
                  footer={
                    <div className="flex justify-end space-x-2">
                      <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                      <Button variant="primary" onClick={() => setIsModalOpen(false)}>Confirm</Button>
                    </div>
                  }
                >
                  <p className="text-neutral-600 dark:text-neutral-400">
                    This is a modal dialog. You can put any content here.
                  </p>
                </Modal>
              </div>
              
              <div>
                <Dropdown
                  trigger={<Button rightIcon={<ChevronDown className="w-4 h-4" />}>Dropdown</Button>}
                  items={[
                    { label: 'Edit', icon: <Edit className="w-4 h-4" />, onClick: () => alert('Edit clicked') },
                    { label: 'Duplicate', icon: <Copy className="w-4 h-4" />, onClick: () => alert('Duplicate clicked') },
                    { label: 'Disabled Item', icon: <Eye className="w-4 h-4" />, disabled: true },
                    { label: 'Delete', icon: <Trash className="w-4 h-4" />, onClick: () => alert('Delete clicked'), danger: true }
                  ]}
                />
              </div>
              
              <div>
                <h4 className="text-base font-medium mb-2">Pagination</h4>
                <Pagination
                  currentPage={3}
                  totalPages={10}
                  onPageChange={(page) => alert(`Page ${page} clicked`)}
                />
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

// Additional Icons
export const Palette: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" />
    <circle cx="17.5" cy="10.5" r=".5" />
    <circle cx="8.5" cy="7.5" r=".5" />
    <circle cx="6.5" cy="12.5" r=".5" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </svg>
);

export const Type: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

export const Layers: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);