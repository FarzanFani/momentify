"use client";

import Footer from "@/components/public/layout/footer";
import NavBar from "@/components/public/layout/navBar";
import { useAppSelector } from "@/store/hook";
import { Box } from "@mui/material";
import { usePathname } from "next/navigation";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isInLandingPage = pathname === "/";
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  return (
    <>
      <NavBar />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: isInLandingPage ? undefined : "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 80px)",
          pb: isInLandingPage ? 0 : "30px",
          pt: isInLandingPage ? 0 : isAuthenticated ? "95px" : "75px",
          px: 0,
        }}
      >
        {children}
      </Box>
      <Footer />
    </>
  );
}
