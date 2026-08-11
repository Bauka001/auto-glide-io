import { Car } from "lucide-react";

/** Small branded loading indicator shown while data is being fetched. */
export function BrandLoader({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10" role="status" aria-live="polite">
      <div className="relative h-12 w-12">
        <span className="absolute inset-0 rounded-2xl border-2 border-primary/20" />
        <span className="absolute inset-0 animate-spin rounded-2xl border-2 border-transparent border-t-primary" />
        <Car className="absolute inset-0 m-auto h-5 w-5 animate-pulse text-primary" />
      </div>
      <div className="flex items-center gap-1 text-sm font-semibold tracking-tight">
        <span>Auto</span>
        <span className="text-primary">Hub</span>
        <span className="flex gap-0.5 pl-0.5">
          <span className="h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
          <span className="h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
          <span className="h-1 w-1 animate-bounce rounded-full bg-primary" />
        </span>
      </div>
      {label && <p className="text-xs text-muted-foreground">{label}</p>}
    </div>
  );
}
