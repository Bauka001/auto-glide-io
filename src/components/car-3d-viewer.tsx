import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { motion, useInView } from "framer-motion";
import { BrandLoader } from "@/components/brand-loader";
import { type Car, num } from "@/lib/cars";
import { carTitle, drives, optionLabel, transmissions } from "@/lib/car-spec";
import { useI18n } from "@/lib/i18n";

/** Placeholder path — replace {{CAR_MODEL_FILE}} with the real GLB file name. */
const MODEL_URL = "/models/{{CAR_MODEL_FILE}}.glb";

const Car3DScene = lazy(() => import("@/components/car-3d-scene"));

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** HEAD-check the GLB so a missing model degrades to the existing photo. */
function useModelAvailable(url: string) {
  const [state, setState] = useState<"checking" | "ok" | "missing">("checking");
  useEffect(() => {
    let alive = true;
    fetch(url, { method: "HEAD" })
      .then((r) => alive && setState(r.ok ? "ok" : "missing"))
      .catch(() => alive && setState("missing"));
    return () => {
      alive = false;
    };
  }, [url]);
  return state;
}

function SpecReveal({ car }: { car: Car }) {
  const { t, lang } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const specs = [
    { label: t("cmp.engine"), value: car.engine },
    { label: t("spec.volume"), value: `${(car.engineVolume ?? 0).toFixed(1)} L` },
    { label: t("cmp.fuel"), value: car.fuel },
    { label: t("cmp.mileage"), value: `${num(car.mileage)} km` },
    { label: t("f.drive"), value: optionLabel(drives, car.drive, lang) },
    { label: t("cmp.trans"), value: optionLabel(transmissions, car.transmission, lang) || car.transmission },
  ].filter((s) => s.value);

  return (
    <div ref={ref} className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
      {specs.map((s, i) => (
        <div key={s.label}>
          <motion.span
            className="block h-px origin-left bg-primary/60"
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
          />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: i * 0.12 + 0.25, ease: "easeOut" }}
            className="pt-2"
          >
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="text-lg font-semibold">{s.value}</p>
          </motion.div>
        </div>
      ))}
    </div>
  );
}

export function Car3DViewer({ car }: { car: Car }) {
  const reduced = useReducedMotion();
  const model = useModelAvailable(MODEL_URL);

  return (
    <section className="mt-10">
      <div className="relative h-[70vh] w-full overflow-hidden rounded-3xl border border-border bg-[#0b0d12]">
        {model === "checking" && (
          <div className="grid h-full place-items-center">
            <BrandLoader />
          </div>
        )}
        {model === "missing" && (
          <img
            src={car.image}
            alt={carTitle(car)}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
        {model === "ok" && (
          <ClientOnly
            fallback={
              <div className="grid h-full place-items-center">
                <BrandLoader />
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="grid h-full place-items-center">
                  <BrandLoader />
                </div>
              }
            >
              <Car3DScene url={MODEL_URL} reducedMotion={reduced} />
            </Suspense>
          </ClientOnly>
        )}
      </div>
      <SpecReveal car={car} />
    </section>
  );
}
