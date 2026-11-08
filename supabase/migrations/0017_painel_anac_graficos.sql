-- Cabin Crew · 0017 · mais dados para os gráficos do painel Simulado ANAC
-- Substitui a função admin_anac_painel (mesmo nome, mais campos). Pode rodar mais de uma vez.

create or replace function admin_anac_painel() returns jsonb
language plpgsql stable security definer set search_path = public, auth as $$
declare r jsonb;
begin
  perform _exige_admin();
  with sims as (select id, origem, titulo, nota_minima from simulados where origem like 'cc-anac%'),
  todas as (  -- todas as tentativas da ANAC, de alunos (sem administradores)
    select t.*, s.nota_minima, s.origem
    from tentativas t join sims s on s.id = t.simulado_id join profiles p on p.id = t.user_id
    where not p.is_admin
  ),
  t as (select * from todas where finalizada_em is not null),
  resp as (
    select t.user_id, q.id as questao_id, coalesce(q.categoria, 'Sem matéria') as materia,
           (upper(t.respostas ->> qid::text) = q.correta) as certa
    from t, unnest(t.questoes) qid join questoes q on q.id = qid
  ),
  para_todos as (select coalesce((select valor = 'true'::jsonb from configuracoes where chave = 'anac_para_todos'), false) as v),
  elegiveis as (
    select p.id from profiles p
    where not p.is_admin and not p.bloqueado
      and ((select v from para_todos) or exists (select 1 from acessos_anac a where a.user_id = p.id))
  ),
  hoje as (select (now() at time zone 'America/Sao_Paulo')::date as d)
  select jsonb_build_object(
    'com_acesso', (select count(*) from acessos_anac a join profiles p on p.id = a.user_id where not p.bloqueado),
    'para_todos', (select v from para_todos),
    'elegiveis',  (select count(*) from elegiveis),
    'fizeram',    (select count(distinct user_id) from t),
    'ativos_7d',  (select count(distinct user_id) from todas where iniciada_em > now() - interval '7 days'),
    'em_andamento', (select count(*) from todas where finalizada_em is null and (prazo is null or prazo > now())),
    'tentativas', (select count(*) from t),
    'media',      (select round(avg(nota)) from t),
    'aprovacao',  (select round(100.0 * count(*) filter (where nota >= nota_minima) / nullif(count(*), 0)) from t),
    'tempo_questao', (select round(sum(extract(epoch from finalizada_em - iniciada_em)) / nullif(sum(total), 0)) from t),

    -- últimos 7 dias x 7 dias anteriores
    'semana', jsonb_build_object(
      'entregues',      (select count(*) from t where finalizada_em > now() - interval '7 days'),
      'entregues_ant',  (select count(*) from t where finalizada_em between now() - interval '14 days' and now() - interval '7 days'),
      'media',          (select round(avg(nota)) from t where finalizada_em > now() - interval '7 days'),
      'media_ant',      (select round(avg(nota)) from t where finalizada_em between now() - interval '14 days' and now() - interval '7 days'),
      'alunos',         (select count(distinct user_id) from todas where iniciada_em > now() - interval '7 days'),
      'alunos_ant',     (select count(distinct user_id) from todas where iniciada_em between now() - interval '14 days' and now() - interval '7 days')
    ),

    -- simulados entregues e média por dia (últimos 30 dias, inclusive dias sem nada)
    'por_dia', (
      select jsonb_agg(jsonb_build_object('dia', g.d, 'entregues', coalesce(x.n, 0), 'media', x.m) order by g.d)
      from generate_series((select d from hoje) - 29, (select d from hoje), interval '1 day') g(d)
      left join (
        select (finalizada_em at time zone 'America/Sao_Paulo')::date as d, count(*) as n, round(avg(nota)) as m
        from t group by 1
      ) x on x.d = g.d::date
    ),

    -- média semanal (últimas 12 semanas)
    'semanas', (
      select jsonb_agg(jsonb_build_object('semana', g.s, 'entregues', coalesce(x.n, 0), 'media', x.m) order by g.s)
      from generate_series(date_trunc('week', now() at time zone 'America/Sao_Paulo')::date - 77,
                           date_trunc('week', now() at time zone 'America/Sao_Paulo')::date, interval '7 days') g(s)
      left join (
        select date_trunc('week', finalizada_em at time zone 'America/Sao_Paulo')::date as s, count(*) as n, round(avg(nota)) as m
        from t group by 1
      ) x on x.s = g.s::date
    ),

    -- quantas tentativas em cada faixa de nota (0–9, 10–19 … 90–100)
    'distribuicao', (
      select jsonb_agg(jsonb_build_object('faixa', b, 'n', coalesce(x.n, 0)) order by b)
      from generate_series(0, 9) b
      left join (select least(nota / 10, 9) as f, count(*) as n from t group by 1) x on x.f = b
    ),

    -- funil: podem fazer → começaram → entregaram → passaram pelo menos uma vez
    'funil', jsonb_build_object(
      'elegiveis',  (select count(*) from elegiveis),
      'comecaram',  (select count(distinct user_id) from todas),
      'entregaram', (select count(distinct user_id) from t),
      'aprovados',  (select count(distinct user_id) from t where nota >= nota_minima)
    ),

    -- cada simulado (blocos e prova completa)
    'por_simulado', coalesce((
      select jsonb_agg(x order by x.origem) from (
        select s.origem, s.titulo,
               count(a.id) as iniciadas,
               count(a.id) filter (where a.finalizada_em is not null) as entregues,
               count(a.id) filter (where a.finalizada_em is null and a.prazo is not null and a.prazo < now()) as abandonadas,
               round(avg(a.nota) filter (where a.finalizada_em is not null)) as media,
               round(100.0 * count(a.id) filter (where a.finalizada_em is not null and a.nota >= s.nota_minima)
                     / nullif(count(a.id) filter (where a.finalizada_em is not null), 0)) as aprovacao,
               round(avg(extract(epoch from a.finalizada_em - a.iniciada_em)) filter (where a.finalizada_em is not null) / 60) as minutos
        from sims s left join todas a on a.simulado_id = s.id
        group by s.origem, s.titulo
      ) x), '[]'::jsonb),

    'top10', coalesce((
      select jsonb_agg(x order by x.media desc, x.tentativas desc) from (
        select t.user_id as id, coalesce(p.nome, p.apelido) as nome, u.email,
               count(*) as tentativas, round(avg(t.nota)) as media, max(t.nota) as melhor, max(t.finalizada_em) as ultima,
               -- tendência: média das 3 últimas menos a média das anteriores
               round(avg(t.nota) filter (where t.rn <= 3) - avg(t.nota) filter (where t.rn > 3)) as tendencia
        from (select *, row_number() over (partition by user_id order by finalizada_em desc) as rn from t) t
        join profiles p on p.id = t.user_id left join auth.users u on u.id = t.user_id
        group by t.user_id, p.nome, p.apelido, u.email
        order by round(avg(t.nota)) desc, count(*) desc
        limit 10
      ) x), '[]'::jsonb),

    -- quem precisa de atenção: média baixa (2+ simulados) ou com acesso e parado há 14+ dias
    'atencao', coalesce((
      select jsonb_agg(x order by x.motivo, x.media nulls first) from (
        select p.id, coalesce(p.nome, p.apelido) as nome, p.whatsapp, st.n as tentativas, st.m as media, st.u as ultima,
               case when st.n is null then 'nunca fez'
                    when st.m < 50 and st.n >= 2 then 'média baixa'
                    else 'parado' end as motivo
        from elegiveis e join profiles p on p.id = e.id
        left join (select user_id, count(*) as n, round(avg(nota)) as m, max(finalizada_em) as u from t group by user_id) st on st.user_id = p.id
        where (st.n >= 2 and st.m < 50)
           or (st.u < now() - interval '14 days')
           or (st.n is null and p.created_at < now() - interval '7 days')
        limit 12
      ) x), '[]'::jsonb),

    'materias', coalesce((
      select jsonb_agg(x order by x.pct desc) from (
        select materia, count(*) as respondidas, count(*) filter (where certa) as acertos,
               round(100.0 * count(*) filter (where certa) / count(*)) as pct
        from resp group by materia
      ) x), '[]'::jsonb),

    'dificeis', coalesce((
      select jsonb_agg(x order by x.pct, x.respondidas desc) from (
        select r.questao_id as id, q.enunciado, r.materia, count(*) as respondidas,
               round(100.0 * count(*) filter (where r.certa) / count(*)) as pct
        from resp r join questoes q on q.id = r.questao_id
        group by r.questao_id, q.enunciado, r.materia
        having count(*) >= 3
        order by round(100.0 * count(*) filter (where r.certa) / count(*)), count(*) desc
        limit 10
      ) x), '[]'::jsonb)
  ) into r;
  return r;
end;
$$;

revoke all on function admin_anac_painel() from public, anon;
grant execute on function admin_anac_painel() to authenticated;
notify pgrst, 'reload schema';

select 'Gráficos do painel ANAC prontos' as status;
