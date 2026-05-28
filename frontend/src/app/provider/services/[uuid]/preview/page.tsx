"use client";

import ServiceDetailPage from "@/components/provider/services/detailService/serviceDetail";
import { useParams } from "next/navigation";

export default function ServicePreviewPage() {
  const { uuid } = useParams<{ uuid: string }>();
  return <ServiceDetailPage uuid={uuid} />;
}
