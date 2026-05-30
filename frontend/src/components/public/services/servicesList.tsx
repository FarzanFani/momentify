"use client";

import ApiErrorResponse from "@/components/common/apiError/apiError";
import SearchInput from "@/components/common/searchInput/SearchInput";
import ServiceCardView from "@/components/common/serviceCard/cardView";
import ServiceCardSkeleton from "@/components/common/serviceCard/skeletonLoadingView";
import SideFilter from "@/components/common/filter/sideFilter";
import { useGetPublicCompanyTinyList } from "@/hooks/company";
import { useGetCategoryTinyList, useGetPublicServices } from "@/hooks/service";
import type { PublicServicesPayload } from "@/services/public/public";
import type { CompanyServices } from "@/services/provider/services";
import type { FilterOptions, FilterValueRecord } from "@/types/general";
import { mapApiResponseToDropdownOptions } from "@/utils/helperFunctions";
import {
  Box,
  Divider,
  Grid,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import Filter from "@/components/common/filter/Filter";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

function getParamsFromSearchParams(
  searchParams: URLSearchParams,
): PublicServicesPayload {
  const maxCapacityParam = searchParams.get("max_capacity");
  const maxPriceParam = searchParams.get("max_price");
  const minPriceParam = searchParams.get("min_price");

  return {
    category_id: searchParams.get("category_id") ?? undefined,
    company_id: searchParams.get("company_id") ?? undefined,
    max_capacity: maxCapacityParam ? Number(maxCapacityParam) : undefined,
    max_price: maxPriceParam ? Number(maxPriceParam) : undefined,
    min_price: minPriceParam ? Number(minPriceParam) : undefined,
    search: searchParams.get("search") ?? undefined,
  };
}

export default function ServicesListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const theme = useTheme();

  const isXl = useMediaQuery(theme.breakpoints.up("xl"));
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));

  const { data: categories } = useGetCategoryTinyList();
  const { data: companies } = useGetPublicCompanyTinyList();

  const initialParams = useMemo(
    () => getParamsFromSearchParams(searchParams),
    [],
  );

  const [params, setParams] = useState<PublicServicesPayload>(initialParams);
  const [search, setSearch] = useState(initialParams.search ?? "");

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialParams.category_id ? initialParams.category_id.split(",") : [],
  );

  const [selectedCompany, setSelectedCompany] = useState(
    initialParams.company_id ?? "",
  );

  const [maxCapacity, setMaxCapacity] = useState<number | null>(
    initialParams.max_capacity ?? null,
  );

  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialParams.min_price ?? 0,
    initialParams.max_price ?? 50000,
  ]);

  const { data: serviceResponse, isLoading: isServicesLoading } =
    useGetPublicServices(params);

  const categoriesOptions = useMemo(
    () => mapApiResponseToDropdownOptions(categories ?? [], "id", "name"),
    [categories],
  );

  const companiesOptions = useMemo(
    () => mapApiResponseToDropdownOptions(companies ?? [], "id", "name"),
    [companies],
  );

  const updateUrlParams = useCallback(
    (nextParams: PublicServicesPayload) => {
      const urlParams = new URLSearchParams();

      Object.entries(nextParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          urlParams.set(key, String(value));
        }
      });

      const queryString = urlParams.toString();
      const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
      const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

      if (nextUrl !== currentUrl) {
        router.replace(nextUrl);
      }
    },
    [router, pathname, searchParams],
  );

  const commitParams = useCallback(
    (nextParams: PublicServicesPayload) => {
      setParams(nextParams);
      updateUrlParams(nextParams);
    },
    [updateUrlParams],
  );

  const handleApplyFilters = useCallback(
    (filterValues: FilterValueRecord[]) => {
      const nextFilters: PublicServicesPayload = {};

      filterValues.forEach((filter) => {
        Object.entries(filter).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              nextFilters[key as keyof PublicServicesPayload] = value.join(
                ",",
              ) as never;
            }
            return;
          }

          if (typeof value === "number") {
            nextFilters[key as keyof PublicServicesPayload] = value as never;
            return;
          }

          if (typeof value === "string" && value.trim() !== "") {
            nextFilters[key as keyof PublicServicesPayload] = value as never;
          }
        });
      });

      const mergedParams: PublicServicesPayload = {
        search: params.search,
        ...nextFilters,
      };

      commitParams(mergedParams);
    },
    [params.search, commitParams],
  );

  const handleResetFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedCompany("");
    setMaxCapacity(null);
    setPriceRange([0, 50000]);

    const nextParams: PublicServicesPayload = {
      search: params.search,
    };

    commitParams(nextParams);
  }, [params.search, commitParams]);

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);

      const trimmedSearch = value.trim();

      const nextParams: PublicServicesPayload = {
        ...params,
        search: trimmedSearch === "" ? undefined : trimmedSearch,
      };

      commitParams(nextParams);
    },
    [params, commitParams],
  );

  const filterOptions: FilterOptions[] = useMemo(
    () => [
      {
        label: "Category",
        value: selectedCategories,
        onChange: setSelectedCategories,
        name: "multiSelectDropdown",
        optionKey: "category_id",
        options: categoriesOptions,
        placeholder: "Select categories",
      },
      {
        label: "Company",
        value: selectedCompany,
        onChange: setSelectedCompany,
        name: "autocompleteDropdown",
        optionKey: "company_id",
        options: companiesOptions,
        placeholder: "Search company",
      },
      {
        label: "Max Capacity",
        value: maxCapacity,
        onChange: setMaxCapacity,
        name: "number",
        optionKey: "max_capacity",
        placeholder: "Enter max capacity",
      },
      {
        label: "Price Range",
        value: priceRange,
        onChange: setPriceRange,
        name: "rangeSlider",
        optionKey: "price",
        minOptionKey: "min_price",
        maxOptionKey: "max_price",
        min: 0,
        max: 50000,
        step: 50,
        prefix: "$",
      },
    ],
    [
      selectedCategories,
      selectedCompany,
      maxCapacity,
      priceRange,
      categoriesOptions,
      companiesOptions,
    ],
  );

  return (
    <Grid container width={"100%"}>
      <Grid size={{ md: 4, lg: 3, xl: 2 }} display={{ xs: "none", md: "flex" }}>
        <SideFilter
          filterOptions={filterOptions}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          widthPercentage={isXl ? 2 : isLg ? 3 : 4}
        />
      </Grid>

      <Grid size={{ md: 8, lg: 9, xl: 10 }} width={"100%"}>
        <Box>
          {isServicesLoading ? (
            <Grid container spacing={3} px={{ xs: 2, md: 4 }}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, xl: 4 }}>
                  <ServiceCardSkeleton />
                </Grid>
              ))}
            </Grid>
          ) : !serviceResponse ? (
            <ApiErrorResponse />
          ) : serviceResponse.count > 0 ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  width: "100%",
                  px: 4,
                  pt: 3,
                  mb: 4,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexGrow: 1,
                    alignItems: "flex-end",
                    flexWrap: "wrap",
                  }}
                >
                  <SearchInput
                    placeholder="Search services"
                    onSearch={handleSearch}
                    maxWidth="500px"
                    onChange={setSearch}
                    value={search}
                  />

                  <Box display={{ xs: "block", md: "none" }}>
                    <Filter
                      onApply={handleApplyFilters}
                      onReset={handleResetFilters}
                      filterOptions={filterOptions}
                    />
                  </Box>
                </Box>

                <Divider />
              </Box>

              <Grid container spacing={3} px={{ xs: 2, md: 4 }} width="100%">
                {serviceResponse.results.map((service: CompanyServices) => (
                  <Grid key={service.id} size={{ xs: 12, sm: 6, xl: 4 }}>
                    <ServiceCardView service={service} isPublic />
                  </Grid>
                ))}
              </Grid>
            </>
          ) : (
            <Box
              minHeight="300px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography
                color="primary.main"
                width={"200px"}
                textAlign={"center"}
              >
                No result found
              </Typography>
            </Box>
          )}
        </Box>
      </Grid>
    </Grid>
  );
}
