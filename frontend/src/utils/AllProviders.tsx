'use client';
import { ReactNode } from 'react';
import StoreProvider from '@/redux toolkit/store/storeProiver';
import { ThemeProviders } from './ThemeProvider';
import AuthBootstrap from './AuthBootstrap';

interface providerProps {
  children: ReactNode;
}

export default function AllProvider({ children }: providerProps) {
  return (
    <StoreProvider>
      <AuthBootstrap />
      <ThemeProviders attribute={'class'} defaultTheme="system" enableSystem>
        {children}
      </ThemeProviders>
    </StoreProvider>
  );
}
