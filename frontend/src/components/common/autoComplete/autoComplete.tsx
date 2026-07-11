"use client";

import {
  Autocomplete,
  Box,
  FormHelperText,
  TextField,
  Typography,
} from "@mui/material";
import { DropdownOptionItem } from "@/types/general";
import { CloseSharp } from "@mui/icons-material";
import { getOutlinedInputStyles } from "@/components/common/inputStyles";

interface AutocompleteDropdownProps {
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

export default function AutocompleteDropdown({
  label,
  value,
  options,
  onChange,
  fullWidth = true,
  height = 45,
  error,
  disable,
  placeholder,
}: AutocompleteDropdownProps) {
  const normalizedOptions: DropdownOptionItem[] = options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option,
  );

  const selectedOption =
    normalizedOptions.find((option) => option.value === value) ?? null;
  const hasValue = Boolean(selectedOption);

  return (
    <Box sx={{ width: fullWidth ? "100%" : "auto" }}>
      <Typography color="primary.dark" fontWeight="500" mb="4px">
        {label}
      </Typography>

      <Autocomplete
        value={selectedOption}
        options={normalizedOptions}
        disabled={disable}
        fullWidth={fullWidth}
        getOptionLabel={(option) => option.label}
        clearOnBlur
        clearOnEscape
        clearIcon={<CloseSharp />}
        isOptionEqualToValue={(option, selectedValue) =>
          option.value === selectedValue.value
        }
        onChange={(_, newValue) => {
          onChange(newValue?.value ?? "");
        }}
        renderOption={(props, option) => (
          <li {...props} key={option.value}>
            {option.label}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            error={Boolean(error)}
            sx={{
              "& .MuiInputBase-root": getOutlinedInputStyles(hasValue, height),
            }}
          />
        )}
      />

      {error && <FormHelperText error>{error}</FormHelperText>}
    </Box>
  );
}
