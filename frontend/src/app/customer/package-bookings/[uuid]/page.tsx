"use client";

import CustomerPackageBookingDetail from "@/components/customer/packageBooking/packageBookingDetail";
import { useParams } from "next/navigation";

export default function CustomerPackageBookingPage() {
  const { uuid } = useParams<{ uuid: string }>();
  return <CustomerPackageBookingDetail uuid={uuid} />;
}
