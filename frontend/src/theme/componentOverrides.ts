import { Components, Theme } from "@mui/material";

export const componentOverrides: Components<Theme> = {
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: "#ffffff",
        borderRadius: "6px",
        color: theme.palette.primary.dark,
        fontWeight: 500,
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.primary.light,
          borderRadius: "6px",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.primary.dark,
        },
        "&.Mui-focused": {
          backgroundColor: "#ffffff",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.primary.dark,
        },
        "& input::placeholder, & textarea::placeholder": {
          color: theme.palette.primary.light,
          opacity: 1,
          fontWeight: 500,
        },
      }),
    },
  },
};
