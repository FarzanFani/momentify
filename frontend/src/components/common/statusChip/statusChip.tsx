import { Chip } from "@mui/material";
import type { ChipProps } from "@mui/material";
import { formatStatus } from "@/utils/helperFunctions";

type StatusChipConfig = {
  label: string;
  backgroundColor: string;
  color: string;
  borderColor?: string;
};

type StatusChipOptions = {
  label?: string;
  size?: ChipProps["size"];
  variant?: ChipProps["variant"];
  sx?: ChipProps["sx"];
};

const statusChipConfig: Record<string, StatusChipConfig> = {
  PENDING: {
    label: "Pending",
    backgroundColor: "#FEF3C7",
    color: "#92400E",
  },
  CONFIRMED: {
    label: "Confirmed",
    backgroundColor: "#DCFCE7",
    color: "#166534",
  },
  COMPLETED: {
    label: "Completed",
    backgroundColor: "#DBEAFE",
    color: "#1D4ED8",
  },
  CANCELLED: {
    label: "Cancelled",
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
  },
  REJECTED: {
    label: "Rejected",
    backgroundColor: "#F3E8FF",
    color: "#6B21A8",
  },
  APPROVED: {
    label: "Approved",
    backgroundColor: "#DCFCE7",
    color: "#166534",
  },
  ACTIVE: {
    label: "Active",
    backgroundColor: "rgba(143, 245, 183, 0.95)",
    color: "#073b1f",
  },
  INACTIVE: {
    label: "Inactive",
    backgroundColor: "rgba(230,230,230,0.95)",
    color: "#333",
  },
  NOT_COMPLETE: {
    label: "Not Complete",
    backgroundColor: "#FFFBEB",
    color: "#92400E",
    borderColor: "#F59E0B",
  },
};

function normalizeStatus(status: string) {
  return status.trim().replaceAll("-", "_").replaceAll(" ", "_").toUpperCase();
}

export function getStatusChip(status: string, options: StatusChipOptions = {}) {
  const normalizedStatus = normalizeStatus(status);
  const config = statusChipConfig[normalizedStatus] ?? {
    label: formatStatus(status),
    backgroundColor: "#E2E8F0",
    color: "#334155",
  };

  return (
    <Chip
      label={options.label ?? config.label}
      size={options.size ?? "small"}
      variant={options.variant}
      sx={{
        backgroundColor: config.backgroundColor,
        borderColor: config.borderColor,
        color: config.color,
        fontWeight: 900,
        textTransform: "capitalize",
        ...options.sx,
      }}
    />
  );
}
