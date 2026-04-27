'use client';

import { useMeQuery } from '@/redux toolkit/features/auth/authApi';
import { useAppDispatch, useAppSelector } from '@/redux toolkit/store/hooks';
import { useEffect } from 'react';
import { setAuthReady } from '@/redux toolkit/features/auth/authSlice';

export default function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const ready = useAppSelector((s) => s.auth.ready);

  const { isSuccess, isError } = useMeQuery(undefined, {
    // If we already have user (client navigation), don't refetch and cause UI changes.
    skip: Boolean(user) || ready,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (user && !ready) dispatch(setAuthReady(true));
  }, [dispatch, ready, user]);

  useEffect(() => {
    if ((isSuccess || isError) && !ready) dispatch(setAuthReady(true));
  }, [dispatch, isError, isSuccess, ready]);

  return null;
}

