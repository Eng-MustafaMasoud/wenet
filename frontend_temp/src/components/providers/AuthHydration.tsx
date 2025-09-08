'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { hydrate } from '@/store/slices/authSlice';

export default function AuthHydration({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Hydrate auth state from localStorage after component mounts
    dispatch(hydrate());
  }, [dispatch]);

  return <>{children}</>;
}
