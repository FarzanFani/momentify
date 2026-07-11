// QuickManageViewSkeleton.tsx

import {
  Card,
  CardContent,
  Grid,
  Box,
  Skeleton,
  Typography,
} from "@mui/material";

type QuickManageViewEmptyProps = {
  title?: string;
  description?: string;
};

export function QuickManageViewSkeleton() {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
            sx={{
              bgcolor: "#FFFFFF",
              border: "1px solid",
              borderColor: "grey.200",
              borderRadius: 3,
              height: "100%",
              boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 1.5,
                  mb: 1.5,
                }}
              >
                <Skeleton
                  variant="text"
                  width="55%"
                  height={28}
                  sx={{ borderRadius: 1 }}
                />

                <Skeleton
                  variant="rounded"
                  width={80}
                  height={26}
                  sx={{ borderRadius: 2 }}
                />
              </Box>

              <Skeleton
                variant="text"
                width="70%"
                height={24}
                sx={{ mb: 0.75 }}
              />

              <Skeleton
                variant="text"
                width="90%"
                height={22}
                sx={{ mb: 0.75 }}
              />

              <Skeleton
                variant="text"
                width="65%"
                height={22}
                sx={{ mb: 1.5 }}
              />

              <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />

              <Grid container spacing={1}>
                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6, xl: 4 }}>
                  <Skeleton
                    variant="rounded"
                    height={32}
                    sx={{ borderRadius: 2 }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6, xl: 4 }}>
                  <Skeleton
                    variant="rounded"
                    height={32}
                    sx={{ borderRadius: 2 }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 4 }}>
                  <Skeleton
                    variant="rounded"
                    height={32}
                    sx={{ borderRadius: 2 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export function QuickManageViewEmpty({
  title = "No bookings found",
  description = "There are no pending bookings to manage right now.",
}: QuickManageViewEmptyProps) {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: 220,
        bgcolor: "#FFFFFF",
        border: "1px dashed",
        borderColor: "grey.300",
        borderRadius: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 3,
        py: 4,
      }}
    >
      <Typography
        color="primary.dark"
        fontWeight={700}
        fontSize={18}
        sx={{ mb: 1 }}
      >
        {title}
      </Typography>

      <Typography color="text.secondary" fontSize={14} sx={{ maxWidth: 360 }}>
        {description}
      </Typography>
    </Box>
  );
}
