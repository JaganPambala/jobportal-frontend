import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Update baseUrl to your backend API
const baseUrl = "http://10.0.2.2:5000";

// Custom baseQuery that handles FormData properly
const baseQueryWithFormData = fetchBaseQuery({
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
});

// Wrapper to handle FormData without stringifying
const baseQueryWrapper = async (args, api, extraOptions) => {
  // If body is FormData, don't let fetchBaseQuery stringify it
  if (args.body instanceof FormData) {
    // Remove Content-Type header so fetch can set it with boundary
    const clonedArgs = { ...args };
    return baseQueryWithFormData(clonedArgs, api, extraOptions);
  }
  return baseQueryWithFormData(args, api, extraOptions);
};

export const api = createApi({
  reducerPath: 'reduxApi',
  tagTypes: ['Job', 'Applicants', 'EmployeeMe', 'Applications', 'Category'],
  baseQuery: baseQueryWrapper,
  endpoints: (builder) => ({
    getRoles: builder.query({
      query: () => '/roles',
    }),
    getCategories: builder.query({
      query: () => '/categories',
    }),
    // Parent categories (top-level categories)
    getParentCategories: builder.query({
      query: () => '/category/categories/parents',
      providesTags: ['Category'],
    }),
    getCategoryRoles: builder.query({
      // full path: http://localhost:5000/category/categories/roles
      query: () => '/category/categories/roles',
    }),
    // Children (subcategories) for a given parent category
    getCategoryChildren: builder.query({
      query: (parentId) => `/category/categories/${parentId}/children`,
      providesTags: (result, error, parentId) => [{ type: 'Category', id: parentId }],
    }),
    getGroupedCategories: builder.query({
      // full path: http://localhost:5000/category/categories/grouped
      query: () => '/category/categories/grouped',
    }),

    // Jobs for a specific category (with optional pagination)
    getJobsByCategory: builder.query({
      query: ({ categoryId, page = 1, limit = 10 } = {}) => {
        const parts = [];
        if (page) parts.push(`page=${encodeURIComponent(String(page))}`);
        if (limit) parts.push(`limit=${encodeURIComponent(String(limit))}`);
        const qs = parts.join('&');
        return `/job/by-category/${categoryId}${qs ? `?${qs}` : ''}`;
      },
      providesTags: (result) => (result ? [{ type: 'Job', id: 'LIST' }] : [{ type: 'Job', id: 'LIST' }]),
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
      providesTags: ['Job'],
    }),

    getPopularJobs: builder.query({
      query: () => '/job/popular',
      providesTags: ['Job'],
    }),
    getJobById: builder.query({
      query: (id) => `/job/${id}`,
      providesTags: (result, error, id) => [{ type: 'Job', id }],
    }),
    getEmployerMe: builder.query({
      query: () => '/employer/me',
      transformResponse: (response) => {
        // Backend returns { message, employer }, extract the employer object
        const employer = response?.employer || response;
        // If companyLogo is a relative path, it will be handled by the component's getFullLogoUrl
        return employer;
      },
    }),
    createEmployerProfile: builder.mutation({
      query: (payload) => ({
        url: '/employer/me',
        method: 'POST',
        body: payload,
      }),
    }),
    updateEmployerDetails: builder.mutation({
      query: (payload) => ({
        url: '/employer/details',
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['EmployerMe'],
    }),
    uploadEmployerLogo: builder.mutation({
      query: (formData) => {
        return {
          url: '/employer/me/logo',
          method: 'POST',
          body: formData,
        };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data: result } = await queryFulfilled;
          // Update the getEmployerMe cache with the new logo URL
          dispatch(
            api.util.updateQueryData('getEmployerMe', undefined, (draft) => {
              if (result?.logoUrl) {
                draft.companyLogo = result.logoUrl;
              }
              if (result?.employer?.companyLogo) {
                draft.companyLogo = result.employer.companyLogo;
              }
            })
          );
        } catch (err) {
          console.error('Logo upload error:', err);
        }
      },
    }),
    // Employee profile endpoints
    getEmployeeMe: builder.query({
      query: () => '/employee/me',
      providesTags: ['EmployeeMe'],
    }),
    updateEmployeeProfile: builder.mutation({
      query: (payload) => ({ url: '/employee/me', method: 'PATCH', body: payload }),
      invalidatesTags: ['EmployeeMe'],
    }),
    // Update only skills for the employee
    updateEmployeeSkills: builder.mutation({
      query: (skills) => ({ url: '/employee/me/skills', method: 'PATCH', body: { skills } }),
      invalidatesTags: ['EmployeeMe'],
    }),
    uploadEmployeeAvatar: builder.mutation({
      query: (formData) => {
        // FormData will be sent as-is without JSON serialization
        // The browser will automatically set Content-Type: multipart/form-data with boundary
        return {
          url: '/employee/me/avatar',
          method: 'POST',
          body: formData,
        };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data: result } = await queryFulfilled;
          // Update the getEmployeeMe cache with the new avatar URL
          dispatch(
            api.util.updateQueryData('getEmployeeMe', undefined, (draft) => {
              if (result?.avatarUrl) {
                draft.avatar = result.avatarUrl;
              }
              if (result?.employee?.avatar) {
                draft.avatar = result.employee.avatar;
              }
            })
          );
        } catch (err) {
          console.error('Avatar upload error:', err);
        }
      },
      invalidatesTags: ['EmployeeMe'],
    }),
    uploadEmployeeResume: builder.mutation({
      query: (formData) => {
        // FormData will be sent as-is without JSON serialization
        // The browser will automatically set Content-Type: multipart/form-data with boundary
        return {
          url: '/employee/me/resume',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['EmployeeMe'],
    }),
    deleteEmployeeResume: builder.mutation({
      query: () => ({ url: '/employee/me/resume', method: 'DELETE' }),
      invalidatesTags: ['EmployeeMe'],
    }),
    // Education CRUD
    addEmployeeEducation: builder.mutation({
      query: (payload) => ({ url: '/employee/me/education', method: 'POST', body: payload }),
      invalidatesTags: ['EmployeeMe'],
    }),
    updateEmployeeEducation: builder.mutation({
      query: ({ eduId, ...patch }) => ({ url: `/employee/me/education/${eduId}`, method: 'PATCH', body: patch }),
      invalidatesTags: ['EmployeeMe'],
    }),
    deleteEmployeeEducation: builder.mutation({
      query: (eduId) => ({ url: `/employee/me/education/${eduId}`, method: 'DELETE' }),
      invalidatesTags: ['EmployeeMe'],
    }),
    postJob: builder.mutation({
      query: (payload) => ({
        url: '/job',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Job'],
    }),
    // returns jobs for the authenticated employer
    getEmployerJobs: builder.query({
      // full path: http://localhost:5000/job/my-jobs
      query: () => '/job/my-jobs',
      providesTags: ['Job'],
    }),
    // Employee's own applications, with pagination & status filters
    getEmployeeApplications: builder.query({
      // params: { page, limit, status } where status can be comma-separated string
      query: ({ page = 1, limit = 10, status } = {}) => {
        const parts = [];
        if (page) parts.push(`page=${encodeURIComponent(String(page))}`);
        if (limit) parts.push(`limit=${encodeURIComponent(String(limit))}`);
        if (status) parts.push(`status=${encodeURIComponent(Array.isArray(status) ? status.join(',') : String(status))}`);
        const qs = parts.join('&');
        return `/application/employee${qs ? `?${qs}` : ''}`;
      },
      providesTags: (result) =>
        result ? [{ type: 'Applications', id: 'LIST' }] : [{ type: 'Applications', id: 'LIST' }],
    }),
    getApplicantsForJob: builder.query({
      // backend exposes applicants via /application/job/:jobId
      query: (jobId) => `/application/job/${jobId}`,
      providesTags: (result, error, jobId) => [{ type: 'Applicants', id: jobId }],
    }),
    // Search jobs endpoint
    searchJobs: builder.query({
      query: ({ keyword, categoryId, location, jobType, skills, minSalary, maxSalary, experienceLevel, page = 1, limit = 10 } = {}) => {
        const parts = [];
        if (keyword) parts.push(`keyword=${encodeURIComponent(keyword)}`);
        if (categoryId) parts.push(`categoryId=${encodeURIComponent(categoryId)}`);
        if (location) parts.push(`location=${encodeURIComponent(location)}`);
        if (jobType) parts.push(`jobType=${encodeURIComponent(jobType)}`);
        if (skills) parts.push(`skills=${encodeURIComponent(Array.isArray(skills) ? skills.join(',') : skills)}`);
        if (minSalary) parts.push(`minSalary=${encodeURIComponent(String(minSalary))}`);
        if (maxSalary) parts.push(`maxSalary=${encodeURIComponent(String(maxSalary))}`);
        if (experienceLevel) parts.push(`experienceLevel=${encodeURIComponent(String(experienceLevel))}`);
        if (page) parts.push(`page=${encodeURIComponent(String(page))}`);
        if (limit) parts.push(`limit=${encodeURIComponent(String(limit))}`);
        const qs = parts.join('&');
        return `/job/search${qs ? `?${qs}` : ''}`;
      },
      providesTags: (result) => (result ? [{ type: 'Job', id: 'LIST' }] : [{ type: 'Job', id: 'LIST' }]),
    }),
    setJobActivation: builder.mutation({
      query: ({ jobId, isActive }) => ({
        url: `/job/${jobId}/activation`,
        method: 'PATCH',
        body: { isActive },
      }),
      // Optimistically update the employer jobs cache to reflect the new isActive value
      // and undo if the request fails
      async onQueryStarted({ jobId, isActive }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          api.util.updateQueryData('getEmployerJobs', undefined, (draft) => {
            if (!draft?.jobs) return;
            const job = draft.jobs.find((j) => (j.id === jobId || j._id === jobId));
            if (job) {
              job.isActive = isActive;
              job.status = isActive ? 'Active' : 'Inactive';
            }
          })
        );
        try {
          await queryFulfilled;
        } catch (err) {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { jobId }) => [{ type: 'Job', id: jobId }, 'Job'],
    }),
    deleteJob: builder.mutation({
      query: (jobId) => ({
        url: `/job/${jobId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, jobId) => [{ type: 'Job', id: jobId }, 'Job'],
    }),
    applyJob: builder.mutation({
      query: (jobId) => ({
        url: `/application/apply/${jobId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Job'],
    }),
    updateApplicationStatus: builder.mutation({
      query: ({ applicationId, status }) => ({
        url: `/application/status/${applicationId}`,
        method: 'PATCH',
        body: { status },
      }),
      async onQueryStarted({ applicationId, jobId, status }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          api.util.updateQueryData('getApplicantsForJob', jobId, (draft) => {
            // draft may be an array or an object { applicants: [] }
            const mutateStatus = (arr) => {
              const idx = arr.findIndex((a) => a._id === applicationId || a.id === applicationId);
              if (idx !== -1) arr[idx].status = status;
            };
            if (Array.isArray(draft)) {
              mutateStatus(draft);
            } else if (draft && Array.isArray(draft.applicants)) {
              mutateStatus(draft.applicants);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch (err) {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { jobId }) => [{ type: 'Applicants', id: jobId }, { type: 'Applications', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetCategoriesQuery,
  useGetParentCategoriesQuery,
  useGetCategoryRolesQuery,
  useGetCategoryChildrenQuery,
  useLoginMutation,
  useRegisterMutation,
  useUpdateJobPreferencesMutation,
  useGetFeaturedJobsQuery,
  useGetPopularJobsQuery,
  useGetJobByIdQuery,
  useGetEmployerMeQuery,
  useLazyGetEmployerMeQuery,
  useCreateEmployerProfileMutation,
  useUpdateEmployerDetailsMutation,
  useUploadEmployerLogoMutation,
  useUpdateEmployeeSkillsMutation,
  usePostJobMutation,
  useGetGroupedCategoriesQuery,
  useGetEmployerJobsQuery,
  useGetApplicantsForJobQuery,
  useGetEmployeeApplicationsQuery,
  useGetJobsByCategoryQuery,
  useSearchJobsQuery,
  useSetJobActivationMutation,
  useDeleteJobMutation,
  useUpdateApplicationStatusMutation,
  useApplyJobMutation,
  useGetEmployeeMeQuery,
  useUpdateEmployeeProfileMutation,
  useUploadEmployeeAvatarMutation,
  useUploadEmployeeResumeMutation,
  useDeleteEmployeeResumeMutation,
  useAddEmployeeEducationMutation,
  useUpdateEmployeeEducationMutation,
  useDeleteEmployeeEducationMutation,
} = api;
