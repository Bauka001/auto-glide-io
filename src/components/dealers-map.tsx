import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";

const MapImpl = lazy(() => import("./dealers-map-impl"));

export type MapDealer = {
  id: string;
  slug: string | null;
  name: string;
  city: string;
  address: string;
  logoUrl: string | null;
  rating: number;
  reviews: number;
  cars: number;
  lat: number | null;
  lng: number | null;
};

function Skeleton({ height }: { height: number }) {
  return (
    <div className="animate-pulse rounded-3xl bg-muted" style={{ height }} aria-hidden="true" />
  );
}

/** Interactive dealership map. Browser-only (Leaflet touches window/document). */
export function DealersMap({
  dealers,
  height = 320,
  zoom,
}: {
  dealers: MapDealer[];
  height?: number;
  zoom?: number;
}) {
  return (
    <ClientOnly fallback={<Skeleton height={height} />}>
      <Suspense fallback={<Skeleton height={height} />}>
        <MapImpl dealers={dealers} height={height} {...(zoom === undefined ? {} : { zoom })} />
      </Suspense>
    </ClientOnly>
  );
}
