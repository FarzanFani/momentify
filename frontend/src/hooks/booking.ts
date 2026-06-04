import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getCustomerBookings,
  getCustomerSingleBooking,
  postCustomerBooking,
  cancelCustomerBooking,
  getCustomerHistoryBookingList,
} from "@/services/customer/booking";

export const usePostCustomerBooking = () => {
  return useMutation({
    mutationFn: postCustomerBooking,
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
