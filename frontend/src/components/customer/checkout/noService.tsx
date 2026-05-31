"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import { useRouter } from "next/navigation";

export default function NoServiceSelectedView() {
  const router = useRouter();

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3 },
        py: 4,
        background: "linear-gradient(180deg, #F7FAFF 0%, #ffffff 100%)",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 620,
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid rgba(11, 61, 145, 0.12)",
          boxShadow: "0 18px 45px rgba(7, 42, 99, 0.12)",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            height: 10,
            background:
              "linear-gradient(135deg, #072a63 0%, #0B3D91 45%, #2F5FB3 72%, #C9A227 100%)",
          }}
        />

        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Stack spacing={2.5} alignItems="center">
            <Box
              sx={{
                width: 82,
                height: 82,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, rgba(11, 61, 145, 0.08) 0%, rgba(201, 162, 39, 0.18) 100%)",
                color: "#0B3D91",
              }}
            >
              <SearchOffRoundedIcon sx={{ fontSize: 46 }} />
            </Box>

            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  color: "#072a63",
                  mb: 1,
                }}
              >
                No service selected
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.7,
                  maxWidth: 460,
                  mx: "auto",
                }}
              >
                To continue with checkout, please choose a service first. You
                can browse available services and select the one you want to
                book.
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{
                width: "100%",
                maxWidth: 250,
                pt: 1,
              }}
            >
              <Button
                fullWidth
                variant="contained"
                startIcon={<ExploreRoundedIcon />}
                onClick={() => router.replace("/services")}
                sx={{
                  borderRadius: 3,
                  py: 1.2,
                  fontWeight: 800,
                  textTransform: "none",
                  color: "#fff",
                  background:
                    "linear-gradient(135deg, #0B3D91 0%, #2F5FB3 65%, #C9A227 100%)",
                  boxShadow: "0 10px 22px rgba(11, 61, 145, 0.28)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #072a63 0%, #0B3D91 60%, #8C6A12 100%)",
                    boxShadow: "0 12px 26px rgba(11, 61, 145, 0.34)",
                  },
                }}
              >
                Browse Services
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
