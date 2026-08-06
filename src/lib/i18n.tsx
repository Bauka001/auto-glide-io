import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "kk" | "ru" | "en";

export const langs: { code: Lang; label: string }[] = [
  { code: "kk", label: "ҚАЗ" },
  { code: "ru", label: "РУС" },
  { code: "en", label: "ENG" },
];

const dict = {
  "nav.cars": { kk: "Көліктер", ru: "Автомобили", en: "Cars" },
  "nav.ai": { kk: "AI чат", ru: "AI чат", en: "AI chat" },
  "nav.dealer": { kk: "Дилермен чат", ru: "Чат с дилером", en: "Dealer chat" },
  "nav.insurance": { kk: "Сақтандыру", ru: "Страхование", en: "Insurance" },
  "nav.finance": { kk: "Қаржыландыру", ru: "Финансирование", en: "Finance" },
  "nav.delivery": { kk: "Жеткізу", ru: "Доставка", en: "Delivery" },
  "nav.profile": { kk: "Профиль", ru: "Профиль", en: "Profile" },
  "nav.dealers": { kk: "Дилерлерге", ru: "Дилерам", en: "Dealers" },
  "nav.login": { kk: "Кіру", ru: "Войти", en: "Log in" },

  "home.title1": { kk: "Көлікті толықтай", ru: "Купите автомобиль", en: "Buy your next car" },
  "home.title2": { kk: "онлайн сатып алыңыз.", ru: "полностью онлайн.", en: "entirely online." },
  "home.sub": {
    kk: "Тексерілген көліктер, бірнеше минутта несие, есігіңізге жеткізу.",
    ru: "Проверенные авто, кредит за минуты, доставка до двери.",
    en: "Verified cars, credit in minutes, delivery to your door.",
  },
  "home.searchPh": {
    kk: "Марка, модель, жыл немесе баға",
    ru: "Марка, модель, год или цена",
    en: "Brand, model, year or price",
  },
  "home.search": { kk: "Іздеу", ru: "Поиск", en: "Search" },
  "home.categories": { kk: "Санаттар", ru: "Категории", en: "Categories" },
  "home.featured": { kk: "Таңдаулы көліктер", ru: "Популярные авто", en: "Featured cars" },
  "home.all": { kk: "Барлығы", ru: "Все авто", en: "All cars" },
  "home.services": { kk: "Сервистер", ru: "Сервисы", en: "Services" },

  "svc.cars.d": { kk: "Жаңа және қолданылған", ru: "Новые и с пробегом", en: "New and used" },
  "svc.ai.d": { kk: "Көлік таңдауға көмек", ru: "Поможет выбрать авто", en: "Helps you choose" },
  "svc.dealer.d": { kk: "Автосалонмен байланыс", ru: "Связь с автосалоном", en: "Talk to the dealer" },
  "svc.insurance.d": { kk: "ОГПО және КАСКО", ru: "ОГПО и КАСКО", en: "MTPL and CASCO" },
  "svc.finance.d": { kk: "Несие, бөліп төлеу, лизинг", ru: "Кредит, рассрочка, лизинг", en: "Loan, installments, leasing" },
  "svc.delivery.d": { kk: "Тапсырыс және бақылау", ru: "Заказ и отслеживание", en: "Order and tracking" },

  "cars.title": { kk: "Көліктер", ru: "Автомобили", en: "Cars" },
  "cars.filter": { kk: "Сүзгі", ru: "Фильтр", en: "Filter" },
  "cars.favorites": { kk: "Таңдаулылар", ru: "Избранное", en: "Favorites" },
  "cars.details": { kk: "Толығырақ", ru: "Подробнее", en: "Details" },
  "cars.from": { kk: "айына", ru: "в мес.", en: "/mo" },
  "cars.empty": { kk: "Ештеңе табылмады", ru: "Ничего не найдено", en: "Nothing found" },

  "ai.title": { kk: "AI консультант", ru: "AI консультант", en: "AI assistant" },
  "ai.sub": {
    kk: "Көлік, несие, КАСКО және ОГПО туралы сұраңыз.",
    ru: "Спросите про авто, кредит, КАСКО и ОГПО.",
    en: "Ask about cars, credit, CASCO and MTPL.",
  },
  "ai.ask": { kk: "Сұрақ қою", ru: "Задать вопрос", en: "Ask a question" },
  "ai.pick": { kk: "Көлік таңдау", ru: "Подобрать авто", en: "Find me a car" },
  "ai.tips": { kk: "Кеңестер", ru: "Советы", en: "Tips" },
  "ai.ph": { kk: "Хабарлама жазыңыз", ru: "Напишите сообщение", en: "Write a message" },
  "ai.thinking": { kk: "Ойлануда…", ru: "Думаю…", en: "Thinking…" },

  "ins.title": { kk: "Сақтандыру", ru: "Страхование", en: "Insurance" },
  "ins.ogpo": { kk: "ОГПО есептеу", ru: "Рассчитать ОГПО", en: "Calculate MTPL" },
  "ins.kasko": { kk: "КАСКО есептеу", ru: "Рассчитать КАСКО", en: "Calculate CASCO" },
  "ins.buy": { kk: "Сатып алу", ru: "Купить", en: "Buy" },
  "ins.carPrice": { kk: "Көлік құны", ru: "Стоимость авто", en: "Car value" },
  "ins.age": { kk: "Жүргізуші жасы", ru: "Возраст водителя", en: "Driver age" },
  "ins.exp": { kk: "Жүргізу өтілі (жыл)", ru: "Стаж (лет)", en: "Experience (years)" },
  "ins.result": { kk: "Жылдық құны", ru: "Стоимость за год", en: "Yearly price" },
  "ins.bought": { kk: "Полис рәсімделді", ru: "Полис оформлен", en: "Policy issued" },

  "fin.title": { kk: "Қаржыландыру", ru: "Финансирование", en: "Financing" },
  "fin.credit": { kk: "Несие", ru: "Кредит", en: "Loan" },
  "fin.install": { kk: "Бөліп төлеу", ru: "Рассрочка", en: "Installments" },
  "fin.leasing": { kk: "Лизинг", ru: "Лизинг", en: "Leasing" },
  "fin.price": { kk: "Көлік бағасы", ru: "Цена авто", en: "Car price" },
  "fin.down": { kk: "Бастапқы жарна", ru: "Первый взнос", en: "Down payment" },
  "fin.term": { kk: "Мерзім (ай)", ru: "Срок (мес.)", en: "Term (months)" },
  "fin.monthly": { kk: "Айлық төлем", ru: "Ежемесячный платеж", en: "Monthly payment" },
  "fin.apply": { kk: "Өтініш беру", ru: "Подать заявку", en: "Apply" },

  "del.title": { kk: "Көлікті жеткізу", ru: "Доставка авто", en: "Car delivery" },
  "del.city": { kk: "Қала", ru: "Город", en: "City" },
  "del.address": { kk: "Мекенжай", ru: "Адрес", en: "Address" },
  "del.date": { kk: "Күні", ru: "Дата", en: "Date" },
  "del.order": { kk: "Жеткізуге тапсырыс", ru: "Заказать доставку", en: "Order delivery" },
  "del.track": { kk: "Мәртебені бақылау", ru: "Отслеживание статуса", en: "Track status" },
  "del.s1": { kk: "Расталды", ru: "Подтверждено", en: "Confirmed" },
  "del.s2": { kk: "Дайындалуда", ru: "Подготовка", en: "Preparing" },
  "del.s3": { kk: "Жолда", ru: "В пути", en: "On the way" },
  "del.s4": { kk: "Жеткізілді", ru: "Доставлено", en: "Delivered" },

  "pro.title": { kk: "Профиль", ru: "Профиль", en: "Profile" },
  "pro.account": { kk: "Аккаунт", ru: "Аккаунт", en: "Account" },
  "pro.orders": { kk: "Менің өтініштерім", ru: "Мои заявки", en: "My requests" },
  "pro.fav": { kk: "Таңдаулы", ru: "Избранное", en: "Favorites" },
  "pro.settings": { kk: "Баптаулар", ru: "Настройки", en: "Settings" },
  "pro.push": { kk: "Push хабарламалар", ru: "Push уведомления", en: "Push notifications" },
  "pro.lang": { kk: "Тіл", ru: "Язык", en: "Language" },
  "pro.empty": { kk: "Әзірге бос", ru: "Пока пусто", en: "Nothing yet" },

  "chat.title": { kk: "Дилермен чат", ru: "Чат с дилером", en: "Dealer chat" },
  "chat.call": { kk: "Қоңырау шалу", ru: "Позвонить", en: "Call" },
  "chat.write": { kk: "Жазу", ru: "Написать", en: "Message" },
  "chat.location": { kk: "Салон локациясы", ru: "Локация салона", en: "Showroom location" },

  "auth.signin": { kk: "Кіру", ru: "Войти", en: "Sign in" },
  "auth.signup": { kk: "Тіркелу", ru: "Регистрация", en: "Sign up" },
  "auth.email": { kk: "Email", ru: "Email", en: "Email" },
  "auth.password": { kk: "Құпиясөз", ru: "Пароль", en: "Password" },
  "auth.name": { kk: "Аты-жөні", ru: "Имя и фамилия", en: "Full name" },
  "auth.phone": { kk: "Телефон", ru: "Телефон", en: "Phone" },
  "auth.haveAcc": { kk: "Аккаунтым бар", ru: "У меня есть аккаунт", en: "I have an account" },
  "auth.noAcc": { kk: "Аккаунт жоқ па?", ru: "Нет аккаунта?", en: "No account?" },
  "auth.logout": { kk: "Шығу", ru: "Выйти", en: "Sign out" },
  "auth.needLogin": {
    kk: "Жалғастыру үшін кіріңіз",
    ru: "Войдите, чтобы продолжить",
    en: "Sign in to continue",
  },
  "auth.checkEmail": {
    kk: "Email поштаңызды растаңыз",
    ru: "Подтвердите почту",
    en: "Confirm your email",
  },
  "auth.save": { kk: "Сақтау", ru: "Сохранить", en: "Save" },
  "auth.saved": { kk: "Сақталды", ru: "Сохранено", en: "Saved" },

  "req.sent": { kk: "Өтінім жіберілді", ru: "Заявка отправлена", en: "Request sent" },
  "req.status": { kk: "Мәртебе", ru: "Статус", en: "Status" },

  "dash.title": { kk: "Дилер кабинеті", ru: "Кабинет дилера", en: "Dealer dashboard" },
  "dash.myCars": { kk: "Менің көліктерім", ru: "Мои авто", en: "My cars" },
  "dash.requests": { kk: "Өтінімдер", ru: "Заявки", en: "Requests" },
  "dash.add": { kk: "Көлік қосу", ru: "Добавить авто", en: "Add car" },
  "dash.noAccess": {
    kk: "Бұл бөлім тек дилерлерге арналған",
    ru: "Раздел доступен только дилерам",
    en: "Dealers only",
  },
} as const;


export type Key = keyof typeof dict;

const I18nContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "ru",
  setLang: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");

  useEffect(() => {
    const stored = window.localStorage.getItem("motra.lang") as Lang | null;
    if (stored === "kk" || stored === "ru" || stored === "en") setLangState(stored);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("motra.lang", l);
  }, []);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const { lang, setLang } = useContext(I18nContext);
  const t = useCallback((key: Key) => dict[key][lang], [lang]);
  return { lang, setLang, t };
}
