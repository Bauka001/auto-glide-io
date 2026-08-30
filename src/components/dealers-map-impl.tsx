import { Link } from "@tanstack/react-router";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { BadgeCheck, MapPin, Star, Store } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { num } from "@/lib/cars";
import type { MapDealer } from "./dealers-map";

const icon = L.divIcon({
  className: "",
  html: `<span style="display:grid;place-items:center;width:34px;height:34px;border-radius:9999px;background:hsl(var(--primary));color:hsl(var(--primary-foreground));box-shadow:0 6px 16px rgba(0,0,0,.25);font-size:16px">🚗</span>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -16],
});

export default function DealersMapImpl({
  dealers,
  height,
  zoom,
}: {
  dealers: MapDealer[];
  height: number;
  zoom?: number;
}) {
  const { t } = useI18n();
  const pins = dealers.filter((d) => d.lat != null && d.lng != null);
  const center: [number, number] = pins.length
    ? [pins[0]!.lat as number, pins[0]!.lng as number]
    : [48.0196, 66.9237];

  return (
    <div
      className="overflow-hidden rounded-3xl border border-border"
      style={{ height }}
      role="region"
      aria-label={t("dlr.map")}
    >
      <MapContainer
        center={center}
        zoom={zoom ?? (pins.length === 1 ? 13 : 5)}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pins.map((d) => (
          <Marker key={d.id} position={[d.lat as number, d.lng as number]} icon={icon}>
            <Popup>
              <div className="w-52">
                <div className="flex items-center gap-2">
                  {d.logoUrl ? (
                    <img
                      src={d.logoUrl}
                      alt={d.name}
                      className="h-10 w-10 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15">
                      <Store className="h-5 w-5 text-primary" />
                    </span>
                  )}
                  <p className="flex items-center gap-1 text-sm font-semibold text-foreground">
                    {d.name}
                    <BadgeCheck className="hidden h-4 w-4" />
                  </p>
                </div>
                <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {d.rating || "—"} (
                  {num(d.reviews)})
                </p>
                <p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {d.address || d.city || "—"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("dlr.inStock")}: {num(d.cars)}
                </p>
                <Button asChild size="sm" className="mt-2 w-full rounded-xl">
                  <Link to="/dealers/$dealerId" params={{ dealerId: d.slug ?? d.id }}>
                    {t("dlr.viewProfile")}
                  </Link>
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
