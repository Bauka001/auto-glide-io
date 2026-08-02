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
  category: "Sedan" | "SUV" | "Electric" | "Hatchback" | "Coupe";
  image: string;
  city: string;
};

export const cars: Car[] = [
  {
    id: "aurora-ev",
    brand: "Aurora",
    model: "EV Sedan",
    year: 2024,
    price: 32900,
    mileage: 4200,
    engine: "Electric 150 kW",
    fuel: "Electric",
    transmission: "Automatic",
    category: "Electric",
    image: sedanWhite,
    city: "Almaty",
  },
  {
    id: "northline-x7",
    brand: "Northline",
    model: "X7 Premium",
    year: 2023,
    price: 45500,
    mileage: 18900,
    engine: "3.0L Turbo",
    fuel: "Petrol",
    transmission: "Automatic",
    category: "SUV",
    image: suvGray,
    city: "Astana",
  },
  {
    id: "civo-compact",
    brand: "Civo",
    model: "Compact",
    year: 2022,
    price: 15400,
    mileage: 36500,
    engine: "1.5L",
    fuel: "Petrol",
    transmission: "Manual",
    category: "Hatchback",
    image: hatchBlue,
    city: "Shymkent",
  },
  {
    id: "lumen-coupe",
    brand: "Lumen",
    model: "GT Coupe",
    year: 2024,
    price: 61200,
    mileage: 2100,
    engine: "4.0L V8",
    fuel: "Petrol",
    transmission: "Automatic",
    category: "Coupe",
    image: coupeBlack,
    city: "Almaty",
  },
  {
    id: "aurora-ev-long",
    brand: "Aurora",
    model: "EV Long Range",
    year: 2025,
    price: 38900,
    mileage: 900,
    engine: "Electric 180 kW",
    fuel: "Electric",
    transmission: "Automatic",
    category: "Electric",
    image: sedanWhite,
    city: "Astana",
  },
  {
    id: "northline-x5",
    brand: "Northline",
    model: "X5 Comfort",
    year: 2021,
    price: 28700,
    mileage: 54300,
    engine: "2.0L Turbo",
    fuel: "Diesel",
    transmission: "Automatic",
    category: "SUV",
    image: suvGray,
    city: "Karaganda",
  },
  {
    id: "civo-sport",
    brand: "Civo",
    model: "Sport Line",
    year: 2023,
    price: 19900,
    mileage: 12400,
    engine: "1.8L",
    fuel: "Petrol",
    transmission: "Automatic",
    category: "Hatchback",
    image: hatchBlue,
    city: "Almaty",
  },
  {
    id: "lumen-sedan",
    brand: "Lumen",
    model: "Executive",
    year: 2022,
    price: 41300,
    mileage: 27800,
    engine: "3.0L",
    fuel: "Petrol",
    transmission: "Automatic",
    category: "Sedan",
    image: coupeBlack,
    city: "Astana",
  },
];

export const brands = [...new Set(cars.map((c) => c.brand))];
export const categories = ["SUV", "Sedan", "Electric", "Hatchback", "Coupe"] as const;

/** 60-month loan at 12% APR, 20% down payment. */
export function monthlyPayment(price: number) {
  const principal = price * 0.8;
  const r = 0.12 / 12;
  const n = 60;
  return Math.round((principal * r) / (1 - Math.pow(1 + r, -n)));
}

export const money = (n: number) => "$" + n.toLocaleString("en-US");

export function getCar(id: string) {
  return cars.find((c) => c.id === id);
}
