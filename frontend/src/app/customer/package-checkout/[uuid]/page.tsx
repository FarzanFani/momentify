"use client";

import PackageCheckoutPage from "@/components/customer/packageCheckout/packageCheckout";
import { useParams } from "next/navigation";

export default function CustomerPackageCheckoutPage() {
  const { uuid } = useParams<{ uuid: string }>();
  return <PackageCheckoutPage uuid={uuid} />;
}
