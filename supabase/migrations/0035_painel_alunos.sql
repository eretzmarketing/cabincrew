-- Cabin Crew · 0035 · Painel de alunos do Head Hunter (admin)
-- Uma linha por aluno com o resumo do estudo: última atividade, dias ativos, aulas, treinos,
-- simulados, inglês, perfil, vídeo e pontos da semana. Só administradores podem chamar.
-- Pode rodar mais de uma vez.

create or replace function admin_hh_alunos(p_busca text default '', p_id uuid default null)
returns table (
  id uuid, nome text, apelido text, email text, whatsapp text, cadastro timestamptz, bloqueado boolean,
  companhia text, data_meta date, ultima timestamptz, dias_14 integer,
  aulas integer, treinos integer, media_treino_30 integer, provas integer, melhor_prova integer, media_prova integer,
  ingles integer, opq integer, melhor_video integer, pontos_semana integer
)
language plpgsql stable security definer set search_path = public, auth as $$
declare
  b text := '%' || lower(trim(coalesce(p_busca, ''))) || '%';
  ini timestamptz := date_trunc('week', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo';
begin
  perform _exige_admin();
  return query
  with ev as (   -- todos os momentos de estudo de cada aluno
    select pr.user_id, pr.concluida_em as em from progresso pr
    union all select t.user_id, coalesce(t.finalizada_em, t.iniciada_em) from tentativas t
    union all select ip.user_id, ip.updated_at from ingles_progresso ip
    union all select o.user_id, o.created_at from opq_tentativas o
    union all select v.user_id, v.created_at from video_treinos v
  ),
  atv as (
    select ev.user_id, max(ev.em) as ultima,
           count(distinct (ev.em at time zone 'America/Sao_Paulo')::date)
             filter (where ev.em > now() - interval '14 days')::int as dias_14
    from ev group by ev.user_id
  ),
  au as (select pr.user_id, count(*)::int as n from progresso pr group by pr.user_id),
  tt as (
    select t.user_id,
           count(*) filter (where s.origem like 'cc-treino-%')::int as treinos,
           round(avg(t.nota) filter (where s.origem like 'cc-treino-%' and t.finalizada_em > now() - interval '30 days'))::int as media_treino_30,
           count(*) filter (where s.origem is null or s.origem not like 'cc-treino-%')::int as provas,
           max(t.nota) filter (where s.origem is null or s.origem not like 'cc-treino-%')::int as melhor_prova,
           round(avg(t.nota) filter (where s.origem is null or s.origem not like 'cc-treino-%'))::int as media_prova
    from tentativas t join simulados s on s.id = t.simulado_id
    where t.finalizada_em is not null and t.nota is not null
    group by t.user_id
  ),
  ing as (select ip.user_id, count(*) filter (where ip.concluida)::int as n from ingles_progresso ip group by ip.user_id),
  op as (select o.user_id, count(*)::int as n from opq_tentativas o group by o.user_id),
  vd as (select v.user_id, max(v.nota)::int as m from video_treinos v group by v.user_id),
  pts as (select * from pontos_periodo(ini, ini + interval '7 days'))
  select p.id, p.nome, p.apelido, u.email::text, p.whatsapp, p.created_at, coalesce(p.bloqueado, false),
         p.alvo_companhias[1], p.data_meta, atv.ultima, coalesce(atv.dias_14, 0),
         coalesce(au.n, 0), coalesce(tt.treinos, 0), tt.media_treino_30, coalesce(tt.provas, 0), tt.melhor_prova, tt.media_prova,
         coalesce(ing.n, 0), coalesce(op.n, 0), vd.m, coalesce(pts.pontos, 0)
  from profiles p
  left join auth.users u on u.id = p.id
  left join atv on atv.user_id = p.id
  left join au on au.user_id = p.id
  left join tt on tt.user_id = p.id
  left join ing on ing.user_id = p.id
  left join op on op.user_id = p.id
  left join vd on vd.user_id = p.id
  left join pts on pts.user_id = p.id
  where not p.is_admin
    and (p_id is null or p.id = p_id)
    and (coalesce(trim(p_busca), '') = ''
         or lower(coalesce(p.nome, '') || ' ' || coalesce(p.apelido, '') || ' ' || coalesce(u.email, '') || ' ' || coalesce(p.whatsapp, '')) like b)
  order by atv.ultima desc nulls last, p.created_at desc;
end $$;

revoke all on function admin_hh_alunos(text, uuid) from public, anon;
grant execute on function admin_hh_alunos(text, uuid) to authenticated;

notify pgrst, 'reload schema';
select 'painel de alunos pronto' as status;
