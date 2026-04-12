import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely. Uses clsx for conditionals + twMerge for conflict resolution.
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
