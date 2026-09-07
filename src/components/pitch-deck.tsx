import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CarFront,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Expand,
  Heart,
  MapPin,
  MessageSquareText,
  Pencil,
  Route,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";

const TOTAL_SLIDES = 11;
const STORAGE_KEY = "autohub.pitch.edits";

type PitchDeckProps = {
  current: number;
  printMode: boolean;
  onNavigate: (slide: number) => void;
};

type EditMap = Record<string, string>;

function Editable({ id, children, className = "" }: { id: string; children: string; className?: string }) {
  const [value, setValue] = useState(children);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as EditMap;
      setValue(saved[id] ?? children);
    } catch {
      setValue(children);
    }
  }, [children, id]);

  return (
    <span
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label="Өңделетін мәтін"
      className={`pitch-editable ${className}`}
      onBlur={(event) => {
        const next = event.currentTarget.textContent?.trim() || children;
        setValue(next);
        try {
          const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as EditMap;
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...saved, [id]: next }));
        } catch {
          // The deck remains editable even when browser storage is unavailable.
        }
      }}
    >
      {value}
    </span>
  );
}

function SlideFrame({
  number,
  kicker,
  title,
  children,
  accent = "blue",
}: {
  number: number;
  kicker: string;
  title: ReactNode;
  children: ReactNode;
  accent?: "blue" | "amber";
}) {
  return (
    <article className={`pitch-slide pitch-slide-${accent}`} aria-label={`${number}. ${kicker}`}>
      <div className="pitch-road-lines" aria-hidden="true" />
      <header className="relative z-10 flex items-start justify-between">
        <div>
          <p className="slide-kicker text-pitch-muted">{kicker}</p>
          <h2 className="slide-title mt-5 max-w-[1380px] font-semibold text-pitch-foreground">{title}</h2>
        </div>
        <span className="slide-page border border-pitch-border px-5 py-2.5 text-pitch-muted">
          {String(number).padStart(2, "0")}
        </span>
      </header>
      <div className="relative z-10 mt-16 min-h-0 flex-1">{children}</div>
      <footer className="slide-footer relative z-10 mt-10 flex items-center justify-between text-pitch-dim">
        <span>AUTOHUB · INVESTOR DECK</span>
        <span>KAZAKHSTAN · 2026</span>
      </footer>
    </article>
  );
}

function CoverSlide() {
  return (
    <article className="pitch-slide pitch-cover" aria-label="1. AutoHub">
      <div className="pitch-road-lines" aria-hidden="true" />
      <div className="pitch-car-outline" aria-hidden="true"><CarFront /></div>
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-center gap-5">
          <span className="grid h-16 w-16 place-items-center bg-pitch-blue text-3xl font-bold text-pitch-canvas">A</span>
          <span className="text-3xl font-semibold text-pitch-foreground">AutoHub</span>
        </div>
        <div className="max-w-[1450px]">
          <p className="slide-kicker mb-8 text-pitch-blue">KAZAKHSTAN · AUTOMOTIVE COMMERCE</p>
          <h1 className="slide-title-lg font-semibold text-pitch-foreground">Онлайн автосалон</h1>
          <p className="mt-7 max-w-[1250px] text-[52px] leading-[1.15] text-pitch-muted">
            көлікті таңдаудан жеткізуге дейін бір жерде
          </p>
        </div>
        <div className="flex items-end justify-between border-t border-pitch-border pt-8">
          <div className="flex gap-12 text-pitch-muted">
            <Editable id="cover-name">[АТЫ-ЖӨНІ]</Editable>
            <Editable id="cover-email">[EMAIL / TELEGRAM]</Editable>
          </div>
          <span className="slide-page text-pitch-muted">01 / 11</span>
        </div>
      </div>
    </article>
  );
}

