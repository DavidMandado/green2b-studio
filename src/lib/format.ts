import { format } from "date-fns";

import { PRODUCT_CATEGORY_LABELS } from "@/lib/constants";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: value < 1 ? 3 : 2,
  }).format(value);
}

export function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat("en-NL", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "N/A";
  }
  return format(new Date(value), "dd MMM yyyy");
}

export function formatCategoryLabel(category: keyof typeof PRODUCT_CATEGORY_LABELS) {
  return PRODUCT_CATEGORY_LABELS[category];
}

export function formatBool(value: boolean | null | undefined) {
  if (value === null || value === undefined) {
    return "Unknown";
  }
  return value ? "Yes" : "No";
}
