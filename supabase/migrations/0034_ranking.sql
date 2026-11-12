-- Cabin Crew · 0034 · Ranking semanal do Head Hunter
-- Pontos da semana (segunda a domingo, horário de Brasília), calculados do que o aluno já faz:
--   aula concluída ............................ 10
--   aula do Inglês a bordo concluída ........... 10
--   treino (10 questões) ....................... 5  (+5 com nota 80% ou mais)
--   simulado no modo Prova real ................ 20 (+10 com nota 80% ou mais)
--   sessão do perfil comportamental ............ 10
--   vídeo de apresentação avaliado ............. 10 (+5 com nota 80% ou mais)
-- Limite de 150 pontos por dia: o ranking premia constância, e não maratona.
-- O ranking mostra só o apelido. Quem não quiser aparecer pode se esconder na página do ranking.
-- Pode rodar mais de uma vez.

alter table profiles add column if not exists ranking_oculto boolean not null default false;

-- Pontos de todos os alunos num intervalo. Uso interno (não é exposta aos alunos).
create or replace function pontos_periodo(p_inicio timestamptz, p_fim timestamptz)
returns table (user_id uuid, pontos integer)
language sql stable security definer set search_path = public as $$
  with ev as (
    select pr.user_id, 10 as p, pr.concluida_em as em
      from progresso pr where pr.concluida_em >= p_inicio and pr.concluida_em < p_fim
    union all
    select ip.user_id, 10, ip.updated_at
      from ingles_progresso ip where ip.concluida and ip.updated_at >= p_inicio and ip.updated_at < p_fim
    union all
    select t.user_id,
           case when s.origem like 'cc-treino-%' then 5 + case when t.nota >= 80 then 5 else 0 end
                else 20 + case when t.nota >= 80 then 10 else 0 end end,
           t.finalizada_em
      from tentativas t join simulados s on s.id = t.simulado_id
     where t.finalizada_em >= p_inicio and t.finalizada_em < p_fim
    union all
    select o.user_id, 10, o.created_at
      from opq_tentativas o where o.created_at >= p_inicio and o.created_at < p_fim
    union all
    select v.user_id, 10 + case when v.nota >= 80 then 5 else 0 end, v.created_at
      from video_treinos v where v.created_at >= p_inicio and v.created_at < p_fim
  ), por_dia as (
    select ev.user_id, least(150, sum(ev.p)) as p
      from ev group by ev.user_id, (ev.em at time zone 'America/Sao_Paulo')::date
  )
  select por_dia.user_id, sum(por_dia.p)::int from por_dia group by por_dia.user_id;
$$;
revoke all on function pontos_periodo(timestamptz, timestamptz) from public, anon, authenticated;

-- Ranking da semana: top 20 + a posição de quem está vendo.
-- p_semanas_atras = 0 (semana atual) ou 1 (semana passada).
create or replace function ranking_semana(p_semanas_atras integer default 0)
returns table (posicao integer, apelido text, pontos integer, eu boolean)
language sql stable security definer set search_path = public as $$
  with semana as (
    select date_trunc('week', now() at time zone 'America/Sao_Paulo')
           - make_interval(weeks => greatest(0, least(coalesce(p_semanas_atras, 0), 1))) as ini
  ), pts as (
    select ps.* from semana,
      pontos_periodo(semana.ini at time zone 'America/Sao_Paulo', (semana.ini + interval '7 days') at time zone 'America/Sao_Paulo') ps
  ), r as (
    select p.id, p.apelido, pts.pontos, rank() over (order by pts.pontos desc) as pos
      from pts join profiles p on p.id = pts.user_id
     where pts.pontos > 0 and not p.is_admin and not coalesce(p.bloqueado, false)
       and (not p.ranking_oculto or p.id = auth.uid())
  )
  select r.pos::int, r.apelido, r.pontos, r.id = auth.uid()
    from r where r.pos <= 20 or r.id = auth.uid()
   order by r.pos, r.apelido;
$$;
revoke all on function ranking_semana(integer) from public, anon;
grant execute on function ranking_semana(integer) to authenticated;

-- O aluno escolhe se aparece no ranking.
create or replace function definir_ranking_oculto(p_oculto boolean)
returns void language sql security definer set search_path = public as $$
  update profiles set ranking_oculto = coalesce(p_oculto, false) where id = auth.uid();
$$;
revoke all on function definir_ranking_oculto(boolean) from public, anon;
grant execute on function definir_ranking_oculto(boolean) to authenticated;

select 'ranking pronto' as status;
