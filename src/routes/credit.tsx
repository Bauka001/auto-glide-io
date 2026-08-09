import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { money, monthlyPayment } from "@/lib/cars";
import { useCar } from "@/lib/catalog";
import { useAuth } from "@/lib/auth";
import { useCreateRequest } from "@/lib/requests";
import { useI18n } from "@/lib/i18n";


export const Route = createFileRoute("/credit")({
  validateSearch: (search: Record<string, unknown>): { carId?: string | undefined } => ({
    carId: typeof search["carId"] === "string" ? (search["carId"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Apply for car credit online — AutoHub" },
      {
        name: "description",
        content: "Three simple steps to a credit decision: your details, income, confirmation.",
      },
      { property: "og:title", content: "Apply for car credit online — AutoHub" },
      { property: "og:description", content: "Get a credit decision in minutes. No paperwork." },
    ],
  }),
  component: CreditPage,
});

const steps: Key[] = ["cr.step1", "cr.step2", "cr.step3"];

function CreditPage() {
  const { carId } = Route.useSearch();
  const car = useCar(carId).data ?? undefined;
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const createRequest = useCreateRequest();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", phone: "", income: "", downPayment: "" });

  useEffect(() => {
    if (!loading && !user) {
      void navigate({ to: "/auth", search: { next: "/credit" }, replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setForm((f) => ({
        ...f,
        name: f.name || (profile.full_name ?? ""),
        phone: f.phone || (profile.phone ?? ""),
      }));
    }
  }, [profile]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit() {
    try {
      await createRequest.mutateAsync({
        type: "credit",
        carId: carId ?? null,
        details: {
          name: form.name,
          phone: form.phone,
          income: form.income,
          downPayment: form.downPayment,
        },
      });
      toast.success(t("req.sent"));
      setStep(2);
    } catch {
      toast.error("Error");
    }
  }

  const canNext =
    step === 0 ? form.name.length > 1 && form.phone.length > 5 : form.income.length > 0;


  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-lg px-5 py-10">
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div
                className={`h-1 rounded-full transition-colors duration-300 ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
              <p
                className={`mt-2 text-xs ${i <= step ? "text-foreground" : "text-muted-foreground"}`}
              >
                {t(s)}
              </p>
            </div>
          ))}
        </div>

        {car && step < 2 && (
          <div className="mt-8 flex items-center gap-3 rounded-2xl bg-muted p-3">
            <img
              src={car.image}
              alt={`${car.brand} ${car.model}`}
              loading="lazy"
              width={1280}
              height={854}
              className="h-14 w-20 rounded-xl object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {car.brand} {car.model}
              </p>
              <p className="text-xs text-primary">
                {money(monthlyPayment(car.price))}/mo · {money(car.price)}
              </p>
            </div>
          </div>
        )}

        {step === 0 && (
          <div className="mt-8 animate-fade-in space-y-4">
            <h1 className="text-2xl font-semibold tracking-tight">{t("cr.title")}</h1>
            <div className="space-y-2">
              <Label htmlFor="name">{t("cr.name")}</Label>
              <Input id="name" value={form.name} onChange={set("name")} className="h-12 rounded-2xl" placeholder="" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("cr.phone")}</Label>
              <Input id="phone" value={form.phone} onChange={set("phone")} className="h-12 rounded-2xl" placeholder="+7 700 000 00 00" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="mt-8 animate-fade-in space-y-4">
            <h1 className="text-2xl font-semibold tracking-tight">{t("cr.step2")}</h1>
            <div className="space-y-2">
              <Label htmlFor="income">{t("cr.income")}</Label>
              <Input id="income" inputMode="numeric" value={form.income} onChange={set("income")} className="h-12 rounded-2xl" placeholder="450000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="down">{t("cr.down")}</Label>
              <Input id="down" inputMode="numeric" value={form.downPayment} onChange={set("downPayment")} className="h-12 rounded-2xl" placeholder="2400000" />
            </div>
          </div>
        )}

        {step === 2 ? (
          <div className="mt-12 animate-scale-in text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary">
              <Check className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="mt-6 text-2xl font-semibold tracking-tight">{t("cr.done")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("cr.doneSub")}
            </p>
            <div className="mt-8 space-y-2">
              <Button asChild className="h-12 w-full rounded-2xl">
                <Link to="/chat" search={carId ? { carId } : {}}>
                  {t("cr.openChat")}
                </Link>
              </Button>
              <Button asChild variant="secondary" className="h-12 w-full rounded-2xl">
                <Link to="/cars">{t("cr.keepBrowsing")}</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex gap-2">
            {step > 0 && (
              <Button variant="secondary" className="h-12 flex-1 rounded-2xl" onClick={() => setStep(step - 1)}>
                {t("cr.back")}
              </Button>
            )}
            <Button
              className="h-12 flex-1 rounded-2xl"
              disabled={!canNext || createRequest.isPending}
              onClick={() => (step === 1 ? void submit() : setStep(step + 1))}
            >

              {step === 1 ? t("cr.submit") : t("cr.next")}
            </Button>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
