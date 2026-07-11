"use client";

import CompanyPreview from "@/components/provider/company/preview/companyPreview";
import { useParams } from "next/navigation";

export default function PreviewPage() {
  const { slug } = useParams<{ slug: string }>();
  return <CompanyPreview companyId={slug} />;
}
