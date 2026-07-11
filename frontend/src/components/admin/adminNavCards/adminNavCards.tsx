"use client";

import { Box } from "@mui/material";
import { PeopleAlt, Settings, Store } from "@mui/icons-material";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import DashboardCard from "../dashboard/card/dashboardCard";
import * as styles from "../dashboard/style";

type Props = {
  variant: "dashboard" | "sidebar";
};

const cardTransition = {
  type: "spring" as const,
  stiffness: 200,
  damping: 30,
};

export default function AdminNavCards({ variant }: Props) {
  const isSidebar = variant === "sidebar";
  const pathname = usePathname();
  const itemStyle = styles.cardItem(isSidebar);

  return (
    <Box sx={isSidebar ? styles.sidebarWrapper : styles.page}>
      <Box sx={styles.navContainer(isSidebar)}>
        <motion.div layout transition={cardTransition} style={itemStyle}>
          <DashboardCard
            title="Users Management"
            total={60}
            needVerification={20}
            description="Manage all platform users including admins, providers, and customers. View details, update roles, and control account access."
            icon={<PeopleAlt fontSize="large" />}
            link="/admin/user"
            bgcolor="secondary.main"
            compact={isSidebar}
            active={pathname.startsWith("/admin/user")}
          />
        </motion.div>

        <motion.div layout transition={cardTransition} style={itemStyle}>
          <DashboardCard
            title="Providers Management"
            total={60}
            needVerification={20}
            description="Manage service providers, review profiles, approve accounts, and monitor performance."
            icon={<Store fontSize="large" />}
            link="/admin/provider"
            bgcolor="navy"
            compact={isSidebar}
            active={pathname.startsWith("/admin/provider")}
          />
        </motion.div>

        <motion.div layout transition={cardTransition} style={itemStyle}>
          <DashboardCard
            title="Setting"
            total={60}
            needVerification={20}
            description="Manage service providers, review profiles, approve accounts, and monitor performance."
            icon={<Settings fontSize="large" />}
            link="/admin/settings"
            bgcolor="black"
            compact={isSidebar}
            active={pathname.startsWith("/admin/settings")}
          />
        </motion.div>

        {!isSidebar && <Box sx={styles.dashboardSpacer} />}
      </Box>
    </Box>
  );
}
