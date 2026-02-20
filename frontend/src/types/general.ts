import { ReactNode } from "react";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: Record<string, string[]>;
}

export type DropdownOptionItem = {
  label: string;
  value: string;
};

export type FilterOptions = MultiSelectDropdownOption | SelectDropdownOption;

export type MultiSelectDropdownOption = {
  label: string;
  value: string[];
  options: DropdownOptionItem[] | string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  fullWidth?: boolean;
  name: "multiSelectDropdown";
  optionKey: string;
};

export type SelectDropdownOption = {
  label: string;
  value: string;
  options: DropdownOptionItem[] | string[];
  onChange: (value: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
  name: "selectDropdown";
  optionKey: string;
};

export type TableColumn = {
  id: string;
  label: string;
  minWidth: number;
  align: "left" | "center" | "right";
  format?: (value: any) => string;
};

export type TableRowDataType = {
  id: string;
  cells: Record<string, ReactNode>;
  isAction?: boolean;
  onAction?: (id: string) => void;
};
