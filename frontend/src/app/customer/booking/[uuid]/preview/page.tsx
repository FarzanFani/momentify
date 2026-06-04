"use client";

import CustomerBookingPreviewPage from "@/components/customer/booking/preview/bookingPreview";
import { useParams } from "next/navigation";

export default function BookingPreviewPage() {
  const { uuid } = useParams<{ uuid: string }>();
  return <CustomerBookingPreviewPage uuid={uuid} />;
}
