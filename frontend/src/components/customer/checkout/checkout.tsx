"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { useSnackbar } from "@/contexts/SnackbarContext";
import { usePostCustomerBooking } from "@/hooks/booking";
import { useGetSinglePublicService } from "@/hooks/service";
import { useAppSelector } from "@/store/hook";
import { extractApiError } from "@/utils/extractApiError";
import { combineDateAndTime } from "@/utils/helperFunctions";
import {
  CustomerBookingFormValues,
  CustomerBookingPageLayout,
} from "./bookingForm";
import CheckoutPageSkeleton from "./checkoutSkeleton";
import CheckoutUnavailableView from "./checkoutUnavalable";
import NoServiceSelectedView from "./noService";

export default function CustomerCheckoutPage() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("serviceId");

  if (!serviceId) {
    return <NoServiceSelectedView />;
  }

  return <CustomerCheckoutForm serviceId={serviceId} />;
}

function CustomerCheckoutForm({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const { showSnackbar } = useSnackbar();
  const [useRegisterContactInfo, setRegisterContactInfo] = useState(false);

  const {
    data: service,
    isLoading,
    isError,
  } = useGetSinglePublicService(serviceId);

  const { mutate: createBooking, isPending: isBookingCreateLoading } =
    usePostCustomerBooking();

  const { control, handleSubmit, setValue, clearErrors, formState } =
    useForm<CustomerBookingFormValues>({
      mode: "onChange",
      defaultValues: {
        location: "",
        special_request: "",
        contact_detail_full_name: "",
        contact_detail_email: "",
        contact_detail_phone_number: "",
        start_date: "",
        start_time: "",
        event_type: "",
        payment_option: "REQUEST_BOOKING_FIRST",
      },
    });

  const handleSubmitBooking = (data: CustomerBookingFormValues) => {
    if (!service) return;

    const { start_date, start_time, ...bookingData } = data;

    createBooking(
      {
        ...bookingData,
        starts_at: combineDateAndTime(start_date, start_time),
        service: service.id,
      },
      {
        onSuccess: (data) => {
          showSnackbar("Checkout Succesfull", "success");
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

  useEffect(() => {
    if (useRegisterContactInfo) {
      setValue("contact_detail_email", user?.email ?? "");
      clearErrors("contact_detail_email");
      setValue(
        "contact_detail_full_name",
        `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim(),
      );
      clearErrors("contact_detail_full_name");
      setValue("contact_detail_phone_number", user?.phone_number ?? "");
      clearErrors("contact_detail_phone_number");
    } else {
      setValue("contact_detail_email", "");
      clearErrors("contact_detail_email");
      setValue("contact_detail_full_name", "");
      clearErrors("contact_detail_full_name");
      setValue("contact_detail_phone_number", "");
      clearErrors("contact_detail_phone_number");
    }
  }, [
    useRegisterContactInfo,
    user?.email,
    user?.first_name,
    user?.last_name,
    user?.phone_number,
    setValue,
    clearErrors,
  ]);

  if (isLoading) {
    return <CheckoutPageSkeleton />;
  }

  if (isError || !service) {
    return <CheckoutUnavailableView />;
  }

  return (
    <CustomerBookingPageLayout
      title="Checkout"
      subtitle="Review the service and send your booking request."
      backLabel="Back to Service"
      onBack={() => router.push(`/services/${service.id}/preview`)}
      control={control}
      service={service}
      formState={formState}
      onSubmit={handleSubmit(handleSubmitBooking)}
      submitLabel="Request Booking"
      submittingLabel="Requesting..."
      isSubmitting={isBookingCreateLoading}
      footerNote="You are not charged at this stage. The provider will review your request and confirm availability."
      useRegisterContactInfo={useRegisterContactInfo}
      onUseRegisterContactInfoChange={setRegisterContactInfo}
    />
  );
}
