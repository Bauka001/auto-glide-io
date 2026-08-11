-- 1. MESSAGES: only recipient can mark read, and body/sender cannot change
DROP POLICY IF EXISTS "Participants mark read" ON public.messages;

CREATE POLICY "Recipient marks message read"
ON public.messages FOR UPDATE TO authenticated
USING (
  sender_id <> auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
)
WITH CHECK (
  sender_id <> auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);

CREATE OR REPLACE FUNCTION public.messages_guard_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.body IS DISTINCT FROM OLD.body
     OR NEW.sender_id IS DISTINCT FROM OLD.sender_id
     OR NEW.conversation_id IS DISTINCT FROM OLD.conversation_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Only read_at can be updated on messages';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS messages_guard_update ON public.messages;
CREATE TRIGGER messages_guard_update
BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.messages_guard_update();

-- Conversations: participants may only touch last_message/updated_at
CREATE OR REPLACE FUNCTION public.conversations_guard_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.buyer_id IS DISTINCT FROM OLD.buyer_id
     OR NEW.seller_id IS DISTINCT FROM OLD.seller_id
     OR NEW.car_id IS DISTINCT FROM OLD.car_id
     OR NEW.dealer_id IS DISTINCT FROM OLD.dealer_id THEN
    RAISE EXCEPTION 'Conversation participants cannot be changed';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS conversations_guard_update ON public.conversations;
CREATE TRIGGER conversations_guard_update
BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.conversations_guard_update();

-- 2. DEALER REVIEWS: one review per user per dealer
DELETE FROM public.dealer_reviews a
USING public.dealer_reviews b
WHERE a.dealer_id = b.dealer_id
  AND a.user_id = b.user_id
  AND a.ctid > b.ctid;

ALTER TABLE public.dealer_reviews
  DROP CONSTRAINT IF EXISTS dealer_reviews_unique_user;
ALTER TABLE public.dealer_reviews
  ADD CONSTRAINT dealer_reviews_unique_user UNIQUE (dealer_id, user_id);

ALTER TABLE public.dealer_reviews
  DROP CONSTRAINT IF EXISTS dealer_reviews_rating_range;
ALTER TABLE public.dealer_reviews
  ADD CONSTRAINT dealer_reviews_rating_range CHECK (rating BETWEEN 1 AND 5);

-- 3. CAR VIEWS: no direct inserts, use a rate-limited security definer function
DROP POLICY IF EXISTS "Anyone can register a car view" ON public.car_views;
REVOKE INSERT ON public.car_views FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.register_car_view(_car_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _viewer uuid := auth.uid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.cars c WHERE c.id = _car_id AND c.is_published = true) THEN
    RETURN;
  END IF;

  IF _viewer IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.car_views v
    WHERE v.car_id = _car_id AND v.viewer_id = _viewer
      AND v.created_at > now() - interval '10 minutes'
  ) THEN
    RETURN;
  END IF;

  INSERT INTO public.car_views (car_id, viewer_id) VALUES (_car_id, _viewer);
END; $$;

GRANT EXECUTE ON FUNCTION public.register_car_view(uuid) TO anon, authenticated;

-- 4. FAVORITES
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  car_id uuid NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, car_id)
);

GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own favorites" ON public.favorites
FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users add own favorites" ON public.favorites
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users remove own favorites" ON public.favorites
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 5. PAYMENTS
DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('pending','paid','failed','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id uuid REFERENCES public.requests(id) ON DELETE SET NULL,
  car_id uuid REFERENCES public.cars(id) ON DELETE SET NULL,
  purpose text NOT NULL DEFAULT 'delivery',
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'KZT',
  status public.payment_status NOT NULL DEFAULT 'pending',
  provider text NOT NULL DEFAULT 'mock',
  provider_ref text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own payments" ON public.payments
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users create own payments" ON public.payments
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage payments" ON public.payments
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS payments_set_updated_at ON public.payments;
CREATE TRIGGER payments_set_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. SHIPMENTS (delivery tracking)
DO $$ BEGIN
  CREATE TYPE public.shipment_status AS ENUM ('created','paid','preparing','in_transit','arrived','delivered','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id uuid REFERENCES public.requests(id) ON DELETE SET NULL,
  car_id uuid REFERENCES public.cars(id) ON DELETE SET NULL,
  payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  tariff text NOT NULL DEFAULT 'standard',
  from_city text NOT NULL DEFAULT '',
  to_city text NOT NULL DEFAULT '',
  distance_km integer NOT NULL DEFAULT 0,
  price integer NOT NULL DEFAULT 0,
  status public.shipment_status NOT NULL DEFAULT 'created',
  eta_date date,
  courier_name text NOT NULL DEFAULT '',
  courier_phone text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.shipments TO authenticated;
GRANT ALL ON public.shipments TO service_role;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own shipments" ON public.shipments
FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
  OR (car_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.cars c WHERE c.id = shipments.car_id AND c.owner_id = auth.uid()
  ))
);
CREATE POLICY "Users create own shipments" ON public.shipments
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff update shipments" ON public.shipments
FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (car_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.cars c WHERE c.id = shipments.car_id AND c.owner_id = auth.uid()
  ))
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (car_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.cars c WHERE c.id = shipments.car_id AND c.owner_id = auth.uid()
  ))
);

DROP TRIGGER IF EXISTS shipments_set_updated_at ON public.shipments;
CREATE TRIGGER shipments_set_updated_at
BEFORE UPDATE ON public.shipments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_shipments_user ON public.shipments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_car_views_car ON public.car_views(car_id);