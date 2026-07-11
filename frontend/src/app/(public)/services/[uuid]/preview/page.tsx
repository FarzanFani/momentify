"use client";

import PublicServicePreviewPage from "@/components/public/services/preview/servicePreview";
import { useParams } from "next/navigation";

export default function ServicePreviewPage() {
  const { uuid } = useParams<{ uuid: string }>();
  return <PublicServicePreviewPage uuid={uuid} />;
}
