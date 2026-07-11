import type { Theme } from "@mui/material";
import type { SystemStyleObject } from "@mui/system";

export const INPUT_HEIGHT = 45;
export const INPUT_BORDER_RADIUS = "6px";
export const INPUT_EMPTY_BG = "#ffffff";
export const INPUT_FILLED_BG = "#f0f0f0";
export const INPUT_FONT_SIZE = "16px";

export const getOutlinedInputStyles = (
  hasValue: boolean,
  height: number | string = INPUT_HEIGHT,
): SystemStyleObject<Theme> => ({
  height,
  borderRadius: INPUT_BORDER_RADIUS,
  overflow: "hidden",
  backgroundColor: hasValue ? INPUT_FILLED_BG : INPUT_EMPTY_BG,
  color: "primary.dark",
  fontSize: INPUT_FONT_SIZE,
  fontWeight: hasValue ? 600 : 500,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "gray",
    borderRadius: INPUT_BORDER_RADIUS,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "primary.dark",
  },
  "&.Mui-focused": {
    backgroundColor: hasValue ? INPUT_FILLED_BG : INPUT_EMPTY_BG,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "primary.dark",
  },
  "& .MuiInputBase-input": {
    color: hasValue ? "primary.dark" : "primary.light",
    fontSize: INPUT_FONT_SIZE,
    fontWeight: hasValue ? 600 : 500,
  },
  "& .MuiSelect-select": {
    backgroundColor: "transparent",
    color: hasValue ? "primary.dark" : "primary.light",
    fontSize: INPUT_FONT_SIZE,
    fontWeight: hasValue ? 600 : 500,
  },
  "& .MuiTypography-root": {
    fontSize: INPUT_FONT_SIZE,
  },
  "& input::placeholder": {
    color: "primary.light",
    fontSize: INPUT_FONT_SIZE,
    opacity: 1,
    fontWeight: 500,
  },
});
