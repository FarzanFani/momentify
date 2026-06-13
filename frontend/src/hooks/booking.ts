import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getCustomerBookings,
  getCustomerSingleBooking,
  postCustomerBooking,
  cancelCustomerBooking,
  getCustomerHistoryBookingList,
  updateCustomerBooking,
} from "@/services/customer/booking";
import {
  getProviderBookingsList,
  getProviderSingleBooking,
  ProviderBookingListParams,
  updateProviderBookingStatus,
} from "@/services/provider/booking";

export const usePostCustomerBooking = () => {
  return useMutation({
    mutationFn: postCustomerBooking,
  });
};

export const useUpdateCustomerBooking = () => {
  return useMutation({
    mutationFn: updateCustomerBooking,
  });
};

export const useGetSingleCustomerBooking = (bookingId: string) => {
  return useQuery({
    queryKey: ["customer-booking", bookingId],
    queryFn: () => getCustomerSingleBooking(bookingId),
  });
};

export const useCancelCustomerBooking = () => {
  return useMutation({
    mutationFn: ({
      bookingId,
      cancellation_data,
    }: {
      bookingId: string;
      cancellation_data: { cancellation_reason: string };
    }) => cancelCustomerBooking(bookingId, cancellation_data),
  });
};

export const useGetCustomerBookingList = () => {
  return useQuery({
    queryKey: ["booking-list"],
    queryFn: () => getCustomerBookings(),
  });
};

export const useGetCustomerHistoryBookingList = () => {
  return useQuery({
    queryKey: ["history-boooking-list"],
    queryFn: () => getCustomerHistoryBookingList(),
  });
};

export const useGetProviderBookingList = (
  params: ProviderBookingListParams,
) => {
  return useQuery({
    queryKey: ["provider-booking-list", params],
    queryFn: () => getProviderBookingsList(params),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};

export const useGetSingleProviderBooking = (bookingId: string) => {
  return useQuery({
    queryKey: ["provider-booking", bookingId],
    queryFn: () => getProviderSingleBooking(bookingId),
  });
};

export const useUpdateProviderBookingStatus = () => {
  return useMutation({
    mutationFn: updateProviderBookingStatus,
  });
};
