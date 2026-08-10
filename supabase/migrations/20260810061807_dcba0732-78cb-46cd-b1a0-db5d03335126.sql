
CREATE TABLE public.dealers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text unique,
  city text not null default '',
  address text not null default '',
  phone text not null default '',
  about text not null default '',
  logo_url text,
  cover_url text,
  hours text not null default '09:00-19:00',
  is_verified boolean not null default false,
  is_blocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id)
);
GRANT SELECT ON public.dealers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dealers TO authenticated;
GRANT ALL ON public.dealers TO service_role;
ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active salons" ON public.dealers FOR SELECT TO anon, authenticated USING (is_blocked = false);
CREATE POLICY "Owners can view their salon" ON public.dealers FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Dealers can create their salon" ON public.dealers FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id AND public.has_role(auth.uid(), 'dealer'));
CREATE POLICY "Dealers can update their salon" ON public.dealers FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Admins manage salons" ON public.dealers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER dealers_updated_at BEFORE UPDATE ON public.dealers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.cars ADD COLUMN dealer_id uuid REFERENCES public.dealers(id) ON DELETE SET NULL;
CREATE INDEX cars_dealer_id_idx ON public.cars(dealer_id);

CREATE TABLE public.dealer_reviews (
  id uuid primary key default gen_random_uuid(),
  dealer_id uuid not null references public.dealers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  unique (dealer_id, user_id)
);
GRANT SELECT ON public.dealer_reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dealer_reviews TO authenticated;
GRANT ALL ON public.dealer_reviews TO service_role;
ALTER TABLE public.dealer_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read reviews" ON public.dealer_reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users write own review" ON public.dealer_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own review" ON public.dealer_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own review" ON public.dealer_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.conversations (
  id uuid primary key default gen_random_uuid(),
  car_id uuid references public.cars(id) on delete set null,
  dealer_id uuid references public.dealers(id) on delete set null,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  last_message text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (car_id, buyer_id)
);
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read conversations" ON public.conversations FOR SELECT TO authenticated USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Buyers start conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Participants update conversations" ON public.conversations FOR UPDATE TO authenticated USING (auth.uid() = buyer_id OR auth.uid() = seller_id) WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE TABLE public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
CREATE INDEX messages_conversation_idx ON public.messages(conversation_id, created_at);
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read messages" ON public.messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));
CREATE POLICY "Participants send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())));
CREATE POLICY "Participants mark read" ON public.messages FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid()))) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

CREATE OR REPLACE FUNCTION public.touch_conversation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.conversations SET last_message = left(NEW.body, 160), updated_at = now() WHERE id = NEW.conversation_id;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.touch_conversation() FROM public, anon, authenticated;
CREATE TRIGGER messages_touch_conversation AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.touch_conversation();
