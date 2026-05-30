import { Box, ListItemText, MenuItem, Select } from "@mui/material";

import { Typography } from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { DropdownOptionItem } from "@/types/general";
import {
  getOutlinedInputStyles,
  INPUT_HEIGHT,
} from "@/components/common/inputStyles";

interface MultiSelectDropdownProps {
  label: string;
  options: DropdownOptionItem[] | string[];
  onChange: (value: string[]) => void;
  value: string[];
  fullWidth?: boolean;
  placeholder?: string;
}

export default function MultiSelectDropdown({
  label,
  options,
  onChange,
  value,
  fullWidth = true,
  placeholder,
}: MultiSelectDropdownProps) {
  const normalizedOptions: DropdownOptionItem[] = options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option,
  );

  const selectedLabels = normalizedOptions
    .filter((option) => (value ?? []).includes(option.value))
    .map((option) => option.label);

  const hasValue = selectedLabels.length > 0;

  return (
    <Box sx={{ width: fullWidth ? "100%" : "300px" }}>
      <Typography color="primary.dark" fontWeight={"500"} mb={"4px"}>
        {label}
      </Typography>
      <Select
        value={value}
        displayEmpty
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
        renderValue={() => {
          if (!hasValue) {
            return <Typography color="primary.light">{placeholder}</Typography>;
          }
          return (
            <Typography color="primary.dark" fontWeight={"600"}>
              {selectedLabels.join(", ")}
            </Typography>
          );
        }}
        sx={{
          ...getOutlinedInputStyles(hasValue, INPUT_HEIGHT),
          width: fullWidth ? "100%" : "300px",
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
