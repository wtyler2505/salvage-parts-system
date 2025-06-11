import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };
  
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${className}`}
      aria-label="Toggle theme"
    >
      {theme === 'light' && <Sun className="h-5 w-5 text-yellow-500" />}
      {theme === 'dark' && <Moon className="h-5 w-5 text-blue-500" />}
      {theme === 'system' && <Monitor className="h-5 w-5 text-gray-500" />}
    </button>
  );
};