function ProblemSlide() {
  const steps = [
    [Store, "Бірнеше салон", "Әр мекенжайға бөлек бару"],
    [CreditCard, "Бөлек қаржы", "Шарттарды қолмен салыстыру"],
    [MessageSquareText, "Үзік байланыс", "Мәртебе мен жауапты күту"],
    [Route, "Белгісіз жеткізу", "Бірыңғай бақылау жоқ"],
  ] as const;
  return (
    <SlideFrame number={2} kicker="МӘСЕЛЕ" title={<>Көлік сатып алу әлі де <span className="text-pitch-amber">офлайн маршрут</span></>} accent="amber">
      <div className="grid grid-cols-4 gap-6 pt-10">
        {steps.map(([Icon, label, detail], index) => (
          <div key={label} className="relative border-t border-pitch-border pt-10">
            <span className="mb-12 grid h-16 w-16 place-items-center border border-pitch-amber/40 bg-pitch-amber-soft text-pitch-amber"><Icon className="h-8 w-8" /></span>
            <span className="slide-body-lg block font-semibold text-pitch-foreground">{label}</span>
            <span className="slide-caption mt-4 block max-w-[300px] text-pitch-muted">{detail}</span>
            {index < steps.length - 1 && <ChevronRight className="absolute right-0 top-14 h-7 w-7 text-pitch-dim" />}
          </div>
        ))}
      </div>
      <p className="slide-subtitle mt-20 max-w-[1300px] text-pitch-muted">Сатып алушы салыстыру, қаржыландыру және жеткізуді бір жерден басқара алмайды.</p>
    </SlideFrame>
  );
}

function AudienceSlide() {
  return (
    <SlideFrame number={3} kicker="МАҚСАТТЫ АУДИТОРИЯ" title="Екі жаққа да жаңа цифрлық арна қажет">
      <div className="grid grid-cols-2 gap-8">
        <div className="pitch-panel flex min-h-[470px] flex-col justify-between p-12">
          <Users className="h-14 w-14 text-pitch-blue" />
          <div><p className="slide-kicker text-pitch-blue">BUYERS</p><h3 className="slide-subtitle mt-5 font-semibold text-pitch-foreground">25–45 жас</h3><p className="slide-body mt-6 max-w-[600px] text-pitch-muted">Қазақстан қалаларында тұратын, алғашқы көлігін онлайн іздейтін сатып алушылар.</p></div>
          <div className="flex gap-3"><span className="pitch-tag">Mobile-first</span><span className="pitch-tag">Сенім</span><span className="pitch-tag">Уақыт</span></div>
        </div>
        <div className="pitch-panel flex min-h-[470px] flex-col justify-between p-12">
          <Store className="h-14 w-14 text-pitch-amber" />
          <div><p className="slide-kicker text-pitch-amber">DEALERS</p><h3 className="slide-subtitle mt-5 font-semibold text-pitch-foreground">Шағын және орта салондар</h3><p className="slide-body mt-6 max-w-[600px] text-pitch-muted">Қызылорда мен Алматыда көбірек клиентке шығуды қалайтын дилерлер.</p></div>
          <div className="flex gap-3"><span className="pitch-tag">Жаңа лидтер</span><span className="pitch-tag">CRM ағыны</span><span className="pitch-tag">Аналитика</span></div>
        </div>
      </div>
    </SlideFrame>
  );
}

function SolutionSlide() {
  const flow = [[CarFront, "Таңдау"], [ShieldCheck, "Тексеру"], [CircleDollarSign, "Қаржы"], [Route, "Жеткізу"]] as const;
  return (
    <SlideFrame number={4} kicker="ШЕШІМ" title={<>Бір интерфейс. <span className="text-pitch-blue">Бір толық мәміле.</span></>}>
      <div className="mt-10 flex items-stretch gap-4">
        {flow.map(([Icon, label], index) => (
          <div key={label} className="flex min-w-0 flex-1 items-center gap-4">
            <div className="pitch-panel flex h-[320px] flex-1 flex-col justify-between p-9">
              <span className="slide-page text-pitch-dim">0{index + 1}</span><Icon className="h-16 w-16 text-pitch-blue" /><span className="slide-subtitle font-semibold text-pitch-foreground">{label}</span>
            </div>
            {index < flow.length - 1 && <ArrowRight className="h-8 w-8 shrink-0 text-pitch-dim" />}
          </div>
        ))}
      </div>
      <p className="slide-body-lg mt-16 max-w-[1220px] text-pitch-muted">Тексерілген хабарландырулар, кредиттің алдын ала бағасы және жеткізу мәртебесі — барлығы онлайн.</p>
    </SlideFrame>
  );
}

