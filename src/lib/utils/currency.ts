// src/lib/utils/currency.ts

/**
 * Format number string to IDR currency
 * Example: "1250000" -> "Rp 1.250.000"
 */
const normalizeCurrencyValue = (value: string | number): number => {
  if (typeof value === "number") return value;

  const text = value.toString().trim();
  if (text === "") return NaN;

  let cleaned = text
    .replace(/[^\d\.\-,]/g, "")
    .replace(/,/g, "");

  const parts = cleaned.split(".");
  if (parts.length > 2) {
    const last = parts[parts.length - 1];
    cleaned = last.length === 2 ? parts.slice(0, -1).join("") + "." + last : parts.join("");
  }

  return Number(cleaned);
};

export const formatIDR = (value: string | number): string => {
  if (value === null || value === undefined || value === "") return "";

  const number = normalizeCurrencyValue(value);
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

export const formatWIB = (value?: string | null): string => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};
