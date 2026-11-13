-- Cabin Crew · 0045 · O curso Flight Attendant English é vendido à parte e não faz parte do Head Hunter
-- As aulas do curso de inglês deixam de contar pontos no ranking do Head Hunter
-- (os treinos de inglês e a Entrevista em inglês continuam no Head Hunter). Pode rodar mais de uma vez.

create or replace function pontos_periodo(p_inicio timestamptz, p_fim timestamptz)
returns table (user_id uuid, pontos integer)
language sql stable security definer set search_path = public as $$
  with ev as (
    select pr.user_id, 10 as p, pr.concluida_em as em
      from progresso pr where pr.concluida_em >= p_inicio and pr.concluida_em < p_fim
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

notify pgrst, 'reload schema';
select 'ranking do head hunter sem o curso de inglês' as status;
