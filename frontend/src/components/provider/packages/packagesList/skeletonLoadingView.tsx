import {
  Box,
  Card,
  CardContent,
  CardActions,
  Skeleton,
  Stack,
  Grid,
} from "@mui/material";

const stackLayerSx = (depth: number) => ({
  position: "absolute" as const,
  inset: 0,
  borderRadius: 4,
  transform: `translate(${depth * 8}px, ${depth * 4}px)`,
  zIndex: -depth,
  background:
    depth === 1
      ? "linear-gradient(180deg, #eef1fb 0%, #e4e9f8 100%)"
      : "linear-gradient(180deg, #e2e7f6 0%, #d7def2 100%)",
  border: "1px solid rgba(11, 61, 145, 0.10)",
  boxShadow: "0 10px 24px rgba(35, 25, 66, 0.08)",
});

export default function PackageCardSkeleton() {
  return (
    <Box sx={{ position: "relative", height: "100%", width: "100%" }}>
      <Box sx={stackLayerSx(2)} />
      <Box sx={stackLayerSx(1)} />

      <Card
        sx={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          width: "100%",
          minHeight: 430,
          borderRadius: 4,
          overflow: "hidden",
          background: "linear-gradient(180deg, #ffffff 0%, #F7FAFF 100%)",
          boxShadow: "0 14px 40px rgba(7, 42, 99, 0.12)",
          border: "1px solid rgba(11, 61, 145, 0.12)",
        }}
      >
        <Box
          sx={{
            height: 110,
            background:
              "linear-gradient(135deg, rgba(7, 42, 99, 0.18) 0%, rgba(11, 61, 145, 0.14) 55%, rgba(201, 162, 39, 0.18) 100%)",
            position: "relative",
          }}
        >
          <Skeleton
            variant="rounded"
            width={90}
            height={26}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              borderRadius: 5,
              bgcolor: "rgba(255,255,255,0.45)",
            }}
          />

          <Skeleton
            variant="rounded"
            width={80}
            height={26}
            sx={{
              position: "absolute",
              bottom: 16,
              left: 16,
              borderRadius: 5,
              bgcolor: "rgba(255,255,255,0.55)",
            }}
          />
        </Box>

        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack spacing={1.8}>
            <Skeleton variant="text" width="75%" height={32} />

            <Box>
              <Skeleton variant="text" width="100%" height={22} />
              <Skeleton variant="text" width="70%" height={22} />
            </Box>

            <Grid container spacing={1.5}>
              {[1, 2, 3, 4].map((item) => (
                <Grid key={item} size={{ xs: 6 }}>
                  <Box
                    sx={{
                      p: 1.4,
                      borderRadius: 2.5,
                      backgroundColor: "#fff",
                      border: "1px solid rgba(11, 61, 145, 0.08)",
                    }}
                  >
                    <Stack spacing={0.7}>
                      <Skeleton variant="circular" width={20} height={20} />
                      <Skeleton variant="text" width="65%" height={18} />
                      <Skeleton variant="text" width="85%" height={22} />
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Box
              sx={{
                mt: 1,
                p: 2,
                borderRadius: 3,
                background:
                  "linear-gradient(135deg, rgba(11, 61, 145, 0.08) 0%, rgba(201, 162, 39, 0.14) 100%)",
                border: "1px solid rgba(11, 61, 145, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexDirection: "row-reverse",
              }}
            >
              <Skeleton variant="text" width={110} height={32} />
              <Skeleton variant="text" width={90} height={20} />
            </Box>
          </Stack>
        </CardContent>

        <CardActions sx={{ px: { xs: 2.5, sm: 3 }, pb: 3, pt: 0 }}>
          <Skeleton
            variant="rounded"
            width="100%"
            height={44}
            sx={{
              borderRadius: 3,
              bgcolor: "rgba(11, 61, 145, 0.14)",
            }}
          />
        </CardActions>
      </Card>
    </Box>
  );
}