function ProductSlide() {
  const products = [[CarFront, "Авто каталог"], [Route, "Дилер өтінімдері"], [CreditCard, "Төлем ағыны"], [Store, "Басқару панелі"], [Bot, "AI кеңесші"], [Heart, "Салыстыру / таңдаулы"]] as const;
  return (
    <SlideFrame number={5} kicker="PRODUCT / MVP" title="Нарыққа дайын негізгі ағындар">
      <div className="grid grid-cols-3 gap-5">
        {products.map(([Icon, name], index) => (
          <div key={name} className="pitch-product group relative h-[225px] overflow-hidden p-7">
            <div className="flex items-center justify-between"><Icon className="h-8 w-8 text-pitch-blue" /><span className="slide-chrome text-pitch-dim">0{index + 1}</span></div>
            <div className="mt-7 space-y-3" aria-hidden="true"><span className="block h-3 w-3/4 bg-pitch-line"/><span className="block h-3 w-1/2 bg-pitch-line"/><span className="block h-12 w-full border border-pitch-border bg-pitch-surface"/></div>
            <p className="slide-caption absolute bottom-6 left-7 font-semibold text-pitch-foreground">{name}</p>
          </div>
        ))}
      </div>
      <p className="slide-caption mt-6 text-pitch-muted"><Pencil className="mr-2 inline h-5 w-5" /> Скриншоттарды осы блоктарға орналастырыңыз</p>
    </SlideFrame>
  );
}

function BusinessSlide() {
  const models = [
    ["01", "Дилер жазылымы", "Ай сайынғы SaaS төлемі", "[ТАРИФ ₸ / АЙ]"],
    ["02", "Сәтті лид комиссиясы", "Расталған нәтиже үшін", "[₸ / ЛИД]"],
    ["03", "Серіктестік табыс", "Банк, сақтандыру, жеткізу", "[% КОМИССИЯ]"],
  ];
  return (
    <SlideFrame number={6} kicker="БИЗНЕС-МОДЕЛЬ" title="Үш қайталанатын табыс арнасы">
      <div className="grid grid-cols-3 gap-7 pt-7">
        {models.map(([num, title, detail, value]) => <div key={num} className="pitch-panel min-h-[410px] p-10"><span className="slide-page text-pitch-blue">{num}</span><h3 className="slide-subtitle mt-16 font-semibold text-pitch-foreground">{title}</h3><p className="slide-caption mt-5 text-pitch-muted">{detail}</p><Editable id={`model-${num}`} className="slide-body mt-14 block text-pitch-amber">{value}</Editable></div>)}
      </div>
    </SlideFrame>
  );
}

function MarketSlide() {
  return (
    <SlideFrame number={7} kicker="MARKET · TAM / SAM / SOM" title="Үлкен нарықтан нақты алғашқы үлеске">
      <div className="grid grid-cols-[1.15fr_.85fr] items-center gap-20">
        <div className="relative flex h-[510px] items-center justify-center">
          <div className="pitch-market-ring h-[500px] w-[500px]"><span>TAM</span><Editable id="tam">[₸ НАРЫҚ КӨЛЕМІ]</Editable></div>
          <div className="pitch-market-ring absolute h-[350px] w-[350px]"><span>SAM</span><Editable id="sam">[₸ МАҚСАТТЫ ҚАЛАЛАР]</Editable></div>
          <div className="pitch-market-ring absolute h-[200px] w-[200px]"><span>SOM</span><Editable id="som">[1-ЖЫЛ ҮЛЕСІ]</Editable></div>
        </div>
        <div className="space-y-7">
          <p className="slide-kicker text-pitch-muted">ЕСЕПТЕУ ЛОГИКАСЫ</p>
          {[["TAM", "Қазақстандағы қолданылған авто нарығы"], ["SAM", "Алматы + Қызылорда × орташа чек"], ["SOM", "50 листинг × конверсия × комиссия"]].map(([a,b]) => <div key={a} className="border-l-2 border-pitch-blue pl-7"><span className="slide-caption font-semibold text-pitch-blue">{a}</span><p className="slide-body mt-2 text-pitch-foreground">{b}</p></div>)}
          <p className="slide-caption text-pitch-muted">Барлық көрсеткіштерді расталған дерекпен ауыстырыңыз.</p>
        </div>
      </div>
    </SlideFrame>
  );
}

function CompetitorSlide() {
  const rows = [["Онлайн бронь депозиті", true, false], ["Жеткізуді бақылау", true, false], ["Кредит pre-score", true, false], ["Тексерілген сатушы белгісі", true, true]] as const;
  return (
    <SlideFrame number={8} kicker="БӘСЕКЕЛЕСТЕР" title="Хабарландырудан толық мәмілеге">
      <div className="mt-6 overflow-hidden border border-pitch-border">
        <div className="grid grid-cols-[1.5fr_1fr_1fr] bg-pitch-surface px-10 py-7 slide-body font-semibold"><span>Мүмкіндік</span><span className="text-pitch-blue">AutoHub</span><span className="text-pitch-muted">Kolesa.kz</span></div>
        {rows.map(([label, autohub, competitor]) => <div key={label} className="grid grid-cols-[1.5fr_1fr_1fr] items-center border-t border-pitch-border px-10 py-7 slide-body"><span className="text-pitch-foreground">{label}</span><span>{autohub ? <Check className="h-8 w-8 text-pitch-blue"/> : <X className="h-8 w-8 text-pitch-dim"/>}</span><span>{competitor ? <Check className="h-8 w-8 text-pitch-muted"/> : <X className="h-8 w-8 text-pitch-dim"/>}</span></div>)}
      </div>
    </SlideFrame>
  );
}

