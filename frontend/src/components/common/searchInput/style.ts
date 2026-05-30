import { SxProps, Theme } from "@mui/material";
import { getOutlinedInputStyles } from "@/components/common/inputStyles";

export const getSearchInputStyles = (hasValue: boolean): SxProps<Theme> => ({
  width: "100%",
  ...getOutlinedInputStyles(hasValue),
});
