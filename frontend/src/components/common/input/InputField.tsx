"use client";

import { Box, Typography, OutlinedInput, FormHelperText } from "@mui/material";
import "./style.css";

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  type?: string;
  error?: boolean;
  helperText?: string;
  multiline?: boolean;
  rows?: number;
  fullWidth?: boolean;
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
}: InputFieldProps) {
  return (
    <Box className="input-field-wrapper">
      <Typography variant="body1" className="input-field-label">
        {label}
      </Typography>
      <OutlinedInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size="medium"
        placeholder={placeholder}
        fullWidth={fullWidth}
        className={`input-field ${multiline ? "input-field-multiline" : ""}`}
        type={type}
        error={error}
        multiline={multiline}
        rows={multiline ? rows : undefined}
      />
      {helperText && (
        <FormHelperText error={error}>{helperText}</FormHelperText>
      )}
    </Box>
  );
}