function ValidationSlide() {
  return (
    <SlideFrame number={9} kicker="VALIDATION" title="Сұхбаттан пилотқа дейін">
      <div className="grid grid-cols-2 gap-8 pt-4">
        {[1,2].map((n) => <blockquote key={n} className="pitch-panel flex min-h-[380px] flex-col justify-between p-11"><span className="text-7xl leading-none text-pitch-blue">“</span><Editable id={`quote-${n}`} className="slide-body-lg block text-pitch-foreground">[ДИЛЕР СҰХБАТЫНАН НАҚТЫ ЦИТАТА]</Editable><footer className="slide-caption text-pitch-muted"><Editable id={`dealer-${n}`}>[ДИЛЕР / ҚАЛА]</Editable></footer></blockquote>)}
      </div>
      <div className="mt-7 flex items-center justify-between border-t border-pitch-border pt-7"><span className="slide-body text-pitch-muted">Пилоттық міндеттеме</span><Editable id="pilot-count" className="slide-subtitle font-semibold text-pitch-amber">[ДИЛЕР САНЫ]</Editable></div>
    </SlideFrame>
  );
}

function FundingSlide() {
  const allocations = [["Дилерлерді қосу", "40%", "w-[40%]"], ["Маркетинг", "35%", "w-[35%]"], ["Өнім / қауіпсіздік", "25%", "w-[25%]"]] as const;
  return (
    <SlideFrame number={10} kicker="FUNDING ASK" title={<>1 000 000 ₸ — <span className="text-pitch-amber">алғашқы тракцияға</span></>} accent="amber">
      <div className="grid grid-cols-[1.15fr_.85fr] gap-16">
        <div className="pitch-panel p-10"><p className="slide-kicker text-pitch-muted">ҚАРЖЫ БӨЛІНІСІ</p><div className="mt-10 flex h-16 overflow-hidden">{allocations.map(([label,,width], index) => <div key={label} className={`${width} ${index === 0 ? "bg-pitch-blue" : index === 1 ? "bg-pitch-amber" : "bg-pitch-muted"}`} />)}</div><div className="mt-10 space-y-7">{allocations.map(([label,value], index) => <div key={label} className="flex items-center justify-between slide-body"><span className="flex items-center gap-4"><i className={`h-4 w-4 ${index === 0 ? "bg-pitch-blue" : index === 1 ? "bg-pitch-amber" : "bg-pitch-muted"}`}/>{label}</span><span className="font-semibold">{value}</span></div>)}</div></div>
        <div><p className="slide-kicker text-pitch-muted">КҮТІЛЕТІН НӘТИЖЕ</p><div className="mt-8 space-y-5">{["[ҚОСЫЛҒАН ДИЛЕРЛЕР]", "50 белсенді листинг", "[АЙЛЫҚ ЛИДТЕР]", "[КОНВЕРСИЯ %]"].map((x,i) => <div key={x} className="flex items-center gap-5 border-b border-pitch-border py-5"><span className="grid h-10 w-10 place-items-center bg-pitch-blue-soft text-pitch-blue"><Check className="h-5 w-5"/></span><Editable id={`outcome-${i}`} className="slide-body text-pitch-foreground">{x}</Editable></div>)}</div></div>
      </div>
    </SlideFrame>
  );
}

