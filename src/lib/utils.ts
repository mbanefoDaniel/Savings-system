import { v4 as uuidv4 } from "uuid";

export function generateSlug(): string {
  return uuidv4().split("-").slice(0, 2).join("-");
}

export function generateReference(): string {
  return `PS_${Date.now()}_${uuidv4().split("-")[0]}`;
}

/**
 * Convert Naira to kobo
 */
export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

/**
 * Convert kobo to Naira
 */
export function koboToNaira(kobo: number): number {
  return kobo / 100;
}

/**
 * Format currency for display
 */
export function formatNaira(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(kobo / 100);
}
