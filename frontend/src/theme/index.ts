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
      main: "#C9A227",
      light: "#F2D675",
      dark: "#8C6A12",
      contrastText: "#111111",
    },
  },
  components: componentOverrides,
});
