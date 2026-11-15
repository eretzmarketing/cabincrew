-- Cabin Crew · 0064 · Análise de currículo com IA (estilo ATS)
--   • o aluno do Head Hunter envia o currículo (PDF ou Word) e recebe nota, critérios e sugestões
--   • o arquivo é lido e descartado na hora: aqui fica só o resultado
--   • limite por compra do Head Hunter (Admin › Configurações › Inteligência artificial) e liberação extra na ficha do aluno
-- Rode depois do 0063. Pode rodar mais de uma vez.

create table if not exists curriculo_analises (
  id         bigserial primary key,
  user_id    uuid not null references profiles(id) on delete cascade,
  nota       smallint not null check (nota between 0 and 100),
  ia         jsonb not null,
  arquivo    text,
  companhia  text,
  created_at timestamptz not null default now()
);
create index if not exists curriculo_analises_user on curriculo_analises (user_id, created_at desc);
alter table curriculo_analises enable row level security;
drop policy if exists "curriculo: dono ou admin" on curriculo_analises;
create policy "curriculo: dono ou admin" on curriculo_analises for select to authenticated using (user_id = auth.uid() or is_admin());
grant select on curriculo_analises to authenticated;

-- Só o servidor do site grava (com a chave): o aluno não consegue inventar a nota
create or replace function curriculo_ia_registrar(p_chave text, p_user uuid, p_nota integer, p_ia jsonb, p_arquivo text, p_companhia text)
returns bigint language plpgsql security definer set search_path = public as $$
declare v_id bigint;
begin
  perform _confere_chave(p_chave);
  insert into curriculo_analises (user_id, nota, ia, arquivo, companhia)
  values (p_user, greatest(0, least(100, p_nota)), p_ia, left(p_arquivo, 120), left(p_companhia, 40))
  returning id into v_id;
  return v_id;
end $$;
revoke all on function curriculo_ia_registrar(text, uuid, integer, jsonb, text, text) from public;
grant execute on function curriculo_ia_registrar(text, uuid, integer, jsonb, text, text) to anon, authenticated;

-- Liberações extras: a mesma tabela do vídeo, separadas por recurso
alter table video_ia_liberacoes add column if not exists recurso text not null default 'video';
do $$ begin
  alter table video_ia_liberacoes add constraint video_ia_liberacoes_recurso check (recurso in ('video', 'curriculo'));
exception when duplicate_object then null; end $$;

create or replace function video_ia_uso(p_user uuid default auth.uid())
returns table (usadas integer, extras integer, desde timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare v_desde timestamptz;
begin
  if p_user is null or (p_user <> auth.uid() and not is_admin()) then raise exception 'sem permissão' using errcode = 'P0001'; end if;
  select a.liberado_em into v_desde from acessos a where a.user_id = p_user and a.produto = 'head-hunter';
  v_desde := coalesce(v_desde, '-infinity'::timestamptz);
  return query select
    (select count(*)::int from video_treinos where user_id = p_user and nota_ia is not null and created_at >= v_desde),
    (select coalesce(sum(qtd), 0)::int from video_ia_liberacoes where user_id = p_user and recurso = 'video' and criado_em >= v_desde),
    v_desde;
end $$;

create or replace function curriculo_ia_uso(p_user uuid default auth.uid())
returns table (usadas integer, extras integer, desde timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare v_desde timestamptz;
begin
  if p_user is null or (p_user <> auth.uid() and not is_admin()) then raise exception 'sem permissão' using errcode = 'P0001'; end if;
  select a.liberado_em into v_desde from acessos a where a.user_id = p_user and a.produto = 'head-hunter';
  v_desde := coalesce(v_desde, '-infinity'::timestamptz);
  return query select
    (select count(*)::int from curriculo_analises where user_id = p_user and created_at >= v_desde),
    (select coalesce(sum(qtd), 0)::int from video_ia_liberacoes where user_id = p_user and recurso = 'curriculo' and criado_em >= v_desde),
    v_desde;
end $$;
revoke all on function curriculo_ia_uso(uuid) from public, anon;
grant execute on function curriculo_ia_uso(uuid) to authenticated;

create or replace function curriculo_ia_liberar(p_user uuid, p_qtd integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform _exige_admin();
  if p_qtd not between 1 and 20 then raise exception 'quantidade inválida' using errcode = 'P0001'; end if;
  insert into video_ia_liberacoes (user_id, qtd, liberado_por, recurso) values (p_user, p_qtd, auth.uid(), 'curriculo');
end $$;
revoke all on function curriculo_ia_liberar(uuid, integer) from public, anon;
grant execute on function curriculo_ia_liberar(uuid, integer) to authenticated;

notify pgrst, 'reload schema';
select 'análise de currículo pronta' as status;
