import type { ReactNode } from "react";

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

export type FilterValue = string | string[] | number | null;

export type FilterValueRecord = Record<string, FilterValue>;

export type FilterOptions =
  | MultiSelectDropdownOption
  | SelectDropdownOption
  | NumberFieldOption
  | AutocompleteDropdownOption
  | RangeSliderOption;

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

export type NumberFieldOption = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  fullWidth?: boolean;
  minValue?: number;
  maxValue?: number;
  name: "number";
  optionKey: string;
};

export type AutocompleteDropdownOption = {
  label: string;
  value: string;
  options: DropdownOptionItem[] | string[];
  onChange: (value: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
  name: "autocompleteDropdown";
  optionKey: string;
  error?: string;
  disable?: boolean;
};

export type RangeSliderOption = {
  label: string;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  fullWidth?: boolean;
  name: "rangeSlider";
  optionKey: string;
  minOptionKey: string;
  maxOptionKey: string;
};

export type TableColumn = {
  id: string;
  label: string;
  minWidth: number;
  align: "left" | "center" | "right";
  format?: (value: unknown) => string;
};

export type TableRowDataType = {
  id: string;
  cells: Record<string, ReactNode>;
  isAction?: boolean;
  onAction?: (id: string) => void;
};

export type FilterProps = {
  filterOptions: FilterOptions[];
  onApply: (filterValues: FilterValueRecord[]) => void;
  onReset?: () => void;
};

export interface SideFilterProps extends FilterProps {
  widthPercentage: number;
}
