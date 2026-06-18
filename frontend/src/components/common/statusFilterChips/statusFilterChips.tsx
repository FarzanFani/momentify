import { Box, Chip } from "@mui/material";

type DropdownOptionItem = {
  label: string;
  value: string;
};

type StatusFilterChipsProps = {
  options: DropdownOptionItem[];
  value: string;
  onChange: (value: string) => void;
};

export const chipColors: Record<
  string,
  {
    backgroundColor: string;
    color: string;
    activeBackgroundColor: string;
  }
> = {
  ALL: {
    backgroundColor: "#F1F5F9",
    activeBackgroundColor: "#CBD5E1",
    color: "#334155",
  },
  PENDING: {
    backgroundColor: "#FEF3C7",
    activeBackgroundColor: "#FBBF24",
    color: "#92400E",
  },
  CONFIRMED: {
    backgroundColor: "#DCFCE7",
    activeBackgroundColor: "#86EFAC",
    color: "#166534",
  },
  COMPLETED: {
    backgroundColor: "#DBEAFE",
    activeBackgroundColor: "#93C5FD",
    color: "#1D4ED8",
  },
  CANCELLED: {
    backgroundColor: "#FEE2E2",
    activeBackgroundColor: "#FCA5A5",
    color: "#991B1B",
  },
  REJECTED: {
    backgroundColor: "#F3E8FF",
    activeBackgroundColor: "#D8B4FE",
    color: "#6B21A8",
  },
};

export default function StatusFilterChips({
  options,
  value,
  onChange,
}: StatusFilterChipsProps) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.2,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {options.map((option) => {
        const isActive = value === option.value;

        const colors = chipColors[option.value] ?? {
          backgroundColor: "#E2E8F0",
          activeBackgroundColor: "#CBD5E1",
          color: "#334155",
        };

        return (
          <Chip
            key={option.value}
            label={option.label}
            clickable
            onClick={() => onChange(option.value)}
            size="medium"
            sx={{
              backgroundColor: isActive
                ? colors.activeBackgroundColor
                : colors.backgroundColor,
              color: colors.color,
              fontWeight: isActive ? 900 : 700,
              border: `1px solid ${colors.color}`,
              opacity: isActive ? 1 : 0.7,
              transform: isActive ? "scale(1.12)" : "scale(1)",
              transition: "all 0.2s ease",
              cursor: "pointer",

              "&:hover": {
                opacity: 1,
                backgroundColor: colors.activeBackgroundColor,
              },
            }}
          />
        );
      })}
    </Box>
  );
}
