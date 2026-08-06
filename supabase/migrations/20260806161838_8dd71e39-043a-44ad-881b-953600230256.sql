-- ROLES ---------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('admin', 'dealer', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PROFILES ------------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'phone', '')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CARS ----------------------------------------------------------------
CREATE TABLE public.cars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  brand text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  price integer NOT NULL,
  mileage integer NOT NULL DEFAULT 0,
  engine text NOT NULL DEFAULT '',
  fuel text NOT NULL DEFAULT 'Petrol',
  transmission text NOT NULL DEFAULT 'Automatic',
  category text NOT NULL DEFAULT 'Sedan',
  city text NOT NULL DEFAULT '',
  image_key text,
  image_url text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cars TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cars TO authenticated;
GRANT ALL ON public.cars TO service_role;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER cars_set_updated_at
  BEFORE UPDATE ON public.cars
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Anyone can view published cars"
  ON public.cars FOR SELECT TO anon, authenticated
  USING (is_published = true);
CREATE POLICY "Dealers can view their own cars"
  ON public.cars FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);
CREATE POLICY "Dealers can add cars"
  ON public.cars FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id AND public.has_role(auth.uid(), 'dealer'));
CREATE POLICY "Dealers can update their own cars"
  ON public.cars FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id AND public.has_role(auth.uid(), 'dealer'))
  WITH CHECK (auth.uid() = owner_id AND public.has_role(auth.uid(), 'dealer'));
CREATE POLICY "Dealers can delete their own cars"
  ON public.cars FOR DELETE TO authenticated
  USING (auth.uid() = owner_id AND public.has_role(auth.uid(), 'dealer'));
CREATE POLICY "Admins can manage all cars"
  ON public.cars FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- REQUESTS ------------------------------------------------------------
CREATE TYPE public.request_type AS ENUM ('credit', 'delivery', 'insurance');
CREATE TYPE public.request_status AS ENUM ('submitted', 'in_review', 'approved', 'rejected', 'completed');

CREATE TABLE public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  car_id uuid REFERENCES public.cars(id) ON DELETE SET NULL,
  type public.request_type NOT NULL,
  status public.request_status NOT NULL DEFAULT 'submitted',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.requests TO authenticated;
GRANT ALL ON public.requests TO service_role;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER requests_set_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Users can view their own requests"
  ON public.requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own requests"
  ON public.requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Dealers can view requests for their cars"
  ON public.requests FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'dealer')
    AND car_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.cars c WHERE c.id = requests.car_id AND c.owner_id = auth.uid())
  );
CREATE POLICY "Dealers can update requests for their cars"
  ON public.requests FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'dealer')
    AND car_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.cars c WHERE c.id = requests.car_id AND c.owner_id = auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'dealer')
    AND car_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.cars c WHERE c.id = requests.car_id AND c.owner_id = auth.uid())
  );
CREATE POLICY "Admins can manage all requests"
  ON public.requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- SEED CARS -----------------------------------------------------------
INSERT INTO public.cars (slug, brand, model, year, price, mileage, engine, fuel, transmission, category, city, image_key) VALUES
('aurora-ev', 'Aurora', 'EV Sedan', 2024, 32900, 4200, 'Electric 150 kW', 'Electric', 'Automatic', 'Electric', 'Almaty', 'sedan-white'),
('northline-x7', 'Northline', 'X7 Premium', 2023, 45500, 18900, '3.0L Turbo', 'Petrol', 'Automatic', 'SUV', 'Astana', 'suv-gray'),
('civo-compact', 'Civo', 'Compact', 2022, 15400, 36500, '1.5L', 'Petrol', 'Manual', 'Hatchback', 'Shymkent', 'hatch-blue'),
('lumen-coupe', 'Lumen', 'GT Coupe', 2024, 61200, 2100, '4.0L V8', 'Petrol', 'Automatic', 'Coupe', 'Almaty', 'coupe-black'),
('aurora-ev-long', 'Aurora', 'EV Long Range', 2025, 38900, 900, 'Electric 180 kW', 'Electric', 'Automatic', 'Electric', 'Astana', 'sedan-white'),
('northline-x5', 'Northline', 'X5 Comfort', 2021, 28700, 54300, '2.0L Turbo', 'Diesel', 'Automatic', 'SUV', 'Karaganda', 'suv-gray'),
('civo-sport', 'Civo', 'Sport Line', 2023, 19900, 12400, '1.8L', 'Petrol', 'Automatic', 'Hatchback', 'Almaty', 'hatch-blue'),
('lumen-sedan', 'Lumen', 'Executive', 2022, 41300, 27800, '3.0L', 'Petrol', 'Automatic', 'Sedan', 'Astana', 'coupe-black');