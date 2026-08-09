
ALTER TABLE public.cars
  ADD COLUMN IF NOT EXISTS generation text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS trim text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS engine_volume numeric(3,1) NOT NULL DEFAULT 2.0,
  ADD COLUMN IF NOT EXISTS body_type text NOT NULL DEFAULT 'sedan',
  ADD COLUMN IF NOT EXISTS drive text NOT NULL DEFAULT 'front',
  ADD COLUMN IF NOT EXISTS color text NOT NULL DEFAULT 'white',
  ADD COLUMN IF NOT EXISTS steering text NOT NULL DEFAULT 'left',
  ADD COLUMN IF NOT EXISTS customs_cleared boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS condition text NOT NULL DEFAULT 'used',
  ADD COLUMN IF NOT EXISTS vin text;

UPDATE public.cars SET
  body_type = CASE lower(category)
    WHEN 'suv' THEN 'suv'
    WHEN 'hatchback' THEN 'hatchback'
    WHEN 'coupe' THEN 'coupe'
    ELSE 'sedan' END,
  drive = CASE lower(category) WHEN 'suv' THEN 'awd' ELSE 'front' END,
  engine_volume = CASE WHEN lower(fuel) = 'electric' THEN 0.0 ELSE 2.0 END,
  condition = CASE WHEN mileage < 1000 THEN 'new' ELSE 'used' END,
  trim = COALESCE(NULLIF(trim, ''), 'Comfort')
WHERE true;
