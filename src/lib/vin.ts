/** VIN validation: 17 characters, allowed alphabet (no I/O/Q) and ISO 3779 check digit. */

const TRANSLIT: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
  "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
};

const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

export type VinError = "length" | "chars" | "checksum";

export function normalizeVin(input: string) {
  return input.trim().toUpperCase().replace(/\s|-/g, "");
}

/** Returns null when the VIN is valid, otherwise the reason it failed. */
export function validateVin(input: string): VinError | null {
  const vin = normalizeVin(input);
  if (vin.length !== 17) return "length";
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) return "chars";

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const value = TRANSLIT[vin[i] as string];
    if (value === undefined) return "chars";
    sum += value * (WEIGHTS[i] as number);
  }
  const rest = sum % 11;
  const expected = rest === 10 ? "X" : String(rest);
  return vin[8] === expected ? null : "checksum";
}

export const isValidVin = (input: string) => validateVin(input) === null;
