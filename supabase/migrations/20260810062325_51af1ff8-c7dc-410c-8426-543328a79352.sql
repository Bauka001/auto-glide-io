
INSERT INTO public.dealers (owner_id, name, slug, city, address, phone, about, hours, is_verified)
SELECT ur.user_id, 'AutoHub Almaty', 'autohub-almaty', 'Алматы', 'пр. Аль-Фараби 77', '+7 700 000 00 00',
       'Официальный партнёр AutoHub: проверенные автомобили, кредит, страхование и доставка по Казахстану.',
       '09:00-20:00', true
FROM public.user_roles ur
WHERE ur.role = 'dealer'
ORDER BY ur.created_at
LIMIT 1
ON CONFLICT (owner_id) DO NOTHING;

UPDATE public.cars c
SET dealer_id = d.id
FROM public.dealers d
WHERE c.dealer_id IS NULL AND (c.owner_id = d.owner_id OR c.owner_id IS NULL);
