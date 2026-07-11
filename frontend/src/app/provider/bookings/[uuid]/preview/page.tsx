"use client";

import ProviderBookingPreviewPage from "@/components/provider/bookings/preview/bookingPreview";
import { useParams } from "next/navigation";

export default function BookingPreviewPage() {
  const { uuid } = useParams<{ uuid: string }>();

  return <ProviderBookingPreviewPage uuid={uuid} />;
}
