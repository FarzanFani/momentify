"use client";

import { Box, Slider, Typography } from "@mui/material";
import {
  INPUT_BORDER_RADIUS,
  INPUT_EMPTY_BG,
  INPUT_FILLED_BG,
} from "@/components/common/inputStyles";

interface RangeSliderProps {
  label: string;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  fullWidth?: boolean;
}

export default function RangeSlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix = "",
  fullWidth = true,
}: RangeSliderProps) {
  const hasValue = value[0] !== min || value[1] !== max;
  const formatValue = (nextValue: number) =>
    `${prefix}${nextValue.toLocaleString()}`;

  return (
    <Box sx={{ width: fullWidth ? "100%" : "300px" }}>
      <Typography color="primary.dark" fontWeight="500" mb="4px">
        {label}
      </Typography>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "primary.light",
          borderRadius: INPUT_BORDER_RADIUS,
          backgroundColor: hasValue ? INPUT_FILLED_BG : INPUT_EMPTY_BG,
          px: 2,
          pt: 1.5,
          pb: 1,
          "&:hover": {
            borderColor: "primary.dark",
          },
        }}
      >
        <Box display="flex" justifyContent="space-between" mb={0.5}>
          <Typography color="primary.dark" fontWeight={600} fontSize="14px">
            {formatValue(value[0])}
          </Typography>
          <Typography color="primary.dark" fontWeight={600} fontSize="14px">
            {formatValue(value[1])}
          </Typography>
        </Box>
        <Slider
          value={value}
          min={min}
          max={max}
          step={step}
          valueLabelDisplay="auto"
          valueLabelFormat={formatValue}
          onChange={(_, nextValue) => {
            if (Array.isArray(nextValue)) {
              onChange([nextValue[0], nextValue[1]]);
            }
          }}
          sx={{
            color: "primary.main",
            "& .MuiSlider-thumb": {
              backgroundColor: "primary.dark",
            },
            "& .MuiSlider-rail": {
              color: "primary.light",
              opacity: 0.35,
            },
          }}
        />
      </Box>
    </Box>
  );
}
