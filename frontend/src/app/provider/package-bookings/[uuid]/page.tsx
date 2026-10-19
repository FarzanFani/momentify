"use client";

import ProviderPackageBookingDetail from "@/components/provider/packageBookings/packageBookingDetail";
import { useParams } from "next/navigation";

export default function ProviderPackageBookingPage() {
  const { uuid } = useParams<{ uuid: string }>();
  return <ProviderPackageBookingDetail uuid={uuid} />;
}
