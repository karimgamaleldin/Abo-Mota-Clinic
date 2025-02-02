import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const guestApi = createApi({
  reducerPath: "guestApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}/api/guest`,
    credentials: "include",
    prepareHeaders: (headers, { getState, endpoint }) => {
      if (endpoint !== "registerDoctor") {
        headers.set("Content-Type", "application/json");
      }
      // Set other headers as needed
      return headers;
    },
  }),
  endpoints(builder) {
    return {
      registerDoctor: builder.mutation({
        query: (doctor) => {
          const formData = new FormData();

          // Add file fields to FormData
          formData.append("nationalId", doctor.nationalId);
          formData.append("medicalLicense", doctor.medicalLicense);
          formData.append("medicalDegree", doctor.medicalDegree);

          Object.keys(doctor).forEach((key) => {
            if (key !== "nationalId" && key !== "medicalLicense" && key !== "medicalDegree") {
              formData.append(key, doctor[key]);
            }
          });
          return {
            url: "/registerDoctor",
            body: formData,
            method: "POST",
          };
        },
      }),
      registerPatient: builder.mutation({
        query: (patient) => {
          return {
            url: "/registerPatient",
            body: patient,
            method: "POST",
          };
        },
      }),
      login: builder.mutation({
        query: (user) => {
          return {
            url: "/login",
            body: user,
            method: "POST",
          };
        },
      }),

      logout: builder.mutation({
        query: () => {
          return {
            url: "/logout",
            method: "POST",
          };
        },
      }),
      forgetPassword: builder.mutation({
        query: ({ email, otp, newPassword }) => {
          return {
            url: "/forgotPassword",
            method: "POST",
            body: { 
              email, 
              otp, 
              newPassword
            }
          };
        },
      }),
      requestOtp: builder.mutation({
        query: ({email}) => {
          return {
            url: "/otp",
            method: "POST",
            body: {email}
          };
        },
      }),
    };
  },
});

export const {
  useRegisterDoctorMutation,
  useRegisterPatientMutation,
  useLoginMutation,
  useLogoutMutation,
  useForgetPasswordMutation,
  useRequestOtpMutation,

} = guestApi;
export { guestApi };
