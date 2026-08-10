create policy "Car photos viewable by anyone"
on storage.objects for select
using (bucket_id = 'car-photos');

create policy "Users upload own car photos"
on storage.objects for insert to authenticated
with check (bucket_id = 'car-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users update own car photos"
on storage.objects for update to authenticated
using (bucket_id = 'car-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users delete own car photos"
on storage.objects for delete to authenticated
using (bucket_id = 'car-photos' and (storage.foldername(name))[1] = auth.uid()::text);