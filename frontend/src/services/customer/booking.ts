import axiosInstance from "@/api/axiosInstance";
import { ApiResponse } from "@/types/general";
import { GeneralListType } from "../provider/services";
import { CustomerReview } from "./review";

export type CustomerBookingPayload = {
  service: string;
  location: string;
  special_request: string;
  contact_detail_full_name: string;
  contact_detail_email: string;
  contact_detail_phone_number: string;
  guest_numbers: number;
  event_type: string;
  starts_at: string;
  payment_option: string;
};

export interface Booking extends CustomerBookingPayload {
  id: string;
  ends_at: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  refund_amount?: number;
  created_at: string;
  updated_at: string;
  company: string;
  customer: string;
  category: string;
  status: string;
  company_name: string;
  category_name: string;
  service_name: string;
  customer_name: string;
  total_price: number;
  review: CustomerReview | null;
  buffer_before: number;
  buffer_after: number;
}

export const postCustomerBooking = async (
  bookingData: CustomerBookingPayload,
) => {
  const { data } = await axiosInstance.post<ApiResponse<Booking>>(
    "/api/customer/bookings/",
    bookingData,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as Booking;
};

export const updateCustomerBooking = async ({
  bookingId,
  bookingData,
}: {
  bookingId: string;
  bookingData: CustomerBookingPayload;
}) => {
  const { data } = await axiosInstance.patch<ApiResponse<Booking>>(
    `/api/customer/bookings/${bookingId}/`,
    bookingData,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as Booking;
};

export const getCustomerSingleBooking = async (
  bookingId: string,
): Promise<Booking> => {
  const { data } = await axiosInstance.get<ApiResponse<Booking>>(
    `/api/customer/bookings/${bookingId}`,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as Booking;
};

export const cancelCustomerBooking = async (
  bookingId: string,
  cancellation_data: { cancellation_reason: string },
) => {
  const { data } = await axiosInstance.patch<ApiResponse<Booking>>(
    `/api/customer/bookings/${bookingId}/cancel/`,
    cancellation_data,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as Booking;
};

export const getCustomerBookings = async (): Promise<
  GeneralListType<Booking>
> => {
  const { data } = await axiosInstance.get<
    ApiResponse<GeneralListType<Booking>>
  >(`/api/customer/bookings/`);

  if (!data.success) {
    throw data;
  }

  return data.data as GeneralListType<Booking>;
};

export const getCustomerHistoryBookingList = async (): Promise<
  GeneralListType<Booking>
> => {
  const { data } = await axiosInstance.get<
    ApiResponse<GeneralListType<Booking>>
  >(`/api/customer/bookings/history-bookings`);

  if (!data.success) {
    throw data;
  }

  return data.data as GeneralListType<Booking>;
};

type CalculatedPriceResponse = {
  calculated_price: number;
};

export const postCalculatedPriceForBookingService = async (payload: {
  service: string;
  guest_count: number;
}): Promise<CalculatedPriceResponse> => {
  const { data } = await axiosInstance.post<
    ApiResponse<CalculatedPriceResponse>
  >("api/services/price", payload);

  if (!data.success) {
    throw data;
  }

  return data.data as CalculatedPriceResponse;
};
