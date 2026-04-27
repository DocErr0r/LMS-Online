import { Josefin_Sans, Poppins } from 'next/font/google';
import './globals.css';
import CssBaseline from '@mui/material/CssBaseline';
import AllProvider from '@/utils/AllProviders';
import { Toaster } from 'react-hot-toast';

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
      <body className={`${poppins.variable} ${josefin.variable} antialiased`}>
        <AllProvider>
          <Toaster position="bottom-center" reverseOrder={false} />
          {/* <CssBaseline /> */}
          {children}
        </AllProvider>
      </body>
    </html>
  );
}
