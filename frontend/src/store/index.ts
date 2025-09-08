import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import gateSlice from './slices/gateSlice';
import adminSlice from './slices/adminSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    gate: gateSlice,
    admin: adminSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
