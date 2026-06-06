"use client";

import PublicLayout from "@/app/(public)/layout";
import { useAppSelector } from "@/store/hook";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isAuthInitialized } = useAppSelector(
    (state) => state.auth,
  );
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isAuthInitialized && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthInitialized, isAuthenticated, pathname, router]);

  if (!isAuthInitialized || !isAuthenticated) {
    return null;
  }

  return <PublicLayout>{children}</PublicLayout>;
}
