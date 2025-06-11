import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

interface ColorModeToggleProps {
  className?: string;
}

export const ColorModeToggle: React.FC<ColorModeToggleProps> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
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
  
  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'dark':
        return <Moon className="h-5 w-5 text-blue-500" />;
      case 'system':
        return <Monitor className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Change color mode"
      >
        {getIcon()}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => { setTheme('light'); setIsOpen(false); }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Sun className="h-4 w-4 mr-2 text-yellow-500" />
            <span>Light</span>
            {theme === 'light' && <Check className="h-4 w-4 ml-auto text-green-500" />}
          </button>
          
          <button
            onClick={() => { setTheme('dark'); setIsOpen(false); }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Moon className="h-4 w-4 mr-2 text-blue-500" />
            <span>Dark</span>
            {theme === 'dark' && <Check className="h-4 w-4 ml-auto text-green-500" />}
          </button>
          
          <button
            onClick={() => { setTheme('system'); setIsOpen(false); }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Monitor className="h-4 w-4 mr-2 text-gray-500" />
            <span>System</span>
            {theme === 'system' && <Check className="h-4 w-4 ml-auto text-green-500" />}
          </button>
        </div>
      )}
    </div>
  );
};