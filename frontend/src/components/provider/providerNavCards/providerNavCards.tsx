"use client";

import { Box } from "@mui/material";
import {
  DashboardCustomize,
  Business,
  MiscellaneousServices,
  EventNote,
  Settings,
  Insights,
} from "@mui/icons-material";
import { usePathname } from "next/navigation";
import DashboardCard from "@/components/admin/dashboard/card/dashboardCard";
import * as styles from "@/components/admin/dashboard/style";

const navItems = [
  {
    title: "Dashboard",
    icon: <DashboardCustomize fontSize="large" />,
    link: "/provider/dashboard",
    bgcolor: "primary.main",
  },
  {
    title: "Company",
    icon: <Business fontSize="large" />,
    link: "/provider/company",
    bgcolor: "secondary.main",
  },
  {
    title: "Services",
    icon: <MiscellaneousServices fontSize="large" />,
    link: "/provider/services",
    bgcolor: "#0B3A5A",
  },
  {
    title: "Bookings",
    icon: <EventNote fontSize="large" />,
    link: "/provider/bookings",
    bgcolor: "#0F766E",
  },
  {
    title: "Insight",
    icon: <Insights fontSize="large" />,
    link: "/provider/insight",
    bgcolor: "#7B1FA2",
  },
  {
    title: "Setting",
    icon: <Settings fontSize="large" />,
    link: "/provider/setting",
    bgcolor: "#1E1E1E",
  },
];

export default function ProviderNavCards({
  onclick,
}: {
  onclick?: () => void;
}) {
  const pathname = usePathname();

  return (
    <Box sx={styles.sidebarWrapper}>
      <Box sx={styles.navContainer(true)}>
        {navItems.map((item) => (
          <Box
            key={item.title}
            sx={{ flex: "1 0 100%", display: "flex", justifyContent: "center" }}
          >
            <DashboardCard
              title={item.title}
              total={0}
              needVerification={0}
              description=""
              icon={item.icon}
              link={item.link}
              bgcolor={item.bgcolor}
              compact
              active={pathname.startsWith(item.link)}
              onclick={onclick}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
