import type { Key } from "@/lib/i18n";

export type PreScoreLabel = "high" | "medium" | "low";

export type PreScoreInput = {
  age: number;
  monthlyIncome: number;
  carPrice: number;
  downPayment: number;
  existingLoans: number;
};

export type PreScoreResult = {
  score: number;
  label: PreScoreLabel;
  message: Key;
};

const MESSAGES: Record<PreScoreLabel, Key> = {
  high: "prescore.high",
  medium: "prescore.medium",
  low: "prescore.low",
};

/**
 * AutoHub's own heuristic pre-score for credit approval probability.
 * Not a bank decision — just a quick sanity check for the user.
 */
export function calculatePreScore(input: PreScoreInput): PreScoreResult {
  const age = Math.max(0, input.age);
  const monthlyIncome = Math.max(0, input.monthlyIncome);
  const carPrice = Math.max(0, input.carPrice);
  const downPayment = Math.max(0, input.downPayment);
  const existingLoans = Math.max(0, input.existingLoans);

  let score = 10;

  // Down-payment ratio: bigger initial payment = lower risk.
  const downRatio = carPrice > 0 ? downPayment / carPrice : 0;
  score += Math.min(30, Math.round(downRatio * 60));

  // Estimated monthly burden vs income (rough annuity: 2% of car price).
  const estimatedMonthly = carPrice * 0.02;
  const burden = monthlyIncome > 0 ? estimatedMonthly / monthlyIncome : 1;
  if (burden <= 0.3) score += 40;
  else if (burden <= 0.4) score += 25;
  else if (burden <= 0.5) score += 15;

  // Age: prime working-age borrowers get a small bonus.
  score += age >= 21 && age <= 60 ? 20 : 10;

  // Existing loans reduce capacity.
  score -= Math.min(30, existingLoans * 8);

  const clamped = Math.max(0, Math.min(100, score));
  const label: PreScoreLabel = clamped >= 70 ? "high" : clamped >= 40 ? "medium" : "low";

  return { score: clamped, label, message: MESSAGES[label] };
}
