'use client';
import { useState } from 'react';
import Header from '../components/header/Header';
import Sidebar from '../components/sidebar/sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [avtiveItem, setAvtiveItem] = useState(0);
  return (
    <div className="transition-colors duration-900 bg-gradient-to-b from-[#d4d3d5] via-[#d1cee3] to-[#c7a3dd] text-text dark:bg-gradient-to-b dark:from-[#0b0615] dark:via-[#120a23] dark:to-[#1b1233]">
      <div className="flex flex-col min-h-screen">
        <Header open={open} setOpen={setOpen} activeItem={avtiveItem} />
        <div className="flex flex-1">
          {/* <Sidebar open={open} /> */}
          <main className="flex-1 p-6 min-h-screen bg-theme-gradient">{children}</main>
        </div>
        <footer className="bg-gray-500">© 2026 My App</footer>
      </div>
    </div>
  );
}
