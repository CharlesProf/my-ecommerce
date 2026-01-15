// src/lib/utils/currency.ts

/**
 * Format number string to IDR currency
 * Example: "1250000" -> "Rp 1.250.000"
 */
export const formatIDR = (value: string | number): string => {
  if (value === null || value === undefined || value === "") return "";

  const number =
    typeof value === "number"
      ? value
      : Number(value.toString().replace(/\D/g, ""));

  if (Number.isNaN(number)) return "";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

/**
 * Remove IDR formatting
 * Example: "Rp 1.250.000" -> "1250000"
 */
export const unformatIDR = (value: string): string => {
  return value.replace(/\D/g, "");
};
