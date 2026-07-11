"use client";

import {
  Box,
  Typography,
  Select,
  MenuItem,
  ListItemText,
  FormHelperText,
} from "@mui/material";
import { DropdownOptionItem } from "@/types/general";
import { getOutlinedInputStyles } from "@/components/common/inputStyles";

interface DropdownProps {
  label: string;
  value: string;
  options: DropdownOptionItem[] | string[];
  onChange: (value: string) => void;
  fullWidth?: boolean;
  height?: number;
  error?: string;
  disable?: boolean;
  placeholder?: string;
}
export default function SelectDropdown({
  label,
  value,
  options,
  onChange,
  fullWidth = true,
  height = 45,
  error,
  disable,
  placeholder,
}: DropdownProps) {
  const normalizedOptions: DropdownOptionItem[] = options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option,
  );

  const selectedOption = normalizedOptions.find(
    (option) => option.value === value,
  );
  const hasValue = Boolean(selectedOption);

  return (
    <Box sx={{ width: "100%" }}>
      <Typography color="primary.dark" fontWeight={"500"} mb={"4px"}>
        {label}
      </Typography>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        fullWidth={fullWidth}
        disabled={disable}
        displayEmpty
        renderValue={() => {
          if (!selectedOption) {
            return (
              <Typography color="primary.light" fontWeight="500">
                {placeholder}
              </Typography>
            );
          }
          return (
            <Typography color="primary.dark" fontWeight={"600"}>
              {selectedOption?.label ?? ""}
            </Typography>
          );
        }}
        sx={getOutlinedInputStyles(hasValue, height)}
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
      {error && <FormHelperText error>{error}</FormHelperText>}
    </Box>
  );
}
