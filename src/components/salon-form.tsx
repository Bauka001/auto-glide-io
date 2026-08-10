import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useMyDealer, useSaveDealer } from "@/lib/dealers";

/** Dealer-facing editor for the public salon profile. */
export function SalonForm() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: dealer } = useMyDealer(user?.id);
  const save = useSaveDealer(user?.id);
  const [form, setForm] = useState({
    name: "",
    city: "",
    address: "",
    phone: "",
    hours: "09:00-19:00",
    about: "",
    logoUrl: "",
    coverUrl: "",
  });

  useEffect(() => {
    if (!dealer) return;
    setForm({
      name: dealer.name,
      city: dealer.city,
      address: dealer.address,
      phone: dealer.phone,
      hours: dealer.hours,
      about: dealer.about,
      logoUrl: dealer.logoUrl ?? "",
      coverUrl: dealer.coverUrl ?? "",
    });
  }, [dealer]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const fields: { k: keyof typeof form; label: string }[] = [
    { k: "name", label: t("dlr.name") },
    { k: "city", label: t("dlr.city") },
    { k: "address", label: t("dlr.address") },
    { k: "phone", label: t("dlr.phone") },
    { k: "hours", label: t("dlr.hours") },
    { k: "about", label: t("dlr.about") },
    { k: "logoUrl", label: t("dlr.logo") },
    { k: "coverUrl", label: t("dlr.cover") },
  ];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        save.mutate(form, {
          onSuccess: () => toast.success(t("dlr.saved")),
          onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "error"),
        });
      }}
      className="space-y-4 rounded-3xl border border-border bg-card p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{t("dlr.mySalon")}</p>
        {dealer && (
          <Button asChild size="sm" variant="secondary" className="rounded-2xl">
            <Link to="/dealers/$dealerId" params={{ dealerId: dealer.slug ?? dealer.id }}>
              {t("dlr.open")}
            </Link>
          </Button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.k} className="space-y-1.5">
            <Label className="text-xs">{f.label}</Label>
            <Input value={form[f.k]} onChange={set(f.k)} className="h-11 rounded-2xl" />
          </div>
        ))}
      </div>
      <Button type="submit" className="rounded-2xl" disabled={save.isPending}>
        {t("dlr.save")}
      </Button>
    </form>
  );
}
