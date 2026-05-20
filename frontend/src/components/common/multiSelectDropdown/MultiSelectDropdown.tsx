import {
  Box,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";

import { Typography } from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { DropdownOptionItem } from "@/types/general";

interface MultiSelectDropdownProps {
  label: string;
  options: DropdownOptionItem[] | string[];
  onChange: (value: string[]) => void;
  value: string[];
  fullWidth?: boolean;
}

export default function MultiSelectDropdown({
  label,
  options,
  onChange,
  value,
  fullWidth = true,
}: MultiSelectDropdownProps) {
  const normalizedOptions: DropdownOptionItem[] = options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option,
  );

  console.log(value);

  const selectedLabels = normalizedOptions
    .filter((option) => (value ?? []).includes(option.value))
    .map((option) => option.label);

  return (
    <Box sx={{ width: fullWidth ? "100%" : "300px" }}>
      <Typography color="primary.dark" fontWeight={"500"} mb={"4px"}>
        {label}
      </Typography>
      <Select
        value={value}
        onChange={(e) => {
          const selectedValue = e.target.value;

          onChange(
            typeof selectedValue === "string"
              ? selectedValue.split(",")
              : selectedValue,
          );
        }}
        multiple
        fullWidth
        renderValue={() => (
          <Typography color="primary.dark" fontWeight={"600"}>
            {selectedLabels.join(", ")}
          </Typography>
        )}
        sx={{
          width: fullWidth ? "100%" : "300px",
          height: "45px",
        }}
      >
        {normalizedOptions.map((option) => {
          const selected = (value ?? []).includes(option.value);
          const SelectionIcon = selected
            ? CheckBoxIcon
            : CheckBoxOutlineBlankIcon;
          return (
            <MenuItem key={option.value} value={option.value}>
              <SelectionIcon
                color="primary"
                fontSize="small"
                style={{
                  marginRight: 8,
                  paddingTop: 9,
                  boxSizing: "content-box",
                }}
              />
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
