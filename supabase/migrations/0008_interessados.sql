-- Cabin Crew · 0008 · lista "Quero ser avisado(a) em primeira mão" da página Em breve
-- Pode rodar mais de uma vez.

create table if not exists interessados (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null check (char_length(nome) between 3 and 120),
  telefone   text not null unique check (telefone ~ '^\+[1-9][0-9]{7,14}$'),  -- formato internacional: +5511987654321
  pais       text not null default 'BR' check (pais ~ '^[A-Z]{2}$'),
  origem     text not null default 'em-breve',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table interessados enable row level security;
drop policy if exists "admin le interessados" on interessados;
create policy "admin le interessados" on interessados for select using (is_admin());
drop policy if exists "admin apaga interessados" on interessados;
create policy "admin apaga interessados" on interessados for delete using (is_admin());
grant select, delete on interessados to authenticated;

-- Visitantes não escrevem direto na tabela: só por esta função, que valida os dados.
-- Se o telefone já estiver na lista, só atualiza o nome (ninguém entra duas vezes).
create or replace function public.quero_ser_avisado(p_nome text, p_telefone text, p_pais text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  n text := regexp_replace(trim(coalesce(p_nome, '')), '\s+', ' ', 'g');
  t text := '+' || regexp_replace(coalesce(p_telefone, ''), '\D', '', 'g');
  pa text := upper(coalesce(nullif(trim(p_pais), ''), 'BR'));
begin
  if char_length(n) < 3 or char_length(n) > 120 then raise exception 'nome invalido'; end if;
  if t !~ '^\+[1-9][0-9]{7,14}$' then raise exception 'telefone invalido'; end if;
  if pa !~ '^[A-Z]{2}$' then pa := 'BR'; end if;

  insert into interessados (nome, telefone, pais)
  values (n, t, pa)
  on conflict (telefone) do update set nome = excluded.nome, pais = excluded.pais, updated_at = now();
  return true;
end;
$$;

revoke all on function public.quero_ser_avisado(text, text, text) from public;
grant execute on function public.quero_ser_avisado(text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';

select 'Lista de interessados pronta' as status, count(*) as inscritos from interessados;
