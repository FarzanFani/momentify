"use client";

import {
  Button,
  DialogContent,
  Dialog,
  DialogTitle,
  Typography,
  Stack,
  Grid,
  DialogActions,
  Box,
} from "@mui/material";
import { FilterList } from "@mui/icons-material";
import { useState } from "react";
import { FilterOptions } from "@/types/general";
import MultiSelectDropdown from "../multiSelectDropdown/MultiSelectDropdown";
import SelectDropdown from "../dropdown/Dropdown";
import * as styles from "./style";

interface FilterProps {
  filterOptions: FilterOptions[];
  onApply: (filterValues: { [key: string]: string }[]) => void;
  onReset?: () => void;
}

export default function Filter({
  filterOptions,
  onApply,
  onReset,
}: FilterProps) {
  const [open, setOpen] = useState(false);

  const handleApply = () => {
    setOpen(false);
    const filterValues: { [key: string]: string }[] = [];
    for (const option of filterOptions) {
      if (option.name === "multiSelectDropdown") {
        filterValues.push({
          [option.optionKey]: option.value.join(","),
        });
      } else if (option.name === "selectDropdown") {
        filterValues.push({
          [option.optionKey]: option.value,
        });
      }
    }
    onApply(filterValues);
  };

  const handleReset = () => {
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
              const renderComponent = () => {
                switch (option.name) {
                  case "multiSelectDropdown":
                    return (
                      <Box width="100%">
                        <MultiSelectDropdown {...option} fullWidth={true} />
                      </Box>
                    );
                  case "selectDropdown":
                    return (
                      <Box width="100%">
                        <SelectDropdown {...option} fullWidth={true} />
                      </Box>
                    );

                  default:
                    return null;
                }
              };

              return (
                <Grid
                  key={option.optionKey}
                  size={{ xs: 12, sm: option.fullWidth ? 12 : 6 }}
                  justifyContent={"center"}
                >
                  {renderComponent()}
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions sx={styles.dialogActions}>
          <Box display={"flex"} gap={2}>
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
