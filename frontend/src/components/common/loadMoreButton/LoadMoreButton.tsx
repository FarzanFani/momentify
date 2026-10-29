import { Box, Button } from "@mui/material";

type LoadMoreButtonProps = {
  onClick: () => void;
  loading: boolean;
};

export default function LoadMoreButton({ onClick, loading }: LoadMoreButtonProps) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
      <Button
        variant="outlined"
        color="primary"
        loading={loading}
        onClick={onClick}
        sx={{
          textTransform: "none",
          fontSize: "16px",
          fontWeight: 200,
          borderRadius: "10px",
          height: "45px",
          minWidth: "160px",
        }}
      >
        Load more
      </Button>
    </Box>
  );
}
