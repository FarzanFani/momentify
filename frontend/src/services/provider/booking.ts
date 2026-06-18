import axiosInstance from "@/api/axiosInstance";
import { Booking } from "../customer/booking";
import { GeneralListType } from "./services";
import { ApiResponse } from "@/types/general";

export type ProviderBookingListParams = {
  search?: string;
  status?: string;
  page_size?: number;
  page?: number;
  service_id?: string;
  start_date?: string;
  end_date?: string;
};

export type BookingList = GeneralListType<Booking>;

export type ProviderBookingsSummary = {
  total_price: number;
  total_booking_count: number;
  pending_count: number;
  confirmed_count: number;
  completed_count: number;
};

export const getProviderBookingSummaey =
  async (): Promise<ProviderBookingsSummary> => {
    const { data } = await axiosInstance.get<
      ApiResponse<ProviderBookingsSummary>
    >("/api/provider/bookings/summary");

    if (!data) {
      throw data;
    }

    return data.data as ProviderBookingsSummary;
  };

export const getProviderBookingsList = async (
  params: ProviderBookingListParams,
): Promise<BookingList> => {
  const { data } = await axiosInstance.get<ApiResponse<BookingList>>(
    "/api/provider/bookings",
    { params },
  );

  if (!data) {
    throw data;
  }

  return data.data as BookingList;
};

export const getProviderSingleBooking = async (
  bookingId: string,
): Promise<Booking> => {
  const { data } = await axiosInstance.get<ApiResponse<Booking>>(
    `/api/provider/bookings/${bookingId}`,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as Booking;
};

export const updateProviderBookingStatus = async ({
  bookingId,
  status,
}: {
  bookingId: string;
  status: "CONFIRMED" | "REJECTED";
}): Promise<Booking> => {
  const { data } = await axiosInstance.patch<ApiResponse<Booking>>(
    `/api/provider/bookings/${bookingId}/`,
    { status },
  );

  if (!data.success) {
    throw data;
  }

  return data.data as Booking;
};
