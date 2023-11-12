import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const pause = (duration) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
};

const patientApi = createApi({
  reducerPath: "patient",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/patient",
    fetchFn: async (...args) => {
      await pause(2000);
      return fetch(...args, { credentials: "include" });
    },
  }),

  endpoints: (builder) => {
    return {
      fetchPatient: builder.query({
        query: (id) => {
          return {
            url: "/",
            method: "GET",
          };
        },
      }),

      fetchPatientAppointments: builder.query({
        query: (patient_id) => {
          return {
            url: "/appointments/",
            params: {
              patient_id,
            },
            method: "GET",
          };
        },
      }),

      fetchFamilyMembers: builder.query({
        providesTags: (result, error, patientId) => {
          return [
            {
              type: "patientId",
              value: patientId,
            },
          ];
        },

        query: (id) => {
          return {
            url: "/family/",
            params: {
              patientId: id,
            },
            method: "GET",
          };
        },
      }),

      addFamilyMember: builder.mutation({
        invalidatesTags: (result, error, data) => {
          // console.log("Invalidating tag: ", { type: "patientId", id: data.patientId });
          // return [{ type: "patientId", id: data.patientId }];
          return [
            {
              type: "patientId",
              value: data.patientId,
            },
          ];
        },

        query: (data) => {
          return {
            url: "/family/",
            method: "POST",
            body: data,
          };
        },
      }),

      fetchPrescriptions: builder.query({
        query: (patientId) => {
          return {
            url: "/prescriptions/",
            params: {
              patientId,
            },
            method: "GET",
          };
        },
      }),

      fetchDoctors: builder.query({
        providesTags: (result, error, patientId) => {
          return ["Doctors"];
        },

        query: () => {
          return {
            url: "/doctors",
            method: "GET",
          };
        },
      }),

      fetchPackagesPatient: builder.query({
        query: (patientId) => {
          return {
            url: "/packages",
            method: "GET",
          };
        },
      }),

      fetchAvailableAppointments: builder.query({
        query: (doctorId) => {
          return {
            url: "/availableAppointments",
            params: {
              doctorId,
            },
            method: "GET",
          };
        },
      }),

      creditDoctor: builder.mutation({
        query: (data) => {
          return {
            url: "/creditDoctor",
            method: "PATCH",
            body: data,
          };
        },
      }),

      payByWallet: builder.mutation({
        query: (data) => {
          return {
            url: "/payWallet",
            method: "PATCH",
            body: data,
          };
        },
      }),

      fetchMyPackage: builder.query({
        providesTags:(result, error, data)=>{
            return ["My package"];
        }
        ,
        query:()=>{
          return {
            url:'/myPackage',
            method:"GET",
          }
        }
      }),
      fetchFamilyPackage: builder.query({
        providesTags:(result, error, data)=>{
            return ["Family packages"];
        },
        query:()=>{
          return{
            url:'/familyPackages',
            method:"GET",
          }
        }
      }),
      bookAppointment: builder.mutation({
        query: (data) => {
          return {
            url: "/bookAppointment",
            method: "POST",
            body: data,
          };
        },
      }),
      cancelMyPackage: builder.mutation({
        invalidatesTags: (result, error, data) => {
          return ["My package"];
        },
        query: (data)=>{
          return {
            url:'/cancelMySub',
            method:"POST"
          }
        }
      })

      fetchWalletPatient: builder.query({
        query: () => {
          return {
            url: "/wallet",
            method: "GET",
          }
        }
      }),
      subscribeToHealthPackage: builder.mutation({
        query: (data) => {
          return {
            url: "/subscribeToHealthPackage",
            method: "POST",
            body: data,
          };
        },
      }),

    };
  },
});

export const {
  useFetchPatientQuery,
  useFetchPatientAppointmentsQuery,
  useFetchFamilyMembersQuery,
  useAddFamilyMemberMutation,
  useFetchPrescriptionsQuery,
  useFetchDoctorsQuery,
  useFetchPackagesPatientQuery,
  useFetchAvailableAppointmentsQuery,
  useCreditDoctorMutation,
<<<<<<< HEAD
  usePayAppointmentByWalletMutation,
  useFetchMyPackageQuery,
  useFetchFamilyPackageQuery,
  useBookAppointmentMutation,
  useCancelMyPackageMutation
=======
  usePayByWalletMutation,
  useBookAppointmentMutation,
  useFetchWalletPatientQuery,
  useSubscribeToHealthPackageMutation,
>>>>>>> 979e08d5e8bbe8f1d59f95c8600ea3bfc4887cd7
} = patientApi;

export { patientApi };
