"use client";

import { Box, Typography, OutlinedInput, FormHelperText } from "@mui/material";
import {
  getOutlinedInputStyles,
  INPUT_HEIGHT,
} from "@/components/common/inputStyles";
import "./style.css";

interface InputFieldProps {
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  label: string;
  placeholder?: string;
  type?: string;
  error?: boolean;
  helperText?: string;
  multiline?: boolean;
  rows?: number;
  fullWidth?: boolean;
  disabled?: boolean;
}

export default function InputField({
  value,
  onChange,
  label,
  placeholder,
  type = "text",
  error = false,
  helperText,
  fullWidth = true,
  multiline = false,
  rows = 3,
  disabled,
}: InputFieldProps) {
  const hasValue = value !== "" && value !== null && value !== undefined;

  return (
    <Box className="input-field-wrapper">
      <Typography variant="body1" className="input-field-label">
        {label}
      </Typography>
      <OutlinedInput
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        size="medium"
        placeholder={placeholder}
        fullWidth={fullWidth}
        className={`input-field ${multiline ? "input-field-multiline" : ""}`}
        type={type}
        disabled={disabled}
        error={error}
        multiline={multiline}
        rows={multiline ? rows : undefined}
        sx={getOutlinedInputStyles(hasValue, multiline ? "auto" : INPUT_HEIGHT)}
      />
      {helperText && (
        <FormHelperText error={error}>{helperText}</FormHelperText>
      )}
    </Box>
  );
}
