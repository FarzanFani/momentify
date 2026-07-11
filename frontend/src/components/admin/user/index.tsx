"use client";

import { useUpdateUser, useUsers } from "@/hooks/users";
import SearchInput from "@/components/common/searchInput/SearchInput";
import { useEffect, useMemo, useState } from "react";
import { Box, Button, Switch, Typography } from "@mui/material";

import Filter from "@/components/common/filter/Filter";
import {
  FilterOptions,
  FilterValueRecord,
  TableColumn,
  TableRowDataType,
} from "@/types/general";
import { PersonAdd } from "@mui/icons-material";
import TableComponent from "@/components/common/table/Table";
import { UserList, UsersParams } from "@/services/admin/user";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { extractApiError } from "@/utils/extractApiError";
import AddModal from "./addUserModal/AddModal";

export default function User() {
  const { mutate: mutateUpdateUser } = useUpdateUser();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserList[]>([]);
  const { showSnackbar } = useSnackbar();
  const [appliedFilters, setAppliedFilters] = useState<
    Record<string, string | number | boolean>
  >({});
  const [applyCounter, setApplyCounter] = useState(0);

  const [role, setRole] = useState(["ADMIN", "PROVIDER", "CUSTOMER"]);
  const [isVerified, setIsVerified] = useState("include");
  const [isActive, setIsActive] = useState("include");

  const usersParams: UsersParams = useMemo(
    () => ({
      page: 1,
      page_size: 10,
      search: search.trim() || undefined,
      ordering: "first_name",
      ...appliedFilters,
    }),
    [search, appliedFilters],
  );

  const { data, isLoading, error, refetch } = useUsers(
    usersParams,
    applyCounter,
  );

  const [openAddModal, setOpenAddModal] = useState(false);

  useEffect(() => {
    if (data) {
      setUsers(data.results);
    }
  }, [data]);

  const filterOptions: FilterOptions[] = [
    {
      name: "multiSelectDropdown",
      label: "Role",
      options: [
        { label: "Admin", value: "ADMIN" },
        { label: "Provider", value: "PROVIDER" },
        { label: "Customer", value: "CUSTOMER" },
      ],
      onChange: (value) => setRole(value),
      value: role,
      optionKey: "role__in",
    },
    {
      name: "selectDropdown",
      label: "Is Verified",
      options: [
        { label: "Include", value: "include" },
        { label: "Exclude", value: "exclude" },
        { label: "Only", value: "only" },
      ],
      onChange: (value) => setIsVerified(value),
      value: isVerified,
      optionKey: "is_verified",
    },
    {
      name: "selectDropdown",
      label: "Is Active",
      options: [
        { label: "Include", value: "include" },
        { label: "Exclude", value: "exclude" },
        { label: "Only", value: "only" },
      ],
      onChange: (value) => setIsActive(value),
      value: isActive,
      optionKey: "is_active",
    },
  ];
  const columns: TableColumn[] = [
    { id: "name", label: "Name", minWidth: 100, align: "left" },
    { id: "email", label: "Email", minWidth: 100, align: "left" },

    { id: "role", label: "Role", minWidth: 100, align: "left" },
    {
      id: "phone_number",
      label: "Phone Number",
      minWidth: 100,
      align: "left",
    },
    {
      id: "is_verified",
      label: "Is Verified",
      minWidth: 100,
      align: "left",
    },
    {
      id: "is_active",
      label: "Is Active",
      minWidth: 100,
      align: "left",
    },
  ];

  const handleToggle = (
    id: string,
    field: "is_verified" | "is_active",
    value: boolean,
  ) => {
    const updatedUsers: UserList[] = users.map((user) => {
      if (user.id === id) {
        return { ...user, [field]: value };
      }
      return user;
    });
    setUsers(updatedUsers || []);

    mutateUpdateUser(
      {
        id,
        [field]: value,
      },
      {
        onError: (error) => {
          setUsers(
            (prevUsers) =>
              prevUsers?.map((user) =>
                user.id === id ? { ...user, [field]: !value } : user,
              ) || [],
          );
          showSnackbar(extractApiError(error, "User update failed"), "error");
        },
        onSuccess: () => {
          showSnackbar("User update successfully", "success");
        },
      },
    );
  };

  const TableData: TableRowDataType[] | undefined = users.map((user) => ({
    id: user.id,
    cells: {
      email: <Typography>{user.email}</Typography>,
      name: (
        <Typography>
          {user.first_name} {user.last_name}
        </Typography>
      ),
      role: <Typography>{user.role}</Typography>,
      phone_number: <Typography>{user.phone_number}</Typography>,
      is_verified: (
        <Switch
          checked={user.is_verified}
          onChange={(e) =>
            handleToggle(user.id, "is_verified", e.target.checked)
          }
          color="primary"
        />
      ),
      is_active: (
        <Switch
          checked={user.is_active}
          onChange={(e) => handleToggle(user.id, "is_active", e.target.checked)}
          color="success"
        />
      ),
    },
  }));

  const handleApply = (filterValues: FilterValueRecord[]) => {
    const rawFilters: Record<string, string> = {};

    filterValues.forEach((item) => {
      Object.entries(item).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          rawFilters[key] = value.join(",");
        } else if (value !== null) {
          rawFilters[key] = String(value);
        }
      });
    });

    const nextFilters: Record<string, string | boolean> = {};

    if (rawFilters.role__in) {
      nextFilters.role__in = rawFilters.role__in;
    }

    if (rawFilters.is_verified === "only") {
      nextFilters.is_verified = true;
    } else if (rawFilters.is_verified === "exclude") {
      nextFilters.is_verified = false;
    }

    if (rawFilters.is_active === "only") {
      nextFilters.is_active = true;
    } else if (rawFilters.is_active === "exclude") {
      nextFilters.is_active = false;
    }

    setAppliedFilters(nextFilters);
    setApplyCounter((prev) => prev + 1);
  };

  const handleResetFilters = () => {
    setRole([]);
    setIsVerified("include");
    setIsActive("include");
    setAppliedFilters({});
    setApplyCounter((prev) => prev + 1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  return (
    <Box>
      <Box display={"flex"} gap={2}>
        <SearchInput fullWidth={false} width="300px" onSearch={handleSearch} />
        <Filter
          filterOptions={filterOptions}
          onApply={handleApply}
          onReset={handleResetFilters}
        />
      </Box>
      <Box display={"flex"} justifyContent={"flex-end"} px={4}>
        <Button
          variant="contained"
          color="primary"
          endIcon={<PersonAdd fontSize="medium" />}
          sx={{
            textTransform: "none",
            fontSize: "16px",
            fontWeight: 600,
            borderRadius: "15px",
            height: "50px",
            width: "160px",
          }}
          onClick={() => setOpenAddModal(true)}
        >
          Add User
        </Button>
      </Box>
      <Box mt={4}>
        <TableComponent
          columns={columns}
          data={TableData}
          isLoading={isLoading}
          emptyMessage="No result found"
          count={data?.count ?? 0}
        />
      </Box>
      <AddModal
        open={openAddModal}
        onClose={() => {
          setOpenAddModal(false);
          refetch();
        }}
      />
    </Box>
  );
}
