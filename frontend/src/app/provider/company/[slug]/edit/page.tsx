"use client";

import CompanyEdit from "@/components/provider/company/edit/companyEdit";
import { useParams } from "next/navigation";

export default function EditPage() {
  const { slug } = useParams<{ slug: string }>();
  return <CompanyEdit companyId={slug} />;
}
