/**
 * Market rates used across AutoHub calculators.
 * Kazakhstan, updated August 2026. All money values are in tenge (₸).
 *
 * Sources: National Bank of Kazakhstan (base rate), KASE (FX),
 * public auto-loan offers of Halyk / Kaspi / Freedom / BCC / Eurasian Bank.
 */
export const RATES_UPDATED = "2026-08";

/** NBK base rate, %/year. */
export const BASE_RATE = 0.1675;

/** USD → KZT, official KASE rate. */
export const USD_KZT = 470;

/** Annual effective rates (ГЭСВ) for car financing. */
export const LOAN_RATE_NEW = 0.21; // new car, bank auto loan (19–28%)
export const LOAN_RATE_USED = 0.28; // used car (25–42%)
export const LEASING_RATE = 0.2; // auto leasing (18–25%)
export const INSTALLMENT_RATE = 0; // 0% dealer installments, up to 24 months

/** Insurance. */
export const OGPO_BASE = 21000; // ₸/year, average MTPL premium (15 000–48 000)
export const KASKO_RATE = 0.035; // 3.5% of car value per year (2–5%)

/** Default car-loan structure used for the "from X ₸/mo" badges. */
export const DEFAULT_DOWN = 0.2;
export const DEFAULT_TERM = 60;
