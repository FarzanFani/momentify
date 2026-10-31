import {
  getCustomerPackageBooking,
  getCustomerPackageBookings,
  getProviderPackageBooking,
  getProviderPackageBookings,
  patchCancelPackageBooking,
  patchProviderPackageBookingStatus,
  postCustomerPackageBooking,
  postSchedulePackageBooking,
} from "@/services/customer/packageBooking";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const usePostPackageBooking = () => {
  return useMutation({
    mutationFn: postCustomerPackageBooking,
  });
};

export const useGetCustomerPackageBookings = () => {
  return useQuery({
    queryKey: ["customer-package-bookings"],
    queryFn: getCustomerPackageBookings,
    refetchOnWindowFocus: false,
  });
};

export const useGetCustomerPackageBooking = (id: string) => {
  return useQuery({
    queryKey: ["customer-package-booking", id],
    queryFn: () => getCustomerPackageBooking(id),
    refetchOnWindowFocus: false,
  });
};

export const useSchedulePackageBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postSchedulePackageBooking,
    onSuccess: (data) =>
      queryClient.setQueryData(["customer-package-booking", data.id], data),
  });
};

export const useCancelPackageBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: patchCancelPackageBooking,
    onSuccess: (data) => {
      queryClient.setQueryData(["customer-package-booking", data.id], data);
      queryClient.invalidateQueries({
        queryKey: ["customer-package-bookings"],
      });
    },
  });
};

export const useGetProviderPackageBookings = (status?: string) => {
  return useQuery({
    queryKey: ["provider-package-bookings", status],
    queryFn: () => getProviderPackageBookings({ status: status || undefined }),
    refetchOnWindowFocus: false,
  });
};

export const useGetProviderPackageBooking = (id: string) => {
  return useQuery({
    queryKey: ["provider-package-booking", id],
    queryFn: () => getProviderPackageBooking(id),
    refetchOnWindowFocus: false,
  });
};

export const useUpdatePackageBookingStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: patchProviderPackageBookingStatus,
    onSuccess: (data) => {
      queryClient.setQueryData(["provider-package-booking", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["provider-package-bookings"] });
    },
  });
};
