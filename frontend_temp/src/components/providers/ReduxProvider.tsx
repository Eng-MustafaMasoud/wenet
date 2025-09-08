'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import AuthHydration from './AuthHydration';

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydration>{children}</AuthHydration>
    </Provider>
  );
}
