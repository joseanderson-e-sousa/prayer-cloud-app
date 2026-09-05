begin;

-- Leitura necessária para resolver o slug e validar a igreja no INSERT.
alter table public.churches enable row level security;
grant select (id, name, slug) on public.churches to anon;
drop policy if exists "mvp_public_read_churches" on public.churches;
create policy "mvp_public_read_churches"
on public.churches for select to anon using (true);

-- Substitui a policy anterior, que usava uma igreja fixa.
grant insert (name, church_id, status) on public.prayer_requests to anon;
revoke update, delete on public.prayer_requests from anon;
drop policy if exists "mvp_public_insert_active_prayers" on public.prayer_requests;
create policy "mvp_public_insert_active_prayers"
on public.prayer_requests
for insert
to anon
with check (
  status = 'active'
  and name is not null
  and name ~ '[^[:space:]]'
  and exists (
    select 1 from public.churches
    where churches.id = prayer_requests.church_id
  )
);

-- A policy SELECT existente de prayer_requests (somente active) é preservada.

-- Habilita Realtime somente se a tabela ainda não estiver na publicação.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'prayer_requests'
  ) then
    alter publication supabase_realtime add table public.prayer_requests;
  end if;
end;
$$;

commit;
