-- Cabin Crew · 0072 · Acompanhamento dos alunos por curso (Admin › Usuários › Acompanhamento)
--   Para cada curso: quem tem (ou teve) acesso ou já estudou nele, quantas aulas concluiu,
--   a última atividade NAQUELE curso e quantos dias estudou nas últimas 2 semanas.
-- Pode rodar mais de uma vez.

create or replace function admin_acompanhamento(p_curso text, p_busca text default '')
returns table (
  id uuid, nome text, apelido text, email text, whatsapp text, cadastro timestamptz, bloqueado boolean, avatar_em timestamptz,
  acesso_status text, acesso_expira timestamptz, feitas integer, media integer, ultima timestamptz, dias_14 integer, total_aulas integer
)
language plpgsql stable security definer set search_path = public, auth as $$
declare
  b text := '%' || lower(trim(coalesce(p_busca, ''))) || '%';
  v_total int;
begin
  perform _exige_admin();
  -- aulas publicadas do curso (Head Hunter e cursos novos); nos idiomas o total é calculado no site
  select count(*)::int into v_total from aulas a where a.curso = p_curso and a.publicado;

  return query
  with ev as (   -- momentos de estudo NESTE curso
    select pr.user_id, pr.concluida_em as em from progresso pr join aulas a on a.id = pr.aula_id
     where a.curso = p_curso
    union all select ip.user_id, ip.updated_at from ingles_progresso ip where p_curso = 'english'
    union all select ep.user_id, ep.updated_at from espanhol_progresso ep where p_curso = 'spanish'
    -- Head Hunter: simulados e treinos (fora os Simulados ANAC grátis), perfil comportamental e vídeo
    union all select t.user_id, coalesce(t.finalizada_em, t.iniciada_em) from tentativas t join simulados s on s.id = t.simulado_id
     where p_curso = 'head-hunter' and coalesce(s.origem, '') not like 'cc-anac%' and coalesce(s.origem, '') <> 'cc-favoritas'
    union all select o.user_id, o.created_at from opq_tentativas o where p_curso = 'head-hunter'
    union all select v.user_id, v.created_at from video_treinos v where p_curso = 'head-hunter'
  ),
  atv as (
    select ev.user_id, max(ev.em) as ultima,
           count(distinct (ev.em at time zone 'America/Sao_Paulo')::date) filter (where ev.em > now() - interval '14 days')::int as dias_14
      from ev group by ev.user_id
  ),
  feito as (
    select pr.user_id, count(*)::int as n, null::int as m from progresso pr join aulas a on a.id = pr.aula_id
     where a.curso = p_curso and p_curso not in ('english', 'spanish') group by pr.user_id
    union all
    select ip.user_id, count(*) filter (where ip.concluida)::int, round(avg(ip.nota) filter (where ip.concluida))::int
      from ingles_progresso ip where p_curso = 'english' group by ip.user_id
    union all
    select ep.user_id, count(*) filter (where ep.concluida)::int, round(avg(ep.nota) filter (where ep.concluida))::int
      from espanhol_progresso ep where p_curso = 'spanish' group by ep.user_id
  ),
  quem as (   -- quem tem/teve acesso ao curso ou já estudou nele
    select ac.user_id from acessos ac where ac.produto = p_curso
    union select atv.user_id from atv
  )
  select p.id, p.nome, p.apelido, u.email::text, p.whatsapp, p.created_at, coalesce(p.bloqueado, false), p.avatar_em,
         ac.status, ac.expira_em, coalesce(feito.n, 0), feito.m, atv.ultima, coalesce(atv.dias_14, 0), v_total
    from quem
    join profiles p on p.id = quem.user_id
    left join auth.users u on u.id = p.id
    left join acessos ac on ac.user_id = p.id and ac.produto = p_curso
    left join atv on atv.user_id = p.id
    left join feito on feito.user_id = p.id
   where not p.is_admin
     and (coalesce(trim(p_busca), '') = ''
          or lower(coalesce(p.nome, '') || ' ' || coalesce(p.apelido, '') || ' ' || coalesce(u.email, '') || ' ' || coalesce(p.whatsapp, '')) like b)
   order by atv.ultima desc nulls last, p.created_at desc;
end $$;
revoke all on function admin_acompanhamento(text, text) from public, anon;
grant execute on function admin_acompanhamento(text, text) to authenticated;

notify pgrst, 'reload schema';
select 'acompanhamento por curso pronto' as status;
