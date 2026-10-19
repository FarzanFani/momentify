"use client";

import PublicPackagePreviewPage from "@/components/public/packages/packagePreview";
import { useParams } from "next/navigation";

export default function PackagePreviewPage() {
  const { uuid } = useParams<{ uuid: string }>();
  return <PublicPackagePreviewPage uuid={uuid} />;
}
