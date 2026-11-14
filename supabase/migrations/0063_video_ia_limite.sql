-- Cabin Crew · 0063 · Limite de análises da IA no vídeo por compra do Head Hunter
--   • cada aluno tem um total de análises (definido em Admin › Configurações › Inteligência artificial, padrão 2)
--   • a conta recomeça se o aluno comprar o Head Hunter de novo
--   • o admin pode liberar análises extras na ficha do aluno
-- Rode depois do 0062. Pode rodar mais de uma vez.

create table if not exists video_ia_liberacoes (
  id           bigserial primary key,
  user_id      uuid not null references profiles(id) on delete cascade,
  qtd          smallint not null check (qtd between 1 and 20),
  liberado_por uuid references profiles(id) on delete set null,
  criado_em    timestamptz not null default now()
);
create index if not exists video_ia_liberacoes_user on video_ia_liberacoes (user_id, criado_em);
alter table video_ia_liberacoes enable row level security;
drop policy if exists "liberacoes: dono ou admin" on video_ia_liberacoes;
create policy "liberacoes: dono ou admin" on video_ia_liberacoes for select to authenticated using (user_id = auth.uid() or is_admin());
grant select on video_ia_liberacoes to authenticated;

-- Quantas análises o aluno usou e quantas extras ganhou, desde que o Head Hunter foi liberado
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
    (select coalesce(sum(qtd), 0)::int from video_ia_liberacoes where user_id = p_user and criado_em >= v_desde),
    v_desde;
end $$;
revoke all on function video_ia_uso(uuid) from public, anon;
grant execute on function video_ia_uso(uuid) to authenticated;

-- Admin libera mais análises para um aluno
create or replace function video_ia_liberar(p_user uuid, p_qtd integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform _exige_admin();
  if p_qtd not between 1 and 20 then raise exception 'quantidade inválida' using errcode = 'P0001'; end if;
  insert into video_ia_liberacoes (user_id, qtd, liberado_por) values (p_user, p_qtd, auth.uid());
end $$;
revoke all on function video_ia_liberar(uuid, integer) from public, anon;
grant execute on function video_ia_liberar(uuid, integer) to authenticated;

notify pgrst, 'reload schema';
select 'limite de análises da IA pronto' as status;
