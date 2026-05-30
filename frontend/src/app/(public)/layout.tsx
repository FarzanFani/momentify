"use client";

import Footer from "@/components/public/layout/footer";
import NavBar from "@/components/public/layout/navBar";
import { useAppSelector } from "@/store/hook";
import { Box } from "@mui/material";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  return (
    <>
      <NavBar />
      <Box pt={isAuthenticated ? "95px" : "75px"}>{children}</Box>
      <Footer />
    </>
  );
}
