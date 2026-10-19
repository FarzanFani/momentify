"use client";

import ApiErrorResponse from "@/components/common/apiError/apiError";
import SelectDropdown from "@/components/common/dropdown/Dropdown";
import SearchInput from "@/components/common/searchInput/SearchInput";
import PackageCardView from "@/components/provider/packages/packagesList/cardView";
import PackageCardSkeleton from "@/components/provider/packages/packagesList/skeletonLoadingView";
import { useGetCategoryTinyList, useGetPublicPackages } from "@/hooks/service";
import type { PublicPackagesPayload } from "@/services/public/public";
import { mapApiResponseToDropdownOptions } from "@/utils/helperFunctions";
import { Box, Button, Grid, Typography } from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export default function PackagesListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [params, setParams] = useState<PublicPackagesPayload>({
    search: searchParams.get("search") ?? undefined,
    category_id: searchParams.get("category_id") ?? undefined,
  });
  const [search, setSearch] = useState(params.search ?? "");

  const { data: categories } = useGetCategoryTinyList();
  const { data: packageResponse, isLoading } = useGetPublicPackages(params);

  const categoryOptions = useMemo(
    () => [
      { label: "All categories", value: "" },
      ...mapApiResponseToDropdownOptions(categories ?? [], "id", "name"),
    ],
    [categories],
  );

  const commitParams = (nextParams: PublicPackagesPayload) => {
    setParams(nextParams);

    const urlParams = new URLSearchParams();
    Object.entries(nextParams).forEach(([key, value]) => {
      if (value) urlParams.set(key, String(value));
    });
    const queryString = urlParams.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return (
    <Box sx={{ width: "100%", py: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 2,
          px: { xs: 2, md: 4 },
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary.main">
            Packages
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bundles of services at a single price.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <SearchInput
            placeholder="Search packages"
            value={search}
            onChange={setSearch}
            onSearch={(value) =>
              commitParams({
                ...params,
                search: value.trim() === "" ? undefined : value.trim(),
              })
            }
            maxWidth="360px"
          />
          <Box sx={{ minWidth: 220 }}>
            <SelectDropdown
              label="Category"
              placeholder="All categories"
              value={params.category_id ?? ""}
              onChange={(value) =>
                commitParams({ ...params, category_id: value || undefined })
              }
              options={categoryOptions}
            />
          </Box>
          <Button
            variant="outlined"
            sx={{ textTransform: "none", height: 45, borderRadius: "10px" }}
            onClick={() => router.push("/services")}
          >
            Browse single services
          </Button>
        </Box>
      </Box>

      {isLoading ? (
        <Grid container spacing={3} px={{ xs: 2, md: 4 }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, xl: 4 }}>
              <PackageCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : !packageResponse ? (
        <ApiErrorResponse />
      ) : packageResponse.count > 0 ? (
        <Grid container spacing={3} px={{ xs: 2, md: 4 }} width="100%">
          {packageResponse.results.map((servicePackage) => (
            <Grid key={servicePackage.id} size={{ xs: 12, sm: 6, xl: 4 }}>
              <PackageCardView servicePackage={servicePackage} isPublic />
            </Grid>
          ))}
        </Grid>
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
    </Box>
  );
}