function TeamRoadmapSlide() {
  return (
    <SlideFrame number={11} kicker="TEAM · NEXT STEPS" title="Команда және келесі 6 ай">
      <div className="grid grid-cols-[.78fr_1.22fr] gap-12">
        <div className="grid grid-cols-2 gap-5">{[1,2].map(n => <div key={n} className="pitch-panel p-7"><div className="mb-8 grid aspect-square place-items-center bg-pitch-surface"><Users className="h-16 w-16 text-pitch-dim"/></div><Editable id={`team-name-${n}`} className="slide-body block font-semibold">[АТЫ-ЖӨНІ]</Editable><Editable id={`team-role-${n}`} className="slide-caption mt-3 block text-pitch-blue">[РОЛІ]</Editable><Editable id={`team-exp-${n}`} className="slide-chrome mt-4 block text-pitch-muted">[ТӘЖІРИБЕСІ]</Editable></div>)}</div>
        <div><p className="slide-kicker text-pitch-muted">3–6 АЙЛЫҚ ЖОЛ КАРТАСЫ</p><div className="relative mt-12 space-y-9 before:absolute before:bottom-5 before:left-5 before:top-5 before:w-px before:bg-pitch-border">{[["01", "Дилерлерді қосу", "1-ай"], ["02", "50 белсенді листинг", "2–3 ай"], ["03", "Алғашқы ақылы лидтер", "3–4 ай"], ["04", "Тракция және масштабтау", "5–6 ай"]].map(([n,t,d]) => <div key={n} className="relative flex items-center gap-7"><span className="z-10 grid h-10 w-10 place-items-center rounded-full bg-pitch-blue text-sm font-bold text-pitch-canvas">{n}</span><div className="flex flex-1 items-center justify-between border-b border-pitch-border pb-5"><span className="slide-body font-semibold">{t}</span><span className="slide-caption text-pitch-muted">{d}</span></div></div>)}</div><div className="mt-12 flex items-center gap-4 text-pitch-blue"><Sparkles className="h-7 w-7"/><span className="slide-body font-semibold">AutoHub · мәміленің жаңа цифрлық жолы</span></div></div>
      </div>
    </SlideFrame>
  );
}

const slides = [CoverSlide, ProblemSlide, AudienceSlide, SolutionSlide, ProductSlide, BusinessSlide, MarketSlide, CompetitorSlide, ValidationSlide, FundingSlide, TeamRoadmapSlide];

function ScaledSlide({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const update = () => setScale(Math.min(host.clientWidth / 1920, host.clientHeight / 1080));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);
  return <div ref={hostRef} className="pitch-stage"><div className="pitch-scaled" style={{ "--pitch-scale": scale } as CSSProperties}>{children}</div></div>;
}

export function PitchDeck({ current, printMode, onNavigate }: PitchDeckProps) {
  const ActiveSlide = useMemo(() => slides[current - 1] ?? slides[0], [current]);
  const go = useCallback((slide: number) => onNavigate(Math.min(TOTAL_SLIDES, Math.max(1, slide))), [onNavigate]);
  useEffect(() => {
    if (printMode) return;
    const onKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement | null)?.isContentEditable) return;
      if (["ArrowRight", "ArrowDown", " "].includes(event.key)) { event.preventDefault(); go(current + 1); }
      if (["ArrowLeft", "ArrowUp"].includes(event.key)) { event.preventDefault(); go(current - 1); }
      if (event.key === "Home") go(1);
      if (event.key === "End") go(TOTAL_SLIDES);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, go, printMode]);

  if (printMode) return <main className="pitch-print">{slides.map((Slide, index) => <div className="pitch-print-page" key={index}><Slide /></div>)}</main>;

  return (
    <main className="pitch-app">
      <div className="pitch-toolbar">
        <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center bg-pitch-blue font-bold text-pitch-canvas">A</span><span className="font-semibold text-pitch-foreground">AutoHub Pitch</span></div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-pitch-muted hover:bg-pitch-surface hover:text-pitch-foreground" title="Толық экран" onClick={() => void document.documentElement.requestFullscreen()}><Expand /></Button>
          <Button variant="ghost" size="icon" className="text-pitch-muted hover:bg-pitch-surface hover:text-pitch-foreground" title="Алдыңғы" disabled={current === 1} onClick={() => go(current - 1)}><ArrowLeft /></Button>
          <Button variant="ghost" size="icon" className="text-pitch-muted hover:bg-pitch-surface hover:text-pitch-foreground" title="Келесі" disabled={current === TOTAL_SLIDES} onClick={() => go(current + 1)}><ArrowRight /></Button>
        </div>
      </div>
      <ScaledSlide><ActiveSlide /></ScaledSlide>
      <div className="pitch-progress"><div className="h-1 bg-pitch-line"><div className="h-full bg-pitch-blue transition-all" style={{ width: `${(current / TOTAL_SLIDES) * 100}%` }} /></div><div className="mt-3 flex justify-between text-sm text-pitch-muted"><span>{String(current).padStart(2,"0")} / {TOTAL_SLIDES}</span><span className="hidden sm:inline">← → пернелерімен басқару · мәтінді басып өңдеу</span></div></div>
    </main>
  );
}