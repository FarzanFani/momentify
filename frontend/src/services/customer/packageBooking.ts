import axiosInstance from "@/api/axiosInstance";
import { ApiResponse } from "@/types/general";
import { GeneralListType } from "../provider/services";

export type PackageBookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "COMPLETED";

export type PackagePaymentOption = "FULL" | "DEPOSIT" | "INSTALLMENTS";

export type PackageScheduleEntry = {
  item: string;
  starts_at: string;
};

export type PackageBookingPayload = {
  package: string;
  guest_numbers: number;
  addons: string[];
  payment_option: PackagePaymentOption;
  schedule: PackageScheduleEntry[];
  location: string;
  contact_detail_full_name: string;
  contact_detail_email: string;
  contact_detail_phone_number: string;
  special_request: string;
};

export type PackageBookingItem = {
  id: string;
  service: string;
  service_name: string;
  service_category_name: string | null;
  duration_minutes: number;
  price: string;
  quantity: number;
  line_total: string;
  is_addon: boolean;
  booking: string | null;
  starts_at: string | null;
  ends_at: string | null;
  booking_status: string | null;
};

export type PackageBooking = {
  id: string;
  package: string;
  package_name: string;
  package_cover_image: string | null;
  company: string;
  company_name: string;
  customer: string;
  customer_name: string;
  status: PackageBookingStatus;
  guest_numbers: number;
  package_price: string;
  extra_guests_price: string;
  addons_price: string;
  total_price: string;
  payment_option: PackagePaymentOption;
  deposit_amount: string | null;
  installment_count: number | null;
  installment_interval: string | null;
  installment_amount: string | null;
  is_paid: boolean;
  schedule_deadline: string | null;
  unscheduled_count: number;
  is_schedule_overdue: boolean;
  location: string;
  contact_detail_full_name: string;
  contact_detail_email: string;
  contact_detail_phone_number: string;
  special_request: string;
  items: PackageBookingItem[];
  created_at: string;
  updated_at: string;
};

export const postCustomerPackageBooking = async (
  payload: PackageBookingPayload,
): Promise<PackageBooking> => {
  const { data } = await axiosInstance.post<ApiResponse<PackageBooking>>(
    "/api/customer/package-bookings/",
    payload,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as PackageBooking;
};

export const getCustomerPackageBookings = async (): Promise<
  GeneralListType<PackageBooking>
> => {
  const { data } = await axiosInstance.get<
    ApiResponse<GeneralListType<PackageBooking>>
  >("/api/customer/package-bookings/");

  if (!data.success) {
    throw data;
  }

  return data.data as GeneralListType<PackageBooking>;
};

export const getCustomerPackageBooking = async (
  id: string,
): Promise<PackageBooking> => {
  const { data } = await axiosInstance.get<ApiResponse<PackageBooking>>(
    `/api/customer/package-bookings/${id}/`,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as PackageBooking;
};

export const postSchedulePackageBooking = async ({
  id,
  schedule,
}: {
  id: string;
  schedule: PackageScheduleEntry[];
}): Promise<PackageBooking> => {
  const { data } = await axiosInstance.post<ApiResponse<PackageBooking>>(
    `/api/customer/package-bookings/${id}/schedule/`,
    { schedule },
  );

  if (!data.success) {
    throw data;
  }

  return data.data as PackageBooking;
};

export const getProviderPackageBookings = async (params: {
  status?: string;
}): Promise<GeneralListType<PackageBooking>> => {
  const { data } = await axiosInstance.get<
    ApiResponse<GeneralListType<PackageBooking>>
  >("/api/provider/package-bookings/", { params });

  if (!data.success) {
    throw data;
  }

  return data.data as GeneralListType<PackageBooking>;
};

export const getProviderPackageBooking = async (
  id: string,
): Promise<PackageBooking> => {
  const { data } = await axiosInstance.get<ApiResponse<PackageBooking>>(
    `/api/provider/package-bookings/${id}/`,
  );

  if (!data.success) {
    throw data;
  }

  return data.data as PackageBooking;
};

export const patchProviderPackageBookingStatus = async ({
  id,
  status,
}: {
  id: string;
  status: "CONFIRMED" | "REJECTED";
}): Promise<PackageBooking> => {
  const { data } = await axiosInstance.patch<ApiResponse<PackageBooking>>(
    `/api/provider/package-bookings/${id}/`,
    { status },
  );

  if (!data.success) {
    throw data;
  }

  return data.data as PackageBooking;
};
