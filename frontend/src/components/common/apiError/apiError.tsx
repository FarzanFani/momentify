import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Box, Button, Stack, Typography } from "@mui/material";

export default function ApiErrorResponse() {
  return (
    <Box
      sx={{
        width: "95%",
        maxWidth: 540,
        mx: "auto",
        mt: 3,
        p: 3,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "error.light",
        bgcolor: "rgba(211, 47, 47, 0.06)",
        boxShadow: 3,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "error.main",
            color: "common.white",
            flexShrink: 0,
          }}
        >
          <ErrorOutlineIcon />
        </Box>

        <Box>
          <Typography
            variant="h6"
            sx={{
              color: "error.dark",
              fontWeight: 800,
              mb: 0.5,
            }}
          >
            Unable to load data
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              lineHeight: 1.6,
            }}
          >
            Something went wrong. Please try again later or contact an
            administrator.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
