import type {
  PackagePricingMethod,
  ServicePackage,
  ServicePackagesPayload,
} from "@/services/provider/services";
import { formatPrice } from "./helperFunctions";

export const PRICING_METHOD_LABEL: Record<string, string> = {
  service_total: "Sum of services",
  fixed_price: "Fixed price",
  percentage_discount: "Percentage discount",
  fixed_discount: "Fixed discount",
};

export const INSTALLMENT_INTERVAL_LABEL: Record<string, string> = {
  weekly: "weekly",
  biweekly: "every two weeks",
  monthly: "monthly",
};

const toNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const round = (value: number) => Math.round(value * 100) / 100;

type BreakdownLine = {
  price?: number | string | null;
  quantity?: number | string | null;
  required?: boolean;
};

/**
 * Client-side mirror of `ServicePackages.calculate_breakdown` in the backend.
 * Required items make up the subtotal the pricing method applies to;
 * optional items are add-ons priced on top and never discounted.
 */
export function calculatePackageBreakdown({
  pricingMethod,
  lines,
  fixedPrice,
  fixedDiscount,
  percentageDiscount,
}: {
  pricingMethod: PackagePricingMethod;
  lines: BreakdownLine[];
  fixedPrice?: number | string | null;
  fixedDiscount?: number | string | null;
  percentageDiscount?: number | string | null;
}) {
  let subtotal = 0;
  let addonsSubtotal = 0;

  for (const line of lines) {
    const lineTotal = toNumber(line.price) * toNumber(line.quantity);
    if (line.required) subtotal += lineTotal;
    else addonsSubtotal += lineTotal;
  }

  let total = subtotal;
  if (pricingMethod === "fixed_price") {
    total = toNumber(fixedPrice);
  } else if (pricingMethod === "percentage_discount") {
    total = subtotal - (subtotal * toNumber(percentageDiscount)) / 100;
  } else if (pricingMethod === "fixed_discount") {
    total = subtotal - toNumber(fixedDiscount);
  }

  total = round(Math.max(0, total));

  return {
    subtotal: round(subtotal),
    addonsSubtotal: round(addonsSubtotal),
    total,
    savings: round(Math.max(0, subtotal - total)),
  };
}

export function getPricingValueLabel(servicePackage: ServicePackage) {
  switch (servicePackage.pricing_method) {
    case "fixed_price":
      return "Fixed bundle price";
    case "percentage_discount":
      return `${Number(servicePackage.percentage_discount)}% off`;
    case "fixed_discount":
      return `${formatPrice(Number(servicePackage.fixed_discount))} off`;
    default:
      return "Sum of services";
  }
}

export function getInstallmentLabel(servicePackage: ServicePackage) {
  if (!servicePackage.installment_count || !servicePackage.installment_amount) {
    return null;
  }

  const interval =
    INSTALLMENT_INTERVAL_LABEL[servicePackage.installment_interval ?? ""] ??
    servicePackage.installment_interval;

  return `${servicePackage.installment_count} × ${formatPrice(
    Number(servicePackage.installment_amount),
  )} ${interval}`;
}

export function getPaymentOptionsLabel(servicePackage: ServicePackage) {
  const options: string[] = [];
  if (servicePackage.allow_full_payment) options.push("Full payment");
  if (servicePackage.deposit_percentage) options.push("Deposit");
  if (servicePackage.installment_count) options.push("Installments");
  return options.length > 0 ? options.join(", ") : "-";
}

/**
 * Fields hidden in the form are unregistered and come through as undefined.
 * Send them as explicit nulls so the backend clears values the provider
 * switched off instead of keeping the old ones.
 */
export function toPackagePayload(
  data: ServicePackagesPayload,
): ServicePackagesPayload {
  const orNull = <T>(value: T | undefined | "") =>
    value === undefined || value === "" ? null : value;

  return {
    ...data,
    fixed_price: orNull(data.fixed_price),
    fixed_discount: orNull(data.fixed_discount),
    percentage_discount: orNull(data.percentage_discount),
    deposit_percentage: orNull(data.deposit_percentage),
    installment_count: orNull(data.installment_count),
    installment_interval: orNull(data.installment_interval),
    scheduling_deadline_days: data.allow_scheduling_late
      ? orNull(data.scheduling_deadline_days)
      : null,
    services: data.services.map((item) => ({
      service: item.service,
      quantity: item.quantity,
      required: item.required,
      ...(item.price !== undefined && item.price !== ""
        ? { price: item.price }
        : {}),
    })),
  };
}
