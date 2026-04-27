import { AUTH_URL } from '@/redux toolkit/constants';
import { BaseApi } from '../../api/apiSlice';
import { setCredentials } from './authSlice';

export const authApi = BaseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<{ success: boolean; message: string }, { name: string; email: string; password: string }>({
      query: (body) => ({
        url: AUTH_URL + '/register',
        method: 'POST',
        body,
        credentials: 'include' as const,
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const data = await queryFulfilled;
          // console.log(data);
          // dispatch(userRegistration(data?.data?.token));
          //   dispatch(setCredentials(data.data.token));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    login: builder.mutation<{ success: boolean; message: string; AccessToken: string }, { email: string; password: string }>({
      query: (body) => ({
        url: AUTH_URL + '/login',
        method: 'POST',
        credentials: 'include' as const,
        body,
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ token: data.AccessToken }));
          // dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true }));
        } catch {
          // no-op
        }
      },
    }),
    me: builder.query<{ success: boolean; user: unknown }, void>({
      query: () => ({
        url: AUTH_URL + '/me',
        method: 'GET',
      }),
      providesTags: ['User'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ user: data.user as any }));
        } catch {
          // no-op (baseQuery will attempt refresh when needed)
        }
      },
    }),
    // logout: builder.mutation<{ success: boolean }, void>({
    //   query: () => ({ url: '/auth/logout', method: 'POST' }),
    //   async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
    //     try {
    //       await queryFulfilled;
    //     } finally {
    //       dispatch(logout());
    //     }
    //   },
    //   invalidatesTags: ['Auth', 'User'],
    // }),
  }),
});

// export const { useRegisterMutation, useLoginMutation, useMeQuery, useLogoutMutation } = authApi;
export const { useRegisterMutation, useLoginMutation, useMeQuery, useLazyMeQuery } = authApi;
