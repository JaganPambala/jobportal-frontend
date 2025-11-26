import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Update baseUrl to your backend API
const baseUrl = "http://10.0.2.2:5000";

export const api = createApi({
  reducerPath: 'reduxApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      try {
        const token = getState().auth?.token;
        if (token) headers.set('authorization', `Bearer ${token}`);
      } catch (e) {
        // ignore if getState not available
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getRoles: builder.query({
      query: () => '/roles',
    }),
    getCategories: builder.query({
      query: () => '/categories',
    }),
    getCategoryRoles: builder.query({
      // full path: http://localhost:5000/category/categories/roles
      query: () => '/category/categories/roles',
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (payload) => ({
        url: '/auth/register',
        method: 'POST',
        body: payload,
      }),
    }),

    updateJobPreferences: builder.mutation({
      query: (preferences) => ({
        url: '/employee/preferences',
        method: 'PATCH',
        body: preferences,
      }),
    }),

    getFeaturedJobs: builder.query({
      query: () => '/job/featured',
    }),

    getPopularJobs: builder.query({
      query: () => '/job/popular',
    }),
    getJobById: builder.query({
      query: (id) => `/job/${id}`,
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetCategoriesQuery,
  useGetCategoryRolesQuery,
  useLoginMutation,
  useRegisterMutation,
  useUpdateJobPreferencesMutation,
  useGetFeaturedJobsQuery,
  useGetPopularJobsQuery,
  useGetJobByIdQuery,
} = api;
