'use client';

// import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-primary hover:bg-purple-dark text-white transition-colors duration-200">
            {/* {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />} */}
            <span className="sr-only">Toggle theme</span>
        </button>
    );
}
