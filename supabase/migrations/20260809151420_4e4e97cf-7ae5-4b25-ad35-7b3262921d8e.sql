CREATE TABLE public.car_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  viewer_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX car_views_car_id_idx ON public.car_views (car_id);

GRANT INSERT ON public.car_views TO anon;
GRANT SELECT, INSERT ON public.car_views TO authenticated;
GRANT ALL ON public.car_views TO service_role;

ALTER TABLE public.car_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register a car view"
  ON public.car_views FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Dealers can read views of their cars"
  ON public.car_views FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cars c WHERE c.id = car_views.car_id AND c.owner_id = auth.uid()));

CREATE POLICY "Admins can read all car views"
  ON public.car_views FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;