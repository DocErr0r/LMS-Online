import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const BaseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_SERVER_URL,
    credentials: 'include',
  }),
  tagTypes: ['User', 'Course', 'Order', 'Layout', 'Dashboard'],
  endpoints: (builder) => ({}),
});

export const {} = BaseApi;
