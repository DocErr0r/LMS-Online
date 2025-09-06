import { Josefin_Sans, Poppins } from 'next/font/google';
import './globals.css';
import { ThemeProviders } from '@/utils/ThemeProvider';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const josefin = Josefin_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-josefin',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${josefin.variable} antialiased bg-gradient-to-b from-[#f8f7ff] via-[#f3f1ff] to-white text-purpleLight-text dark:bg-gradient-to-b dark:from-[#0b0615] dark:via-[#120a23] dark:to-[#1b1233] dark:text-purple-text duration-300`}>
        <ThemeProviders attribute={'class'} defaultTheme="system" enableSystem>
          {children}
        </ThemeProviders>
      </body>
    </html>
  );
}
