-- Cabin Crew · 0073 · Painel "Questões que mais erram" (Admin › Simulados ANAC)
--   Conta as respostas dos alunos às questões da banca ANAC (simulados, treinos e favoritas):
--   taxa de erro por questão e por bloco, quantos alunos erraram e qual alternativa errada é a mais marcada.
--   Vale a resposta de prova entregue ou já corrigida na hora (gabarito imediato / treino). Administradores não contam.
-- Pode rodar mais de uma vez.

create or replace function admin_questoes_erros(
  p_bloco text default null, p_dias int default null, p_min int default 5, p_ordem text default 'taxa', p_limite int default 50
) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare v jsonb;
begin
  perform _exige_admin();
  with r as (   -- uma linha por resposta
    select t.user_id, q.id as questao_id, coalesce(nullif(q.categoria, ''), 'Sem bloco') as bloco,
           upper(t.respostas ->> q.id::text) as marcada, q.correta,
           coalesce(t.finalizada_em, t.iniciada_em) as em
      from tentativas t
      join profiles p on p.id = t.user_id and not p.is_admin
      cross join lateral unnest(t.questoes) qid
      join questoes q on q.id = qid and q.banco = 'anac'
     where t.respostas ? qid::text
       and (t.finalizada_em is not null or t.modo = 'treino' or t.gabarito_imediato)
       and (p_dias is null or coalesce(t.finalizada_em, t.iniciada_em) > now() - make_interval(days => p_dias))
  ),
  rb as (select * from r where p_bloco is null or bloco = p_bloco),
  por_q as (
    select questao_id, bloco, count(*)::int as respostas,
           count(*) filter (where marcada is distinct from correta)::int as erros,
           count(distinct user_id)::int as alunos,
           count(distinct user_id) filter (where marcada is distinct from correta)::int as alunos_erraram,
           max(em) as ultima
      from rb group by questao_id, bloco
  ),
  dist as (select questao_id, jsonb_object_agg(marcada, n) as d from (select questao_id, coalesce(marcada, '-') as marcada, count(*)::int as n from rb group by 1, 2) x group by questao_id),
  validas as (select * from por_q where respostas >= greatest(1, coalesce(p_min, 1))),
  top as (
    select * from validas
     order by case when p_ordem = 'alunos' then alunos_erraram::numeric else erros::numeric / respostas end desc,
              erros desc, respostas desc
     limit least(greatest(coalesce(p_limite, 50), 1), 500)
  )
  select jsonb_build_object(
    'resumo', (select jsonb_build_object('respostas', count(*), 'erros', count(*) filter (where marcada is distinct from correta),
                                         'alunos', count(distinct user_id), 'questoes', count(distinct questao_id)) from rb),
    'criticas', (select count(*) from validas where erros * 2 > respostas),
    'blocos', coalesce((select jsonb_agg(b order by b->>'bloco') from (
        select jsonb_build_object('bloco', bloco, 'respostas', count(*), 'erros', count(*) filter (where marcada is distinct from correta),
                                  'alunos', count(distinct user_id), 'questoes', count(distinct questao_id)) as b
          from r group by bloco) x), '[]'::jsonb),
    'faixas', coalesce((select jsonb_agg(jsonb_build_object('faixa', f, 'n', n) order by f) from (
        select least(9, floor(erros * 10.0 / respostas))::int * 10 as f, count(*)::int as n from validas group by 1) x), '[]'::jsonb),
    'questoes', coalesce((select jsonb_agg(jsonb_build_object(
        'id', t.questao_id, 'bloco', t.bloco, 'enunciado', q.enunciado, 'alternativas', q.alternativas, 'correta', q.correta,
        'explicacao', q.explicacao, 'ativo', q.ativo, 'respostas', t.respostas, 'erros', t.erros, 'alunos', t.alunos,
        'alunos_erraram', t.alunos_erraram, 'ultima', t.ultima, 'dist', coalesce(d.d, '{}'::jsonb),
        'reportes', (select count(*) from questao_reportes x where x.questao_id = t.questao_id and x.status = 'aberto'),
        'comentarios', (select count(*) from questao_comentarios c where c.questao_id = t.questao_id and not c.oculto and not c.apagado)
      ) order by case when p_ordem = 'alunos' then t.alunos_erraram::numeric else t.erros::numeric / t.respostas end desc, t.erros desc, t.respostas desc)
      from top t join questoes q on q.id = t.questao_id left join dist d on d.questao_id = t.questao_id), '[]'::jsonb)
  ) into v;
  return v;
end $$;
revoke all on function admin_questoes_erros(text, int, int, text, int) from public, anon;
grant execute on function admin_questoes_erros(text, int, int, text, int) to authenticated;

-- ajuda nas contas por questão
create index if not exists tentativas_user_inicio on tentativas (user_id, iniciada_em);

notify pgrst, 'reload schema';
select 'painel de questões que mais erram pronto' as status;
