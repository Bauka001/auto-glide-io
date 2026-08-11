/** Shared (client + server) delivery pricing rules. Prices are in KZT. */

export type TariffId = "standard" | "express" | "vip";

export const deliveryTariffs: Record<TariffId, { base: number; perKm: number; days: number }> = {
  standard: { base: 60000, perKm: 250, days: 6 },
  express: { base: 120000, perKm: 400, days: 3 },
  vip: { base: 250000, perKm: 650, days: 2 },
};

export const TRANSIT_INSURANCE_FEE = 45000;

export const tariffIds = Object.keys(deliveryTariffs) as TariffId[];

export function isTariff(value: string): value is TariffId {
  return value in deliveryTariffs;
}

export function deliveryPrice(tariff: TariffId, distanceKm: number, insurance: boolean) {
  const km = Math.min(Math.max(Math.round(distanceKm), 10), 5000);
  const t = deliveryTariffs[tariff];
  return Math.round(t.base + t.perKm * km + (insurance ? TRANSIT_INSURANCE_FEE : 0));
}

export function etaDate(tariff: TariffId, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + deliveryTariffs[tariff].days);
  return d.toISOString().slice(0, 10);
}
