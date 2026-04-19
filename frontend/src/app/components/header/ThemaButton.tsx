'use client';
import { useTheme } from 'next-themes';
import { FiMoon, FiSun } from 'react-icons/fi';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="flex items-center justify-center p-1 sm:p-2 rounded-full hover:bg-primary text-text transition-colors duration-200">
      {/* {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />} */}
      <FiMoon className="h-4 w-4 sm:h-6 sm:w-6 transition-all duration-500 ease-in-out rotate-0 opacity-100 dark:-rotate-90 dark:opacity-0" />
      <FiSun className="absolute h-4 w-4 sm:h-6 sm:w-6 transition-all duration-500 ease-in-out rotate-0 opacity-0 dark:-rotate-90 dark:opacity-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
