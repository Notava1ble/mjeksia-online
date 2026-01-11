import { clsx, type ClassValue } from "clsx";
import Hex from "crypto-js/enc-hex";
import sha256 from "crypto-js/sha256";
import { twMerge } from "tailwind-merge";

/**
 * Wraps an HSL value string in the CSS `hsl(...)` function.
 *
 * @param hslValue - The inner HSL contents (e.g., `"120 100% 50%"` or `"120deg 100% 50%"`)
 * @returns A string in the form `hsl(<hslValue>)`
 */
export function hsl(hslValue: string): string {
  return `hsl(${hslValue})`;
}

/**
 * Combine and normalize CSS/Tailwind class values into a single class string.
 *
 * @param inputs - One or more class value entries (string, array, object, etc.) as accepted by common class utilities
 * @returns A single string of merged, deduplicated Tailwind/CSS class names with conflicting utility classes resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Produces a fixed-length hash fragment for the given string.
 *
 * Whitespace is normalized (trimmed and consecutive whitespace collapsed to single spaces) before hashing.
 *
 * @param piece - The input string to normalize and hash
 * @returns A 12-character hexadecimal string derived from the SHA-256 hash of the normalized `piece`
 */
export function getHashedPiece(piece: string): string {
  const normalized = piece.trim().replace(/\s+/g, " ");
  return sha256(normalized).toString(Hex).substring(0, 12);
}