"use client";

import type { FilterValueRecord, SideFilterProps } from "@/types/general";
import { Box, Button, Grid } from "@mui/material";
import renderComponent from "./renderFilterComponents";
import { useAppSelector } from "@/store/hook";

export default function SideFilter({
  filterOptions,
  onApply,
  onReset,
  widthPercentage,
}: SideFilterProps) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
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

  const percentage = (widthPercentage / 12) * 100;

  return (
    <Box
      px={2}
      height="100vh"
      borderRight={"2px solid"}
      borderColor={"primary.main"}
      py={1}
      sx={{
        position: "fixed",
        top: 0,
        bottom: 0,
        left: 0,
        width: `${percentage}%`,
        pt: isAuthenticated ? "100px" : "75px",
        overflowY: "hidden",
        overflowX: "hidden",
        backgroundColor: "background.default",
        zIndex: 5,
      }}
    >
      <Grid container rowSpacing={2} columnSpacing={2}>
        {filterOptions.map((option) => {
          return (
            <Grid
              key={option.optionKey}
              size={{ xs: 12 }}
              justifyContent={"center"}
            >
              {renderComponent(option)}
            </Grid>
          );
        })}
      </Grid>
      <Box display="flex" gap={1.5} mt={3}>
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
  );
}
