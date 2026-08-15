"use client";

import PackageDetailPage from "@/components/provider/packages/packageDetail/packageDetail";
import { useParams } from "next/navigation";

export default function PackagePreviewPage() {
  const { uuid } = useParams<{ uuid: string }>();
  return <PackageDetailPage uuid={uuid} />;
}
