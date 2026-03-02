"use client";

import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function EmptyCompanyCard() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 700,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "grey.300",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" fontWeight={700} color="primary.main" mb={2}>
            You don&apos;t have a company registered.
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Register your company first. If you are not a service provider,
            please contact administrator.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push("/provider/company/add")}
            sx={{ textTransform: "none", px: 4, py: 1.2, borderRadius: 2 }}
          >
            Register Company
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
