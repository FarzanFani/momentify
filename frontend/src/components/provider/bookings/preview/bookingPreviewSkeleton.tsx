import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Skeleton,
  Stack,
} from "@mui/material";

export default function ProviderBookingPreviewSkeleton() {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        px: { xs: 1, sm: 2, md: 3, lg: 4 },
        py: 3,
        background: "linear-gradient(180deg, #F7FAFF 0%, #ffffff 100%)",
      }}
    >
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          gap={2}
        >
          <Box>
            <Skeleton variant="text" width={260} height={52} />
            <Skeleton variant="text" width={340} height={24} />
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} gap={1.5}>
            <Skeleton variant="rounded" width={92} height={44} />
            <Skeleton variant="rounded" width={96} height={44} />
            <Skeleton variant="rounded" width={104} height={44} />
          </Stack>
        </Stack>

        <Grid container spacing={3} alignItems="flex-start">
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={3}>
              {Array.from({ length: 3 }).map((_, sectionIndex) => (
                <Card
                  key={sectionIndex}
                  sx={{
                    borderRadius: 2,
                    border: "1px solid rgba(11, 61, 145, 0.12)",
                    boxShadow: "0 12px 32px rgba(7, 42, 99, 0.1)",
                  }}
                >
                  <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                    <Stack spacing={2.5}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Skeleton variant="rounded" width={46} height={46} />

                        <Box width="100%">
                          <Skeleton variant="text" width={220} height={32} />
                          <Skeleton variant="text" width="70%" height={22} />
                        </Box>
                      </Stack>

                      <Divider />

                      <Grid container spacing={2}>
                        {Array.from({ length: sectionIndex === 2 ? 1 : 4 }).map(
                          (_, itemIndex) => (
                            <Grid
                              key={itemIndex}
                              size={{
                                xs: 12,
                                sm: sectionIndex === 2 ? 12 : 6,
                              }}
                            >
                              <Skeleton
                                variant="rounded"
                                height={82}
                                sx={{ borderRadius: 2 }}
                              />
                            </Grid>
                          ),
                        )}
                      </Grid>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={2.5}>
              <Skeleton
                variant="rounded"
                height={300}
                sx={{ borderRadius: 2 }}
              />
              <Skeleton
                variant="rounded"
                height={250}
                sx={{ borderRadius: 2 }}
              />
              <Skeleton
                variant="rounded"
                height={230}
                sx={{ borderRadius: 2 }}
              />
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}
