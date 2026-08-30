ALTER TABLE public.dealers ADD COLUMN IF NOT EXISTS lat double precision, ADD COLUMN IF NOT EXISTS lng double precision;
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'available';
ALTER TABLE public.cars DROP CONSTRAINT IF EXISTS cars_status_check;
ALTER TABLE public.cars ADD CONSTRAINT cars_status_check CHECK (status IN ('available','reserved','sold'));
UPDATE public.dealers d SET lat = c.lat, lng = c.lng
FROM (VALUES
  ('Алматы',43.2389,76.8897),('Almaty',43.2389,76.8897),
  ('Астана',51.1605,71.4704),('Astana',51.1605,71.4704),('Нур-Султан',51.1605,71.4704),
  ('Шымкент',42.3417,69.5901),('Shymkent',42.3417,69.5901),
  ('Караганда',49.8047,73.1094),('Қарағанды',49.8047,73.1094),
  ('Актобе',50.2839,57.1670),('Ақтөбе',50.2839,57.1670),
  ('Атырау',47.0945,51.9238),('Тараз',42.9000,71.3667),
  ('Павлодар',52.2871,76.9674),('Өскемен',49.9787,82.6014),('Усть-Каменогорск',49.9787,82.6014),
  ('Костанай',53.2144,63.6246),('Қостанай',53.2144,63.6246),('Семей',50.4111,80.2275)
) AS c(city, lat, lng)
WHERE d.lat IS NULL AND lower(d.city) = lower(c.city);