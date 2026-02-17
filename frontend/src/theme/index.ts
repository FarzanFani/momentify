import { createTheme } from "@mui/material";
import { componentOverrides } from "./componentOverrides";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0B3D91",
      light: "#2F5FB3",
      dark: "#072a63",
      contrastText: "#f5f7fa",
    },
    secondary: {
      main: "#D4AF37",
      light: "#E6C766",
      dark: "#A8872C",
      contrastText: "#111111",
    },
  },
  components: componentOverrides,
});
