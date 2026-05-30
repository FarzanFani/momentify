"use client";

import {
  Button,
  DialogContent,
  Dialog,
  DialogTitle,
  Typography,
  Grid,
  DialogActions,
  Box,
} from "@mui/material";
import { FilterList } from "@mui/icons-material";
import { useState } from "react";
import type { FilterProps, FilterValueRecord } from "@/types/general";
import * as styles from "./style";
import renderComponent from "./renderFilterComponents";

export default function Filter({
  filterOptions,
  onApply,
  onReset,
}: FilterProps) {
  const [open, setOpen] = useState(false);

  const handleApply = () => {
    setOpen(false);
    const filterValues: FilterValueRecord[] = [];
    for (const option of filterOptions) {
      if (option.name === "multiSelectDropdown") {
        filterValues.push({
          [option.optionKey]: option.value.join(","),
        });
      } else if (option.name === "selectDropdown") {
        filterValues.push({
          [option.optionKey]: option.value,
        });
      } else if (
        option.name === "autocompleteDropdown" ||
        option.name === "number"
      ) {
        filterValues.push({
          [option.optionKey]: option.value,
        });
      } else if (option.name === "rangeSlider") {
        if (option.value[0] !== option.min) {
          filterValues.push({ [option.minOptionKey]: option.value[0] });
        }
        if (option.value[1] !== option.max) {
          filterValues.push({ [option.maxOptionKey]: option.value[1] });
        }
      }
    }
    onApply(filterValues);
  };

  const handleReset = () => {
    filterOptions.forEach((option) => {
      if (option.name === "multiSelectDropdown") option.onChange([]);
      else if (option.name === "selectDropdown") option.onChange("");
      else if (option.name === "autocompleteDropdown") option.onChange("");
      else if (option.name === "number") option.onChange(null);
      else if (option.name === "rangeSlider") {
        option.onChange([option.min, option.max]);
      }
    });
    onReset?.();
    setOpen(false);
  };

  return (
    <>
      <Button
        startIcon={<FilterList fontSize="small" sx={styles.filterIcon} />}
        variant="outlined"
        color="primary"
        sx={styles.filterButton}
        onClick={() => setOpen(true)}
      >
        Filter
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: { sx: styles.dialogPaper },
        }}
      >
        <DialogTitle display={"flex"} alignItems={"center"} gap={1}>
          <FilterList sx={styles.dialogTitleIcon} color="primary" />
          <Typography color="primary" sx={styles.dialogTitleText}>
            Filter Options
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container rowSpacing={2} columnSpacing={2}>
            {filterOptions.map((option) => {
              return (
                <Grid
                  key={option.optionKey}
                  size={{ xs: 12, sm: option.fullWidth ? 12 : 6 }}
                  justifyContent={"center"}
                >
                  {renderComponent(option)}
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions sx={styles.dialogActions}>
          <Box display={"flex"} justifyContent={"center"} gap={2}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleReset}
              sx={styles.actionButton}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleApply}
              sx={styles.actionButton}
            >
              Apply
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
}
