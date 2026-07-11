"use client";

import CustomerBookingEditPage from "@/components/customer/booking/edit/bookingEdit";
import { useParams } from "next/navigation";

export default function BookingEditPage() {
  const { uuid } = useParams<{ uuid: string }>();
  return <CustomerBookingEditPage uuid={uuid} />;
}
