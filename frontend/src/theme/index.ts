import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#0B3D91",
      light: "#2F5FB3",
      dark: "#072a63",
      contrastText: "#f5f7fa",
    },
    secondary: {
      main: "#C9A227",
      light: "#F2D675",
      dark: "#8C6A12",
      contrastText: "#111111",
    },
    background: {
      default: "#f5f7fa",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "'Cormorant Garamond', 'Georgia', serif",
    h1: {
      fontFamily: "'Cormorant Garamond', serif",
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontFamily: "'Cormorant Garamond', serif",
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontFamily: "'Cormorant Garamond', serif",
      fontWeight: 600,
    },
    h4: {
      fontFamily: "'Cormorant Garamond', serif",
      fontWeight: 600,
    },
    h5: {
      fontFamily: "'Cormorant Garamond', serif",
      fontWeight: 600,
    },
    h6: {
      fontFamily: "'Cormorant Garamond', serif",
      fontWeight: 600,
    },
    body1: {
      fontFamily: "'Lato', sans-serif",
      lineHeight: 1.8,
    },
    body2: {
      fontFamily: "'Lato', sans-serif",
      lineHeight: 1.7,
    },
    button: {
      fontFamily: "'Lato', sans-serif",
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    },
  },
  shape: { borderRadius: 2 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, paddingTop: 12, paddingBottom: 12 },
        containedPrimary: {
          boxShadow: "none",
          "&:hover": { boxShadow: "0 4px 20px rgba(11,61,145,0.35)" },
        },
        containedSecondary: {
          boxShadow: "none",
          "&:hover": { boxShadow: "0 4px 20px rgba(201,162,39,0.45)" },
        },
        outlinedPrimary: {
          borderWidth: 1.5,
          "&:hover": { borderWidth: 1.5 },
        },
      },
    },
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
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: "none", borderRadius: 4 },
      },
    },
  },
});
