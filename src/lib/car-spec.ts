import type { Lang } from "@/lib/i18n";
import type { Car } from "@/lib/cars";

export type Option = { value: string; kk: string; ru: string; en: string };

export const bodyTypes: Option[] = [
  { value: "sedan", kk: "Седан", ru: "Седан", en: "Sedan" },
  { value: "suv", kk: "Кроссовер", ru: "Кроссовер", en: "SUV" },
  { value: "hatchback", kk: "Хэтчбек", ru: "Хэтчбек", en: "Hatchback" },
  { value: "wagon", kk: "Универсал", ru: "Универсал", en: "Wagon" },
  { value: "coupe", kk: "Купе", ru: "Купе", en: "Coupe" },
  { value: "minivan", kk: "Минивэн", ru: "Минивэн", en: "Minivan" },
  { value: "pickup", kk: "Пикап", ru: "Пикап", en: "Pickup" },
  { value: "offroad", kk: "Внедорожник", ru: "Внедорожник", en: "Off-road" },
];

export const fuels: Option[] = [
  { value: "Petrol", kk: "Бензин", ru: "Бензин", en: "Petrol" },
  { value: "Diesel", kk: "Дизель", ru: "Дизель", en: "Diesel" },
  { value: "Gas", kk: "Газ", ru: "Газ", en: "Gas" },
  { value: "Hybrid", kk: "Гибрид", ru: "Гибрид", en: "Hybrid" },
  { value: "Electric", kk: "Электро", ru: "Электро", en: "Electric" },
];

export const transmissions: Option[] = [
  { value: "Automatic", kk: "АКПП", ru: "АКПП", en: "Automatic" },
  { value: "Manual", kk: "МКПП", ru: "МКПП", en: "Manual" },
  { value: "CVT", kk: "Вариатор", ru: "Вариатор", en: "CVT" },
  { value: "Robot", kk: "Робот", ru: "Робот", en: "Robot" },
];

export const transmissionShort: Record<string, string> = {
  Automatic: "AT",
  Manual: "MT",
  CVT: "CVT",
  Robot: "AMT",
};

export const drives: Option[] = [
  { value: "front", kk: "Алдыңғы", ru: "Передний", en: "Front" },
  { value: "rear", kk: "Артқы", ru: "Задний", en: "Rear" },
  { value: "awd", kk: "Толық 4WD", ru: "Полный 4WD", en: "AWD" },
];

export const colors: { value: string; hex: string; kk: string; ru: string; en: string }[] = [
  { value: "white", hex: "#f5f5f5", kk: "Ақ", ru: "Белый", en: "White" },
  { value: "black", hex: "#17181c", kk: "Қара", ru: "Чёрный", en: "Black" },
  { value: "silver", hex: "#c3c7cc", kk: "Күміс", ru: "Серебристый", en: "Silver" },
  { value: "gray", hex: "#7c8189", kk: "Сұр", ru: "Серый", en: "Gray" },
  { value: "blue", hex: "#2563eb", kk: "Көк", ru: "Синий", en: "Blue" },
  { value: "red", hex: "#dc2626", kk: "Қызыл", ru: "Красный", en: "Red" },
  { value: "green", hex: "#16a34a", kk: "Жасыл", ru: "Зелёный", en: "Green" },
  { value: "brown", hex: "#78503a", kk: "Қоңыр", ru: "Коричневый", en: "Brown" },
];

export const steerings: Option[] = [
  { value: "left", kk: "Сол жақ руль", ru: "Левый руль", en: "Left-hand" },
  { value: "right", kk: "Оң жақ руль", ru: "Правый руль", en: "Right-hand" },
];

export const conditions: Option[] = [
  { value: "new", kk: "Жаңа", ru: "Новый", en: "New" },
  { value: "used", kk: "Қолданылған", ru: "С пробегом", en: "Used" },
];

export function optionLabel(list: Option[], value: string | undefined, lang: Lang) {
  const found = list.find((o) => o.value === value);
  return found ? found[lang] : (value ?? "");
}

export function colorLabel(value: string | undefined, lang: Lang) {
  const found = colors.find((o) => o.value === value);
  return found ? found[lang] : (value ?? "");
}

/** Simple listing title: "Toyota Camry" */
export function carTitle(car: Car) {
  return `${car.brand} ${car.model}`;
}

export function carShortName(car: Car) {
  return `${car.brand} ${car.model}`;
}
