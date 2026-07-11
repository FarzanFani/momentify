"use client";

import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import EmptyCompanyCard from "./emptyCompanyCard/EmptyCompanyCard";

export default function ProviderDashboard() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  if (user?.has_company_registered !== true) {
    return <EmptyCompanyCard />;
  }

  return <div>ProviderDashboard</div>;
}
