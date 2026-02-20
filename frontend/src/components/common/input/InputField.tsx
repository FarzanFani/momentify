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
}

export default function InputField({
  value,
  onChange,
  label,
  placeholder,
  type = "text",
  error = false,
  helperText,
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
        fullWidth
        className="input-field"
        type={type}
        error={error}
      />
      {helperText && (
        <FormHelperText error={error}>{helperText}</FormHelperText>
      )}
    </Box>
  );
}
