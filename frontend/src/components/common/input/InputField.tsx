"use client";

import { Box, Typography, OutlinedInput } from "@mui/material";
import "./style.css";

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  type?: string;
}

export default function InputField({
  value,
  onChange,
  label,
  placeholder,
  type = "text",
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
      />
    </Box>
  );
}
