import { Components, Theme } from "@mui/material";

export const componentOverrides: Components<Theme> = {
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: "transparent",
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.primary.light,
        },
        "&.Mui-focused": {
          backgroundColor: "#ffffff",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.primary.main,
        },
        "&:not(.Mui-focused):has(input:not(:placeholder-shown))": {
          backgroundColor: "#f0f0f0",
        },
      }),
    },
  },
};
