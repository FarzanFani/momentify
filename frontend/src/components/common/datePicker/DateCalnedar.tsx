"use client";

import { useRef, useState } from "react";
import {
  Box,
  Typography,
  OutlinedInput,
  FormHelperText,
  InputAdornment,
  IconButton,
  Popover,
  SvgIcon,
} from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs, { type Dayjs } from "dayjs";

import {
  getOutlinedInputStyles,
  INPUT_HEIGHT,
} from "@/components/common/inputStyles";

import styles from "../input/InputField.module.css";

interface DateInputFieldProps {
  value: string | null;
  onChange: (value: string | null) => void;
  onBlur?: () => void;

  label: string;
  placeholder?: string;

  error?: boolean;
  helperText?: string;

  fullWidth?: boolean;
  disabled?: boolean;
  displayFormat?: string;
  outputFormat?: string;

  disablePast?: boolean;
  disableFuture?: boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  shouldDisableDate?: (date: Dayjs) => boolean;
}

function CalendarIcon() {
  return (
    <SvgIcon fontSize="small">
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 16H5V9h14v11ZM5 7V6h14v1H5Z" />
    </SvgIcon>
  );
}

export default function DateInputField({
  value,
  onChange,
  onBlur,
  label,
  placeholder = "MM/DD/YYYY",
  error = false,
  helperText,
  fullWidth = true,
  disabled = false,
  displayFormat = "MM/DD/YYYY",
  outputFormat = "YYYY-MM-DD",
  disablePast = false,
  disableFuture = false,
  minDate,
  maxDate,
  shouldDisableDate,
}: DateInputFieldProps) {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const parsedDate = value ? dayjs(value) : null;

  const calendarValue = parsedDate?.isValid() === true ? parsedDate : null;

  const displayValue = calendarValue ? calendarValue.format(displayFormat) : "";

  const hasValue = displayValue !== "";

  const openCalendar = () => {
    if (!disabled) {
      setOpen(true);
    }
  };

  const closeCalendar = () => {
    setOpen(false);
    onBlur?.();
  };

  return (
    <Box className={styles["input-field-wrapper"]}>
      <Typography variant="body1" className={styles["input-field-label"]}>
        {label}
      </Typography>

      <OutlinedInput
        ref={anchorRef}
        value={displayValue}
        placeholder={placeholder}
        fullWidth={fullWidth}
        disabled={disabled}
        error={error}
        readOnly
        className={styles["input-field"]}
        sx={{
          ...getOutlinedInputStyles(hasValue, INPUT_HEIGHT),

          cursor: disabled ? "default" : "pointer",

          "& input": {
            cursor: disabled ? "default" : "pointer",
          },
        }}
        inputProps={{
          "aria-haspopup": "dialog",
          "aria-expanded": open,
          "aria-label": label,
        }}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              edge="end"
              disabled={disabled}
              aria-label={`Open ${label} calendar`}
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              onClick={(event) => {
                event.stopPropagation();
                openCalendar();
              }}
            >
              <CalendarIcon />
            </IconButton>
          </InputAdornment>
        }
        onClick={openCalendar}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" ||
            event.key === " " ||
            event.key === "ArrowDown"
          ) {
            event.preventDefault();
            openCalendar();
          }

          if (event.key === "Escape") {
            closeCalendar();
          }
        }}
      />

      {helperText && (
        <FormHelperText error={error}>{helperText}</FormHelperText>
      )}

      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={closeCalendar}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              borderRadius: 2,
              overflow: "hidden",
            },
          },
        }}
      >
        <DateCalendar
          value={calendarValue}
          disabled={disabled}
          disablePast={disablePast}
          disableFuture={disableFuture}
          minDate={minDate}
          maxDate={maxDate}
          shouldDisableDate={shouldDisableDate}
          onChange={(newValue, selectionState) => {
            if (!newValue || !newValue.isValid()) {
              onChange(null);
              return;
            }

            onChange(newValue.format(outputFormat));

            if (selectionState === "finish") {
              closeCalendar();
            }
          }}
        />
      </Popover>
    </Box>
  );
}
