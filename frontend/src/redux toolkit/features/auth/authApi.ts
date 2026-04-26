import { AUTH_URL } from '@/redux toolkit/constants';
import { BaseApi } from '../../api/apiSlice';
import { setCredentials, logout, userRegistration } from './authSlice';

export const authApi = BaseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<{ token: string; user: unknown; data: any }, { name: string; email: string; password: string }>({
      query: (body) => ({
        url: AUTH_URL + '/register',
        method: 'POST',
        body,
        credentials: 'include' as const,
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const data = await queryFulfilled;
          console.log(data);
          // dispatch(userRegistration(data?.data?.token));
          //   dispatch(setCredentials(data.data.token));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    login: builder.mutation<{ token: string; user: unknown; data: any }, { email: string; password: string }>({
      query: (body) => ({
        url: AUTH_URL + '/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ token: data.token, user: data.user as any }));
        } catch {
          // no-op
        }
      },
    }),
    // me: builder.query<unknown, void>({
    //   query: () => ({ url: '/auth/me', method: 'GET' }),
    //   providesTags: ['User'],
    // }),
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
export const { useRegisterMutation, useLoginMutation } = authApi;
