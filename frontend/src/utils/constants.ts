import { DropdownOptionItem } from "@/types/general";

export const statusFilterOptions: DropdownOptionItem[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Rejected", value: "REJECTED" },
];
