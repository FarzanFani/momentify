// export const mapApiResponseToDropdownOptions = (
//   list: [],
//   key: string,
//   label: string,
// ) => {};

import { DropdownOptionItem } from "@/types/general";

export function mapApiResponseToDropdownOptions<
  T extends Record<string, unknown>,
>(list: T[], key: keyof T, label: keyof T) {
  return list.map((item) => ({
    label: String(item[label]),
    value: String(item[key]),
  }));
}

export const formatPrice = (price: number) => {
  return Number(price).toLocaleString("en-IN", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
};

export const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours && mins) return `${hours}h ${mins}m`;
  if (hours) return `${hours}h`;
  return `${mins}m`;
};
