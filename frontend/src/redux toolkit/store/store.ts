import { configureStore } from '@reduxjs/toolkit';
import { BaseApi } from '../api/apiSlice';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    [BaseApi.reducerPath]: BaseApi.reducer,
    auth: authReducer,
  },
  devTools: false,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }).concat(BaseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
