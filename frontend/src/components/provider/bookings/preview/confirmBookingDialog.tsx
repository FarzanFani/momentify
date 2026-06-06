"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";

type ConfirmBookingDialogProps = {
  customerName: string;
  open: boolean;
  isUpdating: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ConfirmBookingDialog({
  customerName,
  open,
  isUpdating,
  onClose,
  onConfirm,
}: ConfirmBookingDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ color: "primary.main", fontWeight: 900 }}>
        Confirm booking?
      </DialogTitle>

      <DialogContent>
        <Stack spacing={1.5}>
          <DialogContentText>
            {`By confirming this booking, you agree to fulfill all requests submitted by ${customerName}.`}
          </DialogContentText>

          <Typography
            color="error.main"
            variant="body2"
            sx={{ fontWeight: 500 }}
          >
            This action cannot be undone.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={isUpdating}
          sx={{ textTransform: "none", fontWeight: 800 }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          color="primary"
          disabled={isUpdating}
          onClick={onConfirm}
          sx={{ textTransform: "none", fontWeight: 900 }}
        >
          {isUpdating ? "Updating..." : "Confirm Booking"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
