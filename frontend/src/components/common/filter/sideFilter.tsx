"use client";

import type { FilterValueRecord, SideFilterProps } from "@/types/general";
import { Close } from "@mui/icons-material";
import { Box, Button, Grid, IconButton, Typography } from "@mui/material";
import renderComponent from "./renderFilterComponents";
import { useAppSelector } from "@/store/hook";

export default function SideFilter({
  filterOptions,
  onApply,
  onReset,
  onClose,
}: SideFilterProps) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  // Height of the fixed navbar, same offsets as the public layout uses.
  const navbarHeight = isAuthenticated ? 95 : 75;

  const collectFilterValues = (): FilterValueRecord[] =>
    filterOptions.flatMap((option) => {
      switch (option.name) {
        case "multiSelectDropdown":
        case "selectDropdown":
        case "autocompleteDropdown":
        case "number":
          return [{ [option.optionKey]: option.value }];
        case "rangeSlider":
          return [
            ...(option.value[0] === option.min
              ? []
              : [{ [option.minOptionKey]: option.value[0] }]),
            ...(option.value[1] === option.max
              ? []
              : [{ [option.maxOptionKey]: option.value[1] }]),
          ];
        default:
          return [];
      }
    });

  const handleApply = () => {
    onApply(collectFilterValues());
  };

  const handleReset = () => {
    filterOptions.forEach((option) => {
      switch (option.name) {
        case "multiSelectDropdown":
          option.onChange([]);
          break;
        case "selectDropdown":
        case "autocompleteDropdown":
          option.onChange("");
          break;
        case "number":
          option.onChange(null);
          break;
        case "rangeSlider":
          option.onChange([option.min, option.max]);
          break;
      }
    });
    onReset?.();
  };

  return (
    // The outer box stretches to fill the whole column (the column must be a
    // flex container) so the border runs the full page height. The inner
    // panel is sticky inside it, so it follows the scroll without covering
    // the footer, and the fields scroll while Apply and Reset stay visible.
    <Box
      sx={{
        flex: 1,
        width: "100%",
        borderRight: "2px solid",
        borderColor: "primary.main",
        backgroundColor: "background.default",
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: navbarHeight,
          height: `calc(100vh - ${navbarHeight}px)`,
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            pt: 2,
            pb: 1,
          }}
        >
          <Typography fontWeight={700} color="primary.dark">
            Filters
          </Typography>
          {onClose && (
            <IconButton size="small" onClick={onClose} aria-label="Hide filters">
              <Close fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            px: 2,
            py: 1,
          }}
        >
          <Grid container rowSpacing={2} columnSpacing={2}>
            {filterOptions.map((option) => (
              <Grid
                key={option.optionKey}
                size={{ xs: 12 }}
                justifyContent={"center"}
              >
                {renderComponent(option)}
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box
          display="flex"
          gap={1.5}
          sx={{
            px: 2,
            py: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={handleReset}
            sx={{ textTransform: "none", height: "42px" }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleApply}
            sx={{ textTransform: "none", height: "42px" }}
          >
            Apply
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
