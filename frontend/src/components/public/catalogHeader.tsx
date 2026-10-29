"use client";

import Filter from "@/components/common/filter/Filter";
import SearchInput from "@/components/common/searchInput/SearchInput";
import type { FilterOptions, FilterValueRecord } from "@/types/general";
import { FilterList } from "@mui/icons-material";
import { Alert, Box, Button, Link as MuiLink, Typography } from "@mui/material";
import Link from "next/link";

type CatalogHeaderProps = {
  title: string;
  info: string;
  infoLink: { label: string; href: string };
  searchPlaceholder: string;
  search: string;
  onSearchChange: (value: string) => void;
  onSearch: (value: string) => void;
  isFilterOpen: boolean;
  onToggleFilter: () => void;
  filterOptions: FilterOptions[];
  onApplyFilters: (filterValues: FilterValueRecord[]) => void;
  onResetFilters: () => void;
};

export default function CatalogHeader({
  title,
  info,
  infoLink,
  searchPlaceholder,
  search,
  onSearchChange,
  onSearch,
  isFilterOpen,
  onToggleFilter,
  filterOptions,
  onApplyFilters,
  onResetFilters,
}: CatalogHeaderProps) {
  return (
    <Box sx={{ px: { xs: 2, md: 4 }, pt: 3, mb: 4 }}>
      <Typography variant="h4" fontWeight={700} color="primary.main">
        {title}
      </Typography>

      <Alert
        severity="info"
        variant="outlined"
        sx={{ mt: 1.5, mb: 3, py: 0.25 }}
      >
        {info}{" "}
        <MuiLink component={Link} href={infoLink.href} fontWeight={600}>
          {infoLink.label}
        </MuiLink>
      </Alert>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <SearchInput
          placeholder={searchPlaceholder}
          onSearch={onSearch}
          maxWidth="500px"
          onChange={onSearchChange}
          value={search}
        />

        {/* Desktop: show or hide the side filter. */}
        <Button
          variant={isFilterOpen ? "contained" : "outlined"}
          startIcon={<FilterList />}
          onClick={onToggleFilter}
          sx={{
            display: { xs: "none", md: "inline-flex" },
            textTransform: "none",
            height: 45,
            borderRadius: "10px",
          }}
        >
          {isFilterOpen ? "Hide filters" : "Show filters"}
        </Button>

        {/* Mobile: filters open in a dialog instead of the side panel. */}
        <Box display={{ xs: "block", md: "none" }}>
          <Filter
            onApply={onApplyFilters}
            onReset={onResetFilters}
            filterOptions={filterOptions}
          />
        </Box>
      </Box>
    </Box>
  );
}
