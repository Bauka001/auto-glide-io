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
  "cars.from": { kk: " / айына", ru: " / в мес.", en: " / mo" },
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
  "del.tariff": { kk: "Тариф", ru: "Тариф", en: "Plan" },
  "del.standard": { kk: "Стандарт", ru: "Стандарт", en: "Standard" },
  "del.standardD": { kk: "5–7 күн", ru: "5–7 дней", en: "5–7 days" },
  "del.express": { kk: "Экспресс", ru: "Экспресс", en: "Express" },
  "del.expressD": { kk: "2–3 күн", ru: "2–3 дня", en: "2–3 days" },
  "del.vip": { kk: "VIP тіркеме", ru: "VIP автовоз", en: "VIP carrier" },
  "del.vipD": { kk: "Жабық автовоз, 1–2 күн", ru: "Закрытый автовоз, 1–2 дня", en: "Enclosed carrier, 1–2 days" },
  "del.distance": { kk: "Қашықтық, км", ru: "Расстояние, км", en: "Distance, km" },
  "del.base": { kk: "Базалық баға", ru: "Базовая цена", en: "Base price" },
  "del.perKm": { kk: "Километрге", ru: "За километр", en: "Per kilometer" },
  "del.insuranceAdd": { kk: "Жол сақтандыруы", ru: "Страховка в пути", en: "Transit insurance" },
  "del.total": { kk: "Барлығы", ru: "Итого", en: "Total" },
  "del.pay": { kk: "Төлеп, тапсырыс беру", ru: "Оплатить и заказать", en: "Pay and order" },
  "del.paid": { kk: "Төлем қабылданды", ru: "Оплата принята", en: "Payment received" },
  "del.payNote": {
    kk: "Жеткізу — ақылы қызмет. Төлем тапсырыс расталғанда алынады.",
    ru: "Доставка — платная услуга. Оплата списывается при подтверждении заказа.",
    en: "Delivery is a paid service. Payment is taken when the order is confirmed.",
  },

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

  "cars.all": { kk: "Барлық көліктер", ru: "Все автомобили", en: "All cars" },
  "cars.count": { kk: "көлік табылды", ru: "авто найдено", en: "cars available" },
  "cars.reset": { kk: "Тазалау", ru: "Сбросить", en: "Reset" },
  "cars.maxPrice": { kk: "Ең жоғары баға", ru: "Макс. цена", en: "Max price" },
  "cars.minYear": { kk: "Ең ерте жыл", ru: "Мин. год", en: "Min year" },
  "cars.maxMileage": { kk: "Ең көп жүріс", ru: "Макс. пробег", en: "Max mileage" },
  "cars.noMatch": { kk: "Бұл сүзгіге сай көлік жоқ.", ru: "Нет авто по этим фильтрам.", en: "No cars match these filters." },
  "cars.searchPh": { kk: "Марка немесе модель", ru: "Марка или модель", en: "Brand or model" },
  "cars.share": { kk: "Сілтемені көшіру", ru: "Скопировать ссылку", en: "Copy link" },
  "cars.linkCopied": { kk: "Сілтеме көшірілді", ru: "Ссылка скопирована", en: "Link copied" },

  "cmp.title": { kk: "Салыстыру", ru: "Сравнение", en: "Compare" },
  "cmp.add": { kk: "Салыстыруға қосу", ru: "Добавить к сравнению", en: "Add to compare" },
  "cmp.added": { kk: "Салыстыруға қосылды", ru: "Добавлено к сравнению", en: "Added to compare" },
  "cmp.removed": { kk: "Салыстырудан алынды", ru: "Убрано из сравнения", en: "Removed from compare" },
  "cmp.full": { kk: "Ең көбі 3 көлік", ru: "Максимум 3 авто", en: "Up to 3 cars" },
  "cmp.open": { kk: "Салыстыруды ашу", ru: "Открыть сравнение", en: "Open compare" },
  "cmp.clear": { kk: "Тазалау", ru: "Очистить", en: "Clear" },
  "cmp.empty": {
    kk: "Салыстыру үшін көлік карточкасындағы «Салыстыру» батырмасын басыңыз.",
    ru: "Нажмите «Сравнить» на карточке авто, чтобы добавить сюда.",
    en: "Tap Compare on a car card to add it here.",
  },
  "cmp.price": { kk: "Баға", ru: "Цена", en: "Price" },
  "cmp.monthly": { kk: "Айлық төлем", ru: "Платёж в месяц", en: "Monthly payment" },
  "cmp.year": { kk: "Жыл", ru: "Год", en: "Year" },
  "cmp.mileage": { kk: "Жүріс", ru: "Пробег", en: "Mileage" },
  "cmp.engine": { kk: "Қозғалтқыш", ru: "Двигатель", en: "Engine" },
  "cmp.fuel": { kk: "Отын", ru: "Топливо", en: "Fuel" },
  "cmp.trans": { kk: "Беріліс қорабы", ru: "Коробка", en: "Transmission" },
  "cmp.category": { kk: "Санат", ru: "Категория", en: "Category" },
  "cmp.city": { kk: "Қала", ru: "Город", en: "City" },

  "theme.light": { kk: "Ашық тема", ru: "Светлая тема", en: "Light theme" },
  "theme.dark": { kk: "Қараңғы тема", ru: "Тёмная тема", en: "Dark theme" },

  "ai.found": { kk: "Табылған көліктер", ru: "Найденные авто", en: "Matching cars" },

  "cr.title": { kk: "Несиеге өтінім", ru: "Заявка на кредит", en: "Apply for credit" },
  "cr.step1": { kk: "Деректеріңіз", ru: "Ваши данные", en: "Your details" },
  "cr.step2": { kk: "Табысыңыз", ru: "Ваш доход", en: "Income" },
  "cr.step3": { kk: "Растау", ru: "Подтверждение", en: "Confirmation" },
  "cr.name": { kk: "Аты-жөні", ru: "Имя и фамилия", en: "Full name" },
  "cr.phone": { kk: "Телефон", ru: "Телефон", en: "Phone" },
  "cr.income": { kk: "Айлық табыс", ru: "Ежемесячный доход", en: "Monthly income" },
  "cr.down": { kk: "Бастапқы жарна (міндетті емес)", ru: "Первый взнос (необязательно)", en: "Down payment (optional)" },
  "cr.back": { kk: "Артқа", ru: "Назад", en: "Back" },
  "cr.next": { kk: "Жалғастыру", ru: "Продолжить", en: "Continue" },
  "cr.submit": { kk: "Жіберу", ru: "Отправить", en: "Submit" },
  "cr.done": { kk: "Алдын ала мақұлданды", ru: "Предварительно одобрено", en: "Pre-approved" },
  "cr.doneSub": {
    kk: "Рақмет! Маман түпкілікті шарттарды чатта растайды.",
    ru: "Спасибо! Специалист подтвердит финальные условия в чате.",
    en: "Thanks — a specialist will confirm the final terms in the chat.",
  },
  "cr.openChat": { kk: "Чатты ашу", ru: "Открыть чат", en: "Open chat" },
  "cr.keepBrowsing": { kk: "Көліктерді қарау", ru: "Смотреть авто", en: "Keep browsing" },

  "car.credit": { kk: "Несиеге өтінім", ru: "Заявка на кредит", en: "Apply for credit" },
  "car.chat": { kk: "Дилермен чат", ru: "Чат с дилером", en: "Chat with dealer" },
  "car.delivery": { kk: "Жеткізуге тапсырыс", ru: "Заказать доставку", en: "Order delivery" },

  "req.updated": { kk: "Өтінім мәртебесі жаңарды", ru: "Статус заявки обновлён", en: "Request status updated" },

  "dash.stats": { kk: "Статистика", ru: "Статистика", en: "Statistics" },
  "dash.views": { kk: "Қаралым", ru: "Просмотры", en: "Views" },
  "dash.reqCount": { kk: "Өтінімдер", ru: "Заявки", en: "Requests" },
  "dash.conv": { kk: "Конверсия", ru: "Конверсия", en: "Conversion" },
  "dash.approved": { kk: "Мақұлданған", ru: "Одобрено", en: "Approved" },
  "dash.topCars": { kk: "Ең көп қаралған", ru: "Самые просматриваемые", en: "Most viewed" },
  "dash.brand": { kk: "Марка", ru: "Марка", en: "Brand" },
  "dash.model": { kk: "Модель", ru: "Модель", en: "Model" },
  "dash.year": { kk: "Жыл", ru: "Год", en: "Year" },
  "dash.price": { kk: "Баға, ₸", ru: "Цена, ₸", en: "Price, ₸" },
  "dash.mileage": { kk: "Жүріс, км", ru: "Пробег, км", en: "Mileage, km" },
  "dash.city": { kk: "Қала", ru: "Город", en: "City" },
  "dash.photo": { kk: "Сурет сілтемесі", ru: "Ссылка на фото", en: "Photo URL" },

  "f.filters": { kk: "Сүзгі", ru: "Фильтр", en: "Filters" },
  "f.all": { kk: "Барлық параметрлер", ru: "Все параметры", en: "All parameters" },
  "f.show": { kk: "Нәтижені көрсету", ru: "Показать результаты", en: "Show results" },
  "f.clear": { kk: "Тазалау", ru: "Очистить", en: "Clear" },
  "f.brand": { kk: "Марка", ru: "Марка", en: "Brand" },
  "f.model": { kk: "Модель", ru: "Модель", en: "Model" },
  "f.any": { kk: "Кез келген", ru: "Любой", en: "Any" },
  "f.priceFrom": { kk: "Бағасы, ₸ бастап", ru: "Цена, ₸ от", en: "Price, ₸ from" },
  "f.priceTo": { kk: "дейін", ru: "до", en: "to" },
  "f.yearFrom": { kk: "Жылы бастап", ru: "Год от", en: "Year from" },
  "f.yearTo": { kk: "дейін", ru: "до", en: "to" },
  "f.mileageTo": { kk: "Жүрісі, км дейін", ru: "Пробег, км до", en: "Mileage, km up to" },
  "f.body": { kk: "Кузов түрі", ru: "Тип кузова", en: "Body type" },
  "f.fuel": { kk: "Отын түрі", ru: "Топливо", en: "Fuel" },
  "f.trans": { kk: "Беріліс қорабы", ru: "Коробка передач", en: "Transmission" },
  "f.drive": { kk: "Жетек", ru: "Привод", en: "Drive" },
  "f.volFrom": { kk: "Көлемі, л бастап", ru: "Объём, л от", en: "Volume, L from" },
  "f.volTo": { kk: "дейін", ru: "до", en: "to" },
  "f.color": { kk: "Түсі", ru: "Цвет", en: "Color" },
  "f.city": { kk: "Қала", ru: "Город", en: "City" },
  "f.steering": { kk: "Руль", ru: "Руль", en: "Steering" },
  "f.condition": { kk: "Күйі", ru: "Состояние", en: "Condition" },
  "f.customs": { kk: "Растаможен", ru: "Растаможен", en: "Customs cleared" },
  "f.sort": { kk: "Сұрыптау", ru: "Сортировка", en: "Sort" },
  "f.sortNew": { kk: "Жаңа хабарландырулар", ru: "Сначала новые", en: "Newest first" },
  "f.sortPriceAsc": { kk: "Баға: арзаннан", ru: "Цена: дешевле", en: "Price: low to high" },
  "f.sortPriceDesc": { kk: "Баға: қымбаттан", ru: "Цена: дороже", en: "Price: high to low" },
  "f.sortMileage": { kk: "Жүрісі аз", ru: "Меньше пробег", en: "Lowest mileage" },
  "f.sortYear": { kk: "Жаңа жыл", ru: "Новее год", en: "Newest year" },
  "f.grid": { kk: "Торкөз", ru: "Плитка", en: "Grid" },
  "f.list": { kk: "Тізім", ru: "Список", en: "List" },
  "f.save": { kk: "Іздеуді сақтау", ru: "Сохранить поиск", en: "Save search" },
  "f.saved": { kk: "Сақталған іздеулер", ru: "Сохранённые поиски", en: "Saved searches" },
  "f.savedOk": { kk: "Іздеу сақталды", ru: "Поиск сохранён", en: "Search saved" },

  "spec.generation": { kk: "Буын", ru: "Поколение", en: "Generation" },
  "spec.trim": { kk: "Комплектация", ru: "Комплектация", en: "Trim" },
  "spec.volume": { kk: "Қозғалтқыш көлемі, л", ru: "Объём двигателя, л", en: "Engine volume, L" },
  "spec.vin": { kk: "VIN", ru: "VIN", en: "VIN" },

  "f.generation": { kk: "Буын", ru: "Поколение", en: "Generation" },
  "f.genHint": { kk: "Алдымен модельді таңдаңыз", ru: "Сначала выберите модель", en: "Select a model first" },
  "f.onlyNew": { kk: "Тек жаңа", ru: "Только новые", en: "New only" },
  "f.allCars": { kk: "Барлық авто", ru: "Все авто", en: "All cars" },
  "f.quick": { kk: "Жылдам сүзгі", ru: "Быстрые фильтры", en: "Quick filters" },
  "f.qNew": { kk: "Жаңа авто", ru: "Новые авто", en: "New cars" },
  "f.qUnder10": { kk: "10 млн ₸ дейін", ru: "До 10 млн ₸", en: "Under 10M ₸" },
  "f.qElectric": { kk: "Электро", ru: "Электро", en: "Electric" },
  "f.aiPick": { kk: "Көлік таңдап беру", ru: "Подобрать авто", en: "Find me a car" },
  "f.selected": { kk: "Таңдалған", ru: "Выбрано", en: "Selected" },

  "adm.title": { kk: "Әкімші панелі", ru: "Панель администратора", en: "Admin panel" },
  "adm.nav": { kk: "Әкімші", ru: "Админ", en: "Admin" },
  "adm.overview": { kk: "Шолу", ru: "Обзор", en: "Overview" },
  "adm.users": { kk: "Пайдаланушылар", ru: "Пользователи", en: "Users" },
  "adm.requests": { kk: "Барлық өтінім", ru: "Все заявки", en: "All requests" },
  "adm.cars": { kk: "Барлық көлік", ru: "Все авто", en: "All cars" },
  "adm.totalUsers": { kk: "Пайдаланушы", ru: "Пользователей", en: "Users" },
  "adm.totalDealers": { kk: "Дилер", ru: "Дилеров", en: "Dealers" },
  "adm.totalCars": { kk: "Көлік", ru: "Авто", en: "Cars" },
  "adm.totalReq": { kk: "Өтінім", ru: "Заявок", en: "Requests" },
  "adm.dealerRole": { kk: "Дилер рөлі", ru: "Роль дилера", en: "Dealer role" },
  "adm.adminRole": { kk: "Әкімші рөлі", ru: "Роль админа", en: "Admin role" },
  "adm.grant": { kk: "Беру", ru: "Выдать", en: "Grant" },
  "adm.revoke": { kk: "Алу", ru: "Забрать", en: "Revoke" },
  "adm.noAccess": {
    kk: "Бұл бөлім тек әкімшіге арналған",
    ru: "Раздел доступен только администратору",
    en: "This section is for administrators only",
  },
  "adm.roleUpdated": { kk: "Рөл жаңартылды", ru: "Роль обновлена", en: "Role updated" },
  "adm.search": { kk: "Іздеу", ru: "Поиск", en: "Search" },
  "adm.published": { kk: "Жарияланған", ru: "Опубликовано", en: "Published" },
  "adm.client": { kk: "Клиент", ru: "Клиент", en: "Client" },
  "adm.salons": { kk: "Салондар", ru: "Салоны", en: "Salons" },

  "dlr.nav": { kk: "Автосалондар", ru: "Автосалоны", en: "Car dealers" },
  "dlr.title": { kk: "Автосалондар тізімі", ru: "Каталог автосалонов", en: "Car dealerships" },
  "dlr.sub": {
    kk: "Тексерілген салондар, олардың көліктері мен клиент пікірлері.",
    ru: "Проверенные салоны, их автомобили и отзывы клиентов.",
    en: "Verified salons, their cars and customer reviews.",
  },
  "dlr.verified": { kk: "Тексерілген", ru: "Проверен", en: "Verified" },
  "dlr.cars": { kk: "Көліктері", ru: "Автомобили", en: "Cars" },
  "dlr.about": { kk: "Салон туралы", ru: "О салоне", en: "About" },
  "dlr.reviews": { kk: "Пікірлер", ru: "Отзывы", en: "Reviews" },
  "dlr.rating": { kk: "Рейтинг", ru: "Рейтинг", en: "Rating" },
  "dlr.noReviews": { kk: "Әзірге пікір жоқ", ru: "Пока нет отзывов", en: "No reviews yet" },
  "dlr.writeReview": { kk: "Пікір қалдыру", ru: "Оставить отзыв", en: "Write a review" },
  "dlr.comment": { kk: "Пікіріңіз", ru: "Ваш отзыв", en: "Your review" },
  "dlr.reviewSaved": { kk: "Пікір сақталды", ru: "Отзыв сохранён", en: "Review saved" },
  "dlr.hours": { kk: "Жұмыс уақыты", ru: "Часы работы", en: "Working hours" },
  "dlr.phone": { kk: "Телефон", ru: "Телефон", en: "Phone" },
  "dlr.address": { kk: "Мекенжай", ru: "Адрес", en: "Address" },
  "dlr.city": { kk: "Қала", ru: "Город", en: "City" },
  "dlr.name": { kk: "Салон атауы", ru: "Название салона", en: "Salon name" },
  "dlr.logo": { kk: "Логотип (URL)", ru: "Логотип (URL)", en: "Logo (URL)" },
  "dlr.cover": { kk: "Мұқаба (URL)", ru: "Обложка (URL)", en: "Cover (URL)" },
  "dlr.mySalon": { kk: "Менің салоным", ru: "Мой салон", en: "My salon" },
  "dlr.save": { kk: "Сақтау", ru: "Сохранить", en: "Save" },
  "dlr.saved": { kk: "Салон сақталды", ru: "Салон сохранён", en: "Salon saved" },
  "dlr.empty": { kk: "Салондар табылмады", ru: "Салоны не найдены", en: "No salons found" },
  "dlr.open": { kk: "Салонды ашу", ru: "Открыть салон", en: "Open salon" },
  "dlr.searchPh": { kk: "Салон немесе қала", ru: "Салон или город", en: "Salon or city" },

  "chat.nav": { kk: "Хабарламалар", ru: "Сообщения", en: "Messages" },
  "chat.title": { kk: "Дилермен чат", ru: "Чат с дилером", en: "Dealer chat" },
  "chat.inbox": { kk: "Диалогтар", ru: "Диалоги", en: "Conversations" },
  "chat.empty": { kk: "Әзірге хабарлама жоқ", ru: "Сообщений пока нет", en: "No messages yet" },
  "chat.placeholder": { kk: "Хабарлама жазыңыз", ru: "Напишите сообщение", en: "Write a message" },
  "chat.dealer": { kk: "Дилер", ru: "Дилер", en: "Dealer" },
  "chat.buyer": { kk: "Сатып алушы", ru: "Покупатель", en: "Buyer" },
  "chat.ownCar": {
    kk: "Бұл сіздің көлігіңіз",
    ru: "Это ваш автомобиль",
    en: "This is your own listing",
  },
  "chat.privacy": {
    kk: "Байланыс деректері мәміле расталғанша жабық.",
    ru: "Контакты остаются скрытыми до подтверждения сделки.",
    en: "Contact details stay private until the deal is confirmed.",
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
