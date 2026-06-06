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

type RejectBookingDialogProps = {
  customerName: string;
  open: boolean;
  isUpdating: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function RejectBookingDialog({
  customerName,
  open,
  isUpdating,
  onClose,
  onConfirm,
}: RejectBookingDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ color: "error.main", fontWeight: 900 }}>
        Reject booking?
      </DialogTitle>

      <DialogContent>
        <Stack spacing={1.5}>
          <DialogContentText>
            {`Are you sure you want to reject the booking request from ${customerName}?`}
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
          color="error"
          disabled={isUpdating}
          onClick={onConfirm}
          sx={{ textTransform: "none", fontWeight: 900 }}
        >
          {isUpdating ? "Updating..." : "Confirm Rejection"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
