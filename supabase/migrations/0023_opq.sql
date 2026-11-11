-- Cabin Crew · 0023 · Perfil comportamental (estilo OPQ / SHL)
-- Afirmações em escala de concordância (1 a 5), cada uma ligada a um traço.
-- direcao  1 = concordar indica mais do traço
-- direcao -1 = concordar indica menos do traço
-- O aluno nunca vê a direção: o perfil é calculado no banco.
-- Pode rodar mais de uma vez.

create table if not exists opq_afirmacoes (
  id         uuid primary key default gen_random_uuid(),
  codigo     text unique not null,
  traco      text not null,
  direcao    smallint not null check (direcao in (1, -1)),
  texto      text not null,
  ativo      boolean not null default true,
  origem     text,
  created_at timestamptz not null default now()
);
create index if not exists opq_afirmacoes_traco on opq_afirmacoes (traco) where ativo;

create table if not exists opq_tentativas (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  respostas  jsonb not null,
  perfil     jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists opq_tentativas_user on opq_tentativas (user_id, created_at desc);

alter table opq_afirmacoes enable row level security;
alter table opq_tentativas enable row level security;

drop policy if exists "admin gerencia opq" on opq_afirmacoes;
create policy "admin gerencia opq" on opq_afirmacoes for all using (is_admin()) with check (is_admin());

drop policy if exists "aluno ve as proprias tentativas opq" on opq_tentativas;
create policy "aluno ve as proprias tentativas opq" on opq_tentativas
  for select to authenticated using (user_id = auth.uid() or is_admin());

grant select, insert, update, delete on opq_afirmacoes to authenticated;
grant select on opq_tentativas to authenticated;

-- Sorteia uma sessão equilibrada: 3 afirmações de cada traço (sempre pelo menos uma de cada direção).
create or replace function opq_sortear()
returns table (id uuid, texto text)
language sql volatile security definer set search_path = public as $$
  with base as (
    select a.id, a.texto, a.traco, a.direcao,
           row_number() over (partition by a.traco, a.direcao order by random()) as rn
    from opq_afirmacoes a
    where a.ativo
  ),
  escolhidas as (
    select b.id, b.texto, b.traco from base b where b.rn = 1
    union all
    select x.id, x.texto, x.traco from (
      select distinct on (b.traco) b.id, b.texto, b.traco
      from base b where b.rn = 2
      order by b.traco, random()
    ) x
  )
  select e.id, e.texto from escolhidas e
  where auth.uid() is not null
  order by random();
$$;
revoke all on function opq_sortear() from public, anon;
grant execute on function opq_sortear() to authenticated;

-- Recebe [{"id": "...", "v": 1..5}, ...], calcula o perfil, salva e devolve.
create or replace function opq_registrar(p_respostas jsonb)
returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_perfil jsonb;
  v_total int;
begin
  if v_user is null then raise exception 'login necessário'; end if;
  if jsonb_typeof(p_respostas) <> 'array' then raise exception 'respostas inválidas'; end if;

  with r as (
    select (e->>'id')::uuid as id, (e->>'v')::int as v
    from jsonb_array_elements(p_respostas) e
    where (e->>'v') ~ '^[1-5]$'
  ),
  j as (
    select a.traco, a.direcao, r.v,
           case when a.direcao = 1 then r.v else 6 - r.v end as pontos
    from r join opq_afirmacoes a on a.id = r.id
  ),
  t as (
    select traco,
           round((avg(pontos) - 1) / 4 * 100)::int as pontos,
           count(*)::int as n,
           -- incoerência: concordou (ou discordou) ao mesmo tempo de afirmações opostas do mesmo traço
           (bool_or(direcao = 1 and v >= 4) and bool_or(direcao = -1 and v >= 4))
             or (bool_or(direcao = 1 and v <= 2) and bool_or(direcao = -1 and v <= 2)) as incoerente
    from j group by traco
  )
  select jsonb_build_object(
           'tracos', coalesce(jsonb_agg(jsonb_build_object('traco', traco, 'pontos', pontos, 'n', n) order by traco), '[]'::jsonb),
           'incoerentes', coalesce(jsonb_agg(traco order by traco) filter (where incoerente), '[]'::jsonb),
           'extremos', (select round(100.0 * count(*) filter (where (direcao = 1 and v = 5) or (direcao = -1 and v = 1)) / nullif(count(*), 0))::int from j),
           'respondidas', (select count(*) from j)
         )
    into v_perfil
  from t;

  v_total := (v_perfil->>'respondidas')::int;
  if coalesce(v_total, 0) < 10 then raise exception 'responda pelo menos 10 afirmações'; end if;

  insert into opq_tentativas (user_id, respostas, perfil) values (v_user, p_respostas, v_perfil);
  return v_perfil;
end;
$$;
revoke all on function opq_registrar(jsonb) from public, anon;
grant execute on function opq_registrar(jsonb) to authenticated;

notify pgrst, 'reload schema';

select 'Perfil comportamental pronto. Agora rode o arquivo de afirmações (importacao/0024).' as status;
