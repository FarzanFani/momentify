"use client";

import { Box, Typography, Select, MenuItem, ListItemText } from "@mui/material";
import { DropdownOptionItem } from "@/types/general";

interface DropdownProps {
  label: string;
  value: string;
  options: DropdownOptionItem[] | string[];
  onChange: (value: string) => void;
  fullWidth?: boolean;
}
export default function SelectDropdown({
  label,
  value,
  options,
  onChange,
  fullWidth = true,
}: DropdownProps) {
  const normalizedOptions: DropdownOptionItem[] = options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option,
  );

  const selectedOption = normalizedOptions.find(
    (option) => option.value === value,
  );

  return (
    <Box sx={{ width: fullWidth ? "100%" : "300px" }}>
      <Typography color="primary.dark" fontWeight={"500"} mb={"4px"}>
        {label}
      </Typography>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        fullWidth={fullWidth}
        renderValue={() => (
          <Typography color="primary.dark" fontWeight={"600"}>
            {selectedOption?.label ?? ""}
          </Typography>
        )}
        sx={{
          width: fullWidth ? "100%" : "300px",
          height: "45px",
        }}
      >
        {normalizedOptions.map((option) => {
          return (
            <MenuItem key={option.value} value={option.value}>
              <ListItemText
                primary={option.label}
                sx={{
                  color: "primary.dark",
                }}
                style={{ paddingTop: 9 }}
              />
            </MenuItem>
          );
        })}
      </Select>
    </Box>
  );
}
