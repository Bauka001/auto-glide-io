import sedanWhite from "@/assets/car-sedan-white.jpg";
import suvGray from "@/assets/car-suv-gray.jpg";
import hatchBlue from "@/assets/car-hatch-blue.jpg";
import coupeBlack from "@/assets/car-coupe-black.jpg";

export type Car = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  engine: string;
  fuel: string;
  transmission: string;
  category: string;
  image: string;
  city: string;
  ownerId?: string | null;
  isPublished?: boolean;
};

export const imageKeys = {
  "sedan-white": sedanWhite,
  "suv-gray": suvGray,
  "hatch-blue": hatchBlue,
  "coupe-black": coupeBlack,
} as const;

export type ImageKey = keyof typeof imageKeys;
export const imageKeyList = Object.keys(imageKeys) as ImageKey[];

export function imageFor(key?: string | null, url?: string | null) {
  if (url) return url;
  if (key && key in imageKeys) return imageKeys[key as ImageKey];
  return sedanWhite;
}

export const categories = ["SUV", "Sedan", "Electric", "Hatchback", "Coupe"] as const;

/** Bank auto loan: 60 months at 21% effective rate (KZ market, Aug 2026), 20% down. */
export function monthlyPayment(price: number) {
  const principal = price * (1 - DEFAULT_DOWN);
  const r = LOAN_RATE_NEW / 12;
  const n = DEFAULT_TERM;
  return Math.round((principal * r) / (1 - Math.pow(1 + r, -n)));
}


const group = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

/** Prices are stored and displayed in Kazakhstani tenge. */
export const money = (n: number) => group(n) + " ₸";
export const num = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

