"use client";

import { useEffect } from "react";
import { SaveRounded } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { useSnackbar } from "@/contexts/SnackbarContext";
import {
  useGetSingleCustomerBooking,
  useUpdateCustomerBooking,
} from "@/hooks/booking";
import { useGetSinglePublicService } from "@/hooks/service";
import type { Booking } from "@/services/customer/booking";
import { extractApiError } from "@/utils/extractApiError";
import {
  combineDateAndTime,
  getDateInputValue,
  getTimeInputValue,
} from "@/utils/helperFunctions";
import {
  CustomerBookingFormValues,
  CustomerBookingPageLayout,
} from "../../checkout/bookingForm";
import CheckoutPageSkeleton from "../../checkout/checkoutSkeleton";
import CheckoutUnavailableView from "../../checkout/checkoutUnavalable";

export default function CustomerBookingEditPage({ uuid }: { uuid: string }) {
  const router = useRouter();
  const { data: booking, isLoading: isBookingLoading } =
    useGetSingleCustomerBooking(uuid);

  useEffect(() => {
    if (booking && booking.status.toLowerCase() !== "pending") {
      router.replace(`/customer/booking/${booking.id}/preview`);
    }
  }, [booking, router]);

  if (isBookingLoading) {
    return <CheckoutPageSkeleton />;
  }

  if (!booking || booking.status.toLowerCase() !== "pending") {
    return <CheckoutUnavailableView />;
  }

  return <CustomerBookingEditForm uuid={uuid} booking={booking} />;
}

function CustomerBookingEditForm({
  uuid,
  booking,
}: {
  uuid: string;
  booking: Booking;
}) {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { data: service, isLoading, isError } = useGetSinglePublicService(
    booking.service,
  );
  const { mutate: updateBooking, isPending: isUpdatingBooking } =
    useUpdateCustomerBooking();

  const { control, handleSubmit, reset, formState } =
    useForm<CustomerBookingFormValues>({
      mode: "onChange",
      defaultValues: {
        service: booking.service,
        location: booking.location ?? "",
        special_request: booking.special_request ?? "",
        contact_detail_full_name: booking.contact_detail_full_name ?? "",
        contact_detail_email: booking.contact_detail_email ?? "",
        contact_detail_phone_number: booking.contact_detail_phone_number ?? "",
        guest_numbers: booking.guest_numbers,
        event_type: booking.event_type ?? "",
        start_date: getDateInputValue(booking.starts_at),
        start_time: getTimeInputValue(booking.starts_at),
        payment_option: booking.payment_option ?? "REQUEST_BOOKING_FIRST",
      },
    });

  useEffect(() => {
    reset({
      service: booking.service,
      location: booking.location ?? "",
      special_request: booking.special_request ?? "",
      contact_detail_full_name: booking.contact_detail_full_name ?? "",
      contact_detail_email: booking.contact_detail_email ?? "",
      contact_detail_phone_number: booking.contact_detail_phone_number ?? "",
      guest_numbers: booking.guest_numbers,
      event_type: booking.event_type ?? "",
      start_date: getDateInputValue(booking.starts_at),
      start_time: getTimeInputValue(booking.starts_at),
      payment_option: booking.payment_option ?? "REQUEST_BOOKING_FIRST",
    });
  }, [booking, reset]);

  const handleUpdateBooking = (data: CustomerBookingFormValues) => {
    const { start_date, start_time, ...bookingData } = data;

    updateBooking(
      {
        bookingId: uuid,
        bookingData: {
          ...bookingData,
          starts_at: combineDateAndTime(start_date, start_time),
          service: booking.service,
        },
      },
      {
        onSuccess: (data) => {
          showSnackbar("Booking Updated Succefully", "success");
          router.push(`/customer/booking/${data.id}/preview`);
        },
        onError: (error) => {
          showSnackbar(
            extractApiError(error as Parameters<typeof extractApiError>[0]),
            "error",
          );
        },
      },
    );
  };

  if (isLoading) {
    return <CheckoutPageSkeleton />;
  }

  if (isError || !service) {
    return <CheckoutUnavailableView />;
  }

  return (
    <CustomerBookingPageLayout
      title="Edit Booking"
      subtitle="Update your pending booking request before the provider confirms it."
      backLabel="Back to Preview"
      onBack={() => router.push(`/customer/booking/${uuid}/preview`)}
      control={control}
      service={service}
      formState={formState}
      onSubmit={handleSubmit(handleUpdateBooking)}
      submitLabel="Save Booking"
      submittingLabel="Saving..."
      isSubmitting={isUpdatingBooking}
      submitIcon={<SaveRounded />}
      footerNote="Only pending bookings can be edited. The provider will review the updated request."
    />
  );
}
