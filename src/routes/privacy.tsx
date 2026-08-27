import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { useI18n, type Key } from "@/lib/i18n";

export const CONTACT_EMAIL = "{{CONTACT_EMAIL}}";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Құпиялылық саясаты — AutoHub" },
      {
        name: "description",
        content:
          "AutoHub қандай жеке деректерді жинайды, оларды қалай пайдаланады, сақтайды және сіздің құқықтарыңыз.",
      },
      { property: "og:title", content: "Құпиялылық саясаты — AutoHub" },
      {
        property: "og:description",
        content: "Жеке деректерді жинау, беру, сақтау және пайдаланушы құқықтары туралы.",
      },
    ],
  }),
  component: PrivacyPage,
});

const sections: Array<[Key, Key]> = [
  ["privacy.h1", "privacy.p1"],
  ["privacy.h2", "privacy.p2"],
  ["privacy.h3", "privacy.p3"],
  ["privacy.h4", "privacy.p4"],
];

function PrivacyPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">{t("privacy.title")}</h1>
        <p className="mt-2 text-xs text-muted-foreground">
          {t("privacy.updated")}: 2026-08-27
        </p>

        <div className="mt-8 space-y-6">
          {sections.map(([h, p]) => (
            <section key={h} className="rounded-3xl border border-border bg-card p-5">
              <h2 className="text-base font-semibold">{t(h)}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(p)}</p>
            </section>
          ))}

          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="text-base font-semibold">{t("privacy.h5")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("privacy.p5")}{" "}
              <span className="font-medium text-foreground">{CONTACT_EMAIL}</span>
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
