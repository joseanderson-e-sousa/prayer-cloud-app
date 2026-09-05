begin;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  church_id uuid not null references public.churches(id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.churches enable row level security;
alter table public.prayer_requests enable row level security;

-- Substitui TODAS as policies dessas três tabelas. Policies permissivas são
-- combinadas com OR: uma antiga regra pública poderia quebrar o isolamento.
-- Execute após mvp-policies.sql; não reaplique políticas antigas depois deste SQL.
do $$
declare p record;
begin
  for p in select tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'churches', 'prayer_requests')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end;
$$;

-- Remove também grants de coluna anteriores: revogar só na tabela não basta.
revoke all privileges on public.profiles, public.churches, public.prayer_requests
  from public, anon, authenticated;
do $$
declare c record;
begin
  for c in select table_name, column_name from information_schema.columns
    where table_schema = 'public'
      and table_name in ('profiles', 'churches', 'prayer_requests')
  loop
    execute format(
      'revoke select (%1$I), insert (%1$I), update (%1$I), references (%1$I) on public.%2$I from public, anon, authenticated',
      c.column_name, c.table_name
    );
  end loop;
end;
$$;

grant select on public.profiles to authenticated;
create policy "admin_read_own_profile" on public.profiles
  for select to authenticated using (user_id = (select auth.uid()));
-- Sem INSERT/UPDATE/DELETE para clientes: associação feita somente pelo operador.

grant select (id, name, slug) on public.churches to anon, authenticated;
create policy "public_read_churches" on public.churches
  for select to anon using (true);
create policy "admin_read_own_church" on public.churches
  for select to authenticated using (
    id = (select church_id from public.profiles where user_id = (select auth.uid()))
  );

grant select on public.prayer_requests to anon, authenticated;
grant insert (name, church_id, status) on public.prayer_requests to anon;
grant update (status) on public.prayer_requests to authenticated;

create policy "public_read_active_prayers" on public.prayer_requests
  for select to anon using (status = 'active');
create policy "public_insert_active_prayers" on public.prayer_requests
  for insert to anon with check (
    status = 'active'
    and name is not null and name ~ '[^[:space:]]'
    and exists (select 1 from public.churches where churches.id = prayer_requests.church_id)
  );

create policy "admin_read_own_prayers" on public.prayer_requests
  for select to authenticated using (
    church_id = (
      select church_id
      from public.profiles
      where user_id = (select auth.uid())
        and role = 'admin'
    )
  );

create policy "admin_archive_own_prayers" on public.prayer_requests
  for update to authenticated
  using (
    status = 'active'
    and church_id = (
      select church_id
      from public.profiles
      where user_id = (select auth.uid())
        and role = 'admin'
    )
  )
  with check (
    status = 'archived'
    and church_id = (
      select church_id
      from public.profiles
      where user_id = (select auth.uid())
        and role = 'admin'
    )
  );
  
-- Preserva a publicação Realtime configurada por mvp-policies.sql.
commit;

-- Primeiro pastor: Authentication > Users > Add user > Create new user.
-- Defina email/senha e confirme o email. Copie o ID real do usuário criado.
-- Consulte as igrejas existentes: select id, name, slug from public.churches;
-- Substitua os marcadores abaixo pelos IDs REAIS antes de executar:
-- insert into public.profiles (user_id, church_id)
-- values ('<ID_DO_USUARIO_AUTH>'::uuid, '<ID_DA_IGREJA>'::uuid);
