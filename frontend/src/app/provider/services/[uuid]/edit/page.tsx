"use client";

import EditServiceForm from "@/components/provider/services/editService/editService";
import { useParams } from "next/navigation";

export default function ServicePreviewPage() {
  const { uuid } = useParams<{ uuid: string }>();
  return <EditServiceForm uuid={uuid} />;
}
