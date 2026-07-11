import { Grid, Box, Skeleton, Stack } from "@mui/material";

export default function CheckoutPageSkeleton() {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        px: { xs: 2, sm: 3 },
        py: 3,
        background: "linear-gradient(180deg, #F7FAFF 0%, #ffffff 100%)",
      }}
    >
      <Stack spacing={3}>
        <Box>
          <Skeleton variant="text" width={220} height={52} />
          <Skeleton variant="text" width={420} height={28} />
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={3}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  variant="rounded"
                  height={index === 2 ? 250 : 220}
                  sx={{ borderRadius: 4 }}
                />
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={2.5}>
              <Skeleton
                variant="rounded"
                height={260}
                sx={{ borderRadius: 4 }}
              />
              <Skeleton
                variant="rounded"
                height={230}
                sx={{ borderRadius: 4 }}
              />
              <Skeleton
                variant="rounded"
                height={52}
                sx={{ borderRadius: 3 }}
              />
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}
