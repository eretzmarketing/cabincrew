-- Cabin Crew · 0040 · Campanhas de WhatsApp (modelos com imagem, público filtrado e envio com intervalo)
-- O envio é feito pelo painel do admin, uma mensagem por vez, respeitando o intervalo escolhido.
-- Pode rodar mais de uma vez.

create table if not exists whatsapp_templates (
  id         bigserial primary key,
  nome       text not null check (char_length(nome) between 2 and 80),
  texto      text not null check (char_length(texto) between 2 and 3000),
  imagem     text,                       -- caminho na pasta de mídia: imagens/whatsapp/<id>.jpg
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists whatsapp_campanhas (
  id            bigserial primary key,
  nome          text not null,
  texto         text not null,
  imagem        text,
  fonte         text not null check (fonte in ('alunos', 'interessados')),
  filtros       jsonb not null default '{}'::jsonb,
  intervalo_min integer not null check (intervalo_min between 5 and 3600),
  intervalo_max integer not null check (intervalo_max between 5 and 3600),
  status        text not null default 'pausada' check (status in ('enviando', 'pausada', 'concluida', 'cancelada')),
  total         integer not null default 0,
  ultimo_envio  timestamptz,
  criado_por    uuid,
  created_at    timestamptz not null default now()
);

create table if not exists whatsapp_campanha_envios (
  id          bigserial primary key,
  campanha_id bigint not null references whatsapp_campanhas(id) on delete cascade,
  user_id     uuid,
  nome        text,
  telefone    text not null,
  status      text not null default 'pendente' check (status in ('pendente', 'enviando', 'enviada', 'erro', 'sem_whatsapp')),
  erro        text,
  enviado_em  timestamptz
);
create unique index if not exists whatsapp_campanha_envios_unico on whatsapp_campanha_envios (campanha_id, telefone);
create index if not exists whatsapp_campanha_envios_fila on whatsapp_campanha_envios (campanha_id, status, id);

alter table whatsapp_templates enable row level security;
alter table whatsapp_campanhas enable row level security;
alter table whatsapp_campanha_envios enable row level security;
drop policy if exists "templates: admin" on whatsapp_templates;
create policy "templates: admin" on whatsapp_templates for all to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "campanhas: admin" on whatsapp_campanhas;
create policy "campanhas: admin" on whatsapp_campanhas for all to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "envios de campanha: admin" on whatsapp_campanha_envios;
create policy "envios de campanha: admin" on whatsapp_campanha_envios for all to authenticated using (is_admin()) with check (is_admin());
grant select, insert, update, delete on whatsapp_templates, whatsapp_campanhas, whatsapp_campanha_envios to authenticated;
grant usage on sequence whatsapp_templates_id_seq, whatsapp_campanhas_id_seq, whatsapp_campanha_envios_id_seq to authenticated;

-- Público para campanhas: alunos com os dados usados nos filtros
create or replace function admin_publico_campanha()
returns table (
  id uuid, nome text, email text, whatsapp text, escola text, cadastro timestamptz, bloqueado boolean,
  companhia text, ultima timestamptz, aulas integer, ingles integer, compras integer, produtos text[]
)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  perform _exige_admin();
  return query
  with ev as (
    select pr.user_id, pr.concluida_em as em from progresso pr
    union all select t.user_id, coalesce(t.finalizada_em, t.iniciada_em) from tentativas t
    union all select ip.user_id, ip.updated_at from ingles_progresso ip
    union all select o.user_id, o.created_at from opq_tentativas o
    union all select v.user_id, v.created_at from video_treinos v
  ),
  ult as (select ev.user_id, max(ev.em) as m from ev group by ev.user_id),
  au as (select pr.user_id, count(*)::int as n from progresso pr group by pr.user_id),
  ing as (select ip.user_id, count(*) filter (where ip.concluida)::int as n from ingles_progresso ip group by ip.user_id),
  cp as (select c.user_id, count(*)::int as n, array_agg(distinct c.produto) as prods from compras c where c.status = 'aprovada' and c.user_id is not null group by c.user_id)
  select p.id, coalesce(nullif(trim(p.nome), ''), p.apelido), u.email::text, p.whatsapp, p.escola, p.created_at, coalesce(p.bloqueado, false),
         p.alvo_companhias[1], ult.m, coalesce(au.n, 0), coalesce(ing.n, 0), coalesce(cp.n, 0), coalesce(cp.prods, '{}')
  from profiles p
  left join auth.users u on u.id = p.id
  left join ult on ult.user_id = p.id
  left join au on au.user_id = p.id
  left join ing on ing.user_id = p.id
  left join cp on cp.user_id = p.id
  where not p.is_admin
  order by p.created_at desc;
end $$;
revoke all on function admin_publico_campanha() from public, anon;
grant execute on function admin_publico_campanha() to authenticated;

-- Próxima mensagem da campanha. Respeita o intervalo mínimo mesmo com duas abas abertas.
-- Devolve: 'enviar' (com a mensagem reservada), 'aguardar' (segundos), 'fim' ou 'parada'.
create or replace function campanha_proximo(p_campanha bigint)
returns table (acao text, aguardar integer, envio_id bigint, nome text, telefone text)
language plpgsql security definer set search_path = public as $$
declare
  c whatsapp_campanhas;
  e whatsapp_campanha_envios;
  falta integer;
begin
  perform _exige_admin();
  select * into c from whatsapp_campanhas where id = p_campanha for update;
  if not found or c.status <> 'enviando' then return query select 'parada', 0, null::bigint, null, null; return; end if;
  if c.ultimo_envio is not null then
    falta := ceil(extract(epoch from (c.ultimo_envio + make_interval(secs => c.intervalo_min) - now())))::int;
    if falta > 0 then return query select 'aguardar', falta, null::bigint, null, null; return; end if;
  end if;
  -- mensagens presas em "enviando" há mais de 5 minutos voltam para a fila
  update whatsapp_campanha_envios set status = 'pendente'
   where campanha_id = p_campanha and status = 'enviando' and enviado_em < now() - interval '5 minutes';
  select * into e from whatsapp_campanha_envios
   where campanha_id = p_campanha and status = 'pendente' order by id limit 1 for update skip locked;
  if not found then
    if not exists (select 1 from whatsapp_campanha_envios where campanha_id = p_campanha and status = 'enviando') then
      update whatsapp_campanhas set status = 'concluida' where id = p_campanha;
    end if;
    return query select 'fim', 0, null::bigint, null, null; return;
  end if;
  update whatsapp_campanha_envios set status = 'enviando', enviado_em = now() where id = e.id;
  update whatsapp_campanhas set ultimo_envio = now() where id = p_campanha;
  return query select 'enviar', 0, e.id, e.nome, e.telefone;
end $$;
revoke all on function campanha_proximo(bigint) from public, anon;
grant execute on function campanha_proximo(bigint) to authenticated;

notify pgrst, 'reload schema';
select 'campanhas de whatsapp prontas' as status;
