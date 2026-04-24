'use client';
import { ReactNode, useRef } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';

interface providerProps {
  children: ReactNode;
}

export default function StoreProvider({ children }: providerProps) {
  // const storeRef = useRef(undefined);
  // if (!storeRef.current) {
  //   storeRef.current = store();
  // }

  return <Provider store={store}>{children}</Provider>;
}
