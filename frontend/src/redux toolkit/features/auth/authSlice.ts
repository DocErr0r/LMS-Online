import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type AuthState = {
  user: any | null;
  token: string | null;
};

const initialState: AuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // if having registraion process
    userRegistration: (state, action: PayloadAction<{ user?: any | null; token?: string | null }>) => {
      if (typeof action.payload.token !== 'undefined') state.token = action.payload.token ?? null;
    },
    setCredentials: (state, action: PayloadAction<{ user?: any | null; token?: string | null }>) => {
      if (typeof action.payload.user !== 'undefined') state.user = action.payload.user ?? null;
      if (typeof action.payload.token !== 'undefined') state.token = action.payload.token ?? null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { userRegistration, setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
