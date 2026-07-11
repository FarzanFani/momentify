"use client";

import { Box, Grid, Typography } from "@mui/material";
import * as styles from "./style";
import { PeopleAlt, Settings, Store } from "@mui/icons-material";
import DashboardCard from "./card/dashboardCard";

export default function AdminDashboard() {
  return (
    <Box sx={styles.page}>
      <Grid container sx={styles.pageContainer} spacing={8}>
        <Grid size={6} sx={styles.container}>
          <DashboardCard
            title="Users Management"
            total={60}
            needVerification={20}
            description="Manage all platform users including admins, providers, and customers. View details, update roles, and control account access."
            icon={<PeopleAlt fontSize="large" />}
            link="/admin/users"
            bgcolor="green"
            compact={false}
          />
        </Grid>
        <Grid size={6} sx={styles.container}>
          <DashboardCard
            title="Providers Management"
            total={60}
            needVerification={20}
            description="Manage service providers, review profiles, approve accounts, and monitor performance."
            icon={<Store fontSize="large" />}
            link="/admin/provider"
            bgcolor="navy"
            compact={false}
          />
        </Grid>

        <Grid size={6} sx={styles.container}>
          <DashboardCard
            title="Setting"
            total={60}
            needVerification={20}
            description="Manage service providers, review profiles, approve accounts, and monitor performance."
            icon={<Settings fontSize="large" />}
            link="/admin/provider"
            bgcolor="black"
            compact={false}
          />
        </Grid>
        <Grid size={6} sx={styles.container}></Grid>
      </Grid>
    </Box>
  );
}
