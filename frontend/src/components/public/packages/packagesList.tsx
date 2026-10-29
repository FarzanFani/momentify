"use client";

import ApiErrorResponse from "@/components/common/apiError/apiError";
import SideFilter from "@/components/common/filter/sideFilter";
import CatalogHeader from "@/components/public/catalogHeader";
import LoadMoreButton from "@/components/common/loadMoreButton/LoadMoreButton";
import PackageCardView from "@/components/provider/packages/packagesList/cardView";
import PackageCardSkeleton from "@/components/provider/packages/packagesList/skeletonLoadingView";
import { useGetCategoryTinyList, useGetPublicPackages } from "@/hooks/service";
import type { PublicPackagesPayload } from "@/services/public/public";
import type { FilterOptions, FilterValueRecord } from "@/types/general";
import { mapApiResponseToDropdownOptions } from "@/utils/helperFunctions";
import { Box, Grid, Typography } from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

const PRICE_MIN = 0;
const PRICE_MAX = 50000;

export default function PackagesListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const [params, setParams] = useState<PublicPackagesPayload>(() => {
    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");
    return {
      search: searchParams.get("search") ?? undefined,
      category_id: searchParams.get("category_id") ?? undefined,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
    };
  });
  const [search, setSearch] = useState(params.search ?? "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    params.category_id ? params.category_id.split(",") : [],
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    params.min_price ?? PRICE_MIN,
    params.max_price ?? PRICE_MAX,
  ]);

  const { data: categories } = useGetCategoryTinyList();
  const {
    data: packagePages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetPublicPackages(params);
  const packageResponse = packagePages && {
    count: packagePages.pages[0].count,
    results: packagePages.pages.flatMap((page) => page.results),
  };

  const categoryOptions = useMemo(
    () => mapApiResponseToDropdownOptions(categories ?? [], "id", "name"),
    [categories],
  );

  const commitParams = (nextParams: PublicPackagesPayload) => {
    setParams(nextParams);

    const urlParams = new URLSearchParams();
    Object.entries(nextParams).forEach(([key, value]) => {
      if (value !== undefined && value !== "") urlParams.set(key, String(value));
    });
    const queryString = urlParams.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const handleApplyFilters = (filterValues: FilterValueRecord[]) => {
    const nextFilters: PublicPackagesPayload = {};
    filterValues.forEach((filter) => {
      Object.entries(filter).forEach(([key, value]) => {
        const field = key as keyof PublicPackagesPayload;
        if (Array.isArray(value)) {
          if (value.length > 0) nextFilters[field] = value.join(",") as never;
        } else if (typeof value === "number") {
          nextFilters[field] = value as never;
        } else if (typeof value === "string" && value.trim() !== "") {
          nextFilters[field] = value as never;
        }
      });
    });
    commitParams({ search: params.search, ...nextFilters });
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    commitParams({ search: params.search });
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    const trimmedSearch = value.trim();
    commitParams({
      ...params,
      search: trimmedSearch === "" ? undefined : trimmedSearch,
    });
  };

  const filterOptions: FilterOptions[] = [
    {
      label: "Category",
      value: selectedCategories,
      onChange: setSelectedCategories,
      name: "multiSelectDropdown",
      optionKey: "category_id",
      options: categoryOptions,
      placeholder: "Select categories",
    },
    {
      label: "Price Range",
      value: priceRange,
      onChange: setPriceRange,
      name: "rangeSlider",
      optionKey: "price",
      minOptionKey: "min_price",
      maxOptionKey: "max_price",
      min: PRICE_MIN,
      max: PRICE_MAX,
      step: 50,
      prefix: "$",
    },
  ];

  // Cards get an extra column when the side filter is hidden.
  const cardSize = isFilterOpen
    ? { xs: 12, sm: 6, xl: 4 }
    : { xs: 12, sm: 6, lg: 4, xl: 3 };

  return (
    <Grid container width={"100%"}>
      {isFilterOpen && (
        <Grid
          size={{ md: 4, lg: 3, xl: 2 }}
          display={{ xs: "none", md: "flex" }}
        >
          <SideFilter
            filterOptions={filterOptions}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
            onClose={() => setIsFilterOpen(false)}
          />
        </Grid>
      )}

      <Grid
        size={
          isFilterOpen ? { xs: 12, md: 8, lg: 9, xl: 10 } : { xs: 12 }
        }
      >
        <CatalogHeader
          title="Packages"
          info="Don't need the whole package? You can book a single service on its own."
          infoLink={{ label: "Browse services", href: "/services" }}
          searchPlaceholder="Search packages"
          search={search}
          onSearchChange={setSearch}
          onSearch={handleSearch}
          isFilterOpen={isFilterOpen}
          onToggleFilter={() => setIsFilterOpen((open) => !open)}
          filterOptions={filterOptions}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
        />

        {isLoading ? (
          <Grid container spacing={3} px={{ xs: 2, md: 4 }}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Grid key={index} size={cardSize}>
                <PackageCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : !packageResponse ? (
          <ApiErrorResponse />
        ) : packageResponse.count > 0 ? (
          <>
            <Grid container spacing={3} px={{ xs: 2, md: 4 }} width="100%">
              {packageResponse.results.map((servicePackage) => (
                <Grid key={servicePackage.id} size={cardSize}>
                  <PackageCardView servicePackage={servicePackage} isPublic />
                </Grid>
              ))}
            </Grid>
            {hasNextPage && (
              <LoadMoreButton
                onClick={() => fetchNextPage()}
                loading={isFetchingNextPage}
              />
            )}
          </>
        ) : (
          <Box
            minHeight="300px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Typography color="primary.main" textAlign="center">
              No packages found
            </Typography>
          </Box>
        )}
      </Grid>
    </Grid>
  );
}
