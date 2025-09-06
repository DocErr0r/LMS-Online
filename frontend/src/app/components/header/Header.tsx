import React, { FC, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { ThemeToggle } from './ThemaButton';

interface HeaderProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    activeItem: number;
}

const Header: FC<HeaderProps> = ({ open, setOpen, activeItem }) => {
    const { theme, setTheme } = useTheme();
    const [active, setActive] = useState(false);
    const [opensidebar, setOpensidebar] = useState(false);

    if (typeof window !== 'undefined') {
        addEventListener('scroll', () => {
            if (window.scrollY > 85) {
                setActive(true);
            } else {
                setActive(false);
            }
        });
    }
    const navItems = [
        { href: '/', label: 'Home', id: 0 },
        { href: '/courses', label: 'Courses', id: 1 },
        { href: '/dashboard', label: 'Dashboard', id: 2 },
        { href: '/about', label: 'About', id: 3 },
    ];

    return (
        <header className="w-full relative">
            <div className={`${active ? 'dark:opacity-90 bg-gradient-to-b from-[#f8f7ff] via-[#f3f1ff] to-white text-purpleLight-text dark:bg-gradient-to-b dark:from-[#0b0615] dark:via-[#120a23] dark:to-[#1b1233] fixed top-0 left-0 w-full h-[80px] z-[80] border-b dark:border-gray-500 shadow-xl transition duration-300' : 'w-full border-b h-[80px] z-[80] dark:border-gray-500 dark:shadow '}`}>
                <div className="w-[95%] h-full py-2 m-auto 880px:w-[92%]">
                    <div className="w-full h-[80px] flex items-center justify-between">
                        <ThemeToggle />
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <Link href="/">
                                <span className="text-2xl font-bold text-blue-600">LMS Online</span>
                            </Link>
                        </div>
                        {/* Navigation Links */}
                        <nav className="hidden md:flex gap-8">
                            {navItems.map((item) => (
                                <Link key={item.id} href={item.href} className={`text-base font-medium transition-colors duration-200 ${activeItem === item.id ? 'text-blue-600' : 'text-gray-700 dark:text-gray-200 hover:text-blue-600'}`}>
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                        {/* Right Side Icons */}
                        <div className="flex items-center gap-5">
                            {/* Message Icon */}
                            <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600 dark:text-gray-200">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-.659 1.591l-7.591 7.591a2.25 2.25 0 01-3.182 0L2.909 8.584A2.25 2.25 0 012.25 6.993V6.75" />
                                </svg>
                            </button>
                            {/* Notification Icon */}
                            <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600 dark:text-gray-200">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a2.25 2.25 0 01-5.714 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-4.5v5.25" />
                                </svg>
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            {/* Profile Icon */}
                            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-gray-600 dark:text-gray-200">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
