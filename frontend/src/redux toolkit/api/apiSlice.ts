import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from '../features/auth/authSlice';
import { AUTH_URL } from '../constants';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_SERVER_URL,
  credentials: 'include',
});

let refreshPromise: Promise<string | null> | null = null;

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    try {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          const refreshResult = await rawBaseQuery({ url: AUTH_URL + '/refresh-token', method: 'GET' }, api, extraOptions);
          if (refreshResult.data && typeof refreshResult.data === 'object' && 'newAccessToken' in refreshResult.data) {
            const newAccessToken = (refreshResult.data as { newAccessToken?: string }).newAccessToken ?? null;
            if (newAccessToken) api.dispatch(setCredentials({ token: newAccessToken }));
            return newAccessToken;
          }
          api.dispatch(logout());
          return null;
        })().finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;
      if (newToken) {
        // retry the initial query after refreshing
        return await rawBaseQuery(args, api, extraOptions);
      }
    } catch {
      api.dispatch(logout());
    }
  }

  return result;
};

export const BaseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Course', 'Order', 'Layout', 'Dashboard'],
  endpoints: (builder) => ({}),
});

export const {} = BaseApi;
