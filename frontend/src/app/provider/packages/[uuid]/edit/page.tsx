"use client";

import EditPackageForm from "@/components/provider/packages/editPackage/editPackage";
import { useParams } from "next/navigation";

export default function PackageEditPage() {
  const { uuid } = useParams<{ uuid: string }>();
  return <EditPackageForm uuid={uuid} />;
}
