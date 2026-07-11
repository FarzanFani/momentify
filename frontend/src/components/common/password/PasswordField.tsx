"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  OutlinedInput,
  IconButton,
  InputAdornment,
  FormHelperText,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import styles from "./PasswordField.module.css";
import { getOutlinedInputStyles } from "../inputStyles";

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  onEnterPressed?: () => void;
}

export default function PasswordField({
  value,
  onChange,
  label = "Password",
  placeholder = "Enter your password",
  error = false,
  helperText,
  onEnterPressed,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const hasValue = value !== "" && value !== null && value !== undefined;

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  return (
    <Box className={styles["password-field-wrapper"]}>
      <Typography variant="body1" className={styles["password-field-label"]}>
        {label}
      </Typography>
      <OutlinedInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size="medium"
        placeholder={placeholder}
        fullWidth
        type={showPassword ? "text" : "password"}
        error={error}
        sx={getOutlinedInputStyles(hasValue)}
        onKeyUp={(event) => {
          if (event.key === "Enter") {
            onEnterPressed?.();
          }
        }}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label={
                showPassword ? "hide the password" : "display the password"
              }
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDown}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
      />
      {helperText && (
        <FormHelperText error={error}>{helperText}</FormHelperText>
      )}
    </Box>
  );
}
