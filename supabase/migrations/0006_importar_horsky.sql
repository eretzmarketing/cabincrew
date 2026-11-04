-- =====================================================================
-- Cabin Crew — importa o conteúdo da Horsky (só LEITURA na Horsky)
--
-- ANTES DE RODAR: troque COLE_AQUI_A_CONEXAO_DA_HORSKY (logo abaixo) pela
-- conexão do projeto Horsky: Supabase › projeto Horsky › botão "Connect" ›
-- "Session pooler" › copie a URI e coloque a senha do banco no lugar de
-- [YOUR-PASSWORD].
--
-- Pode rodar mais de uma vez: o que já foi importado é atualizado, não duplicado.
-- Tudo entra como RASCUNHO: publique pelo painel administrador.
-- =====================================================================

create extension if not exists dblink with schema extensions;

-- Monta a lista de alternativas, ignorando as vazias
create or replace function _cc_alts(a text, b text, c text, d text, e text default null,
                                    ia text default null, ib text default null, ic text default null, id text default null)
returns jsonb language sql immutable as $$
  select coalesce(jsonb_agg(x order by x->>'letra'), '[]'::jsonb)
  from jsonb_array_elements(jsonb_build_array(
    jsonb_build_object('letra','A','texto',nullif(trim(a),''),'imagem_url',nullif(trim(ia),'')),
    jsonb_build_object('letra','B','texto',nullif(trim(b),''),'imagem_url',nullif(trim(ib),'')),
    jsonb_build_object('letra','C','texto',nullif(trim(c),''),'imagem_url',nullif(trim(ic),'')),
    jsonb_build_object('letra','D','texto',nullif(trim(d),''),'imagem_url',nullif(trim(id),'')),
    jsonb_build_object('letra','E','texto',nullif(trim(e),''),'imagem_url',null)
  )) x
  where x->>'texto' is not null or x->>'imagem_url' is not null;
$$;

create or replace function _cc_letra(v text) returns text language sql immutable as $$
  select case when upper(trim(v)) in ('A','B','C','D','E') then upper(trim(v)) end;
$$;

do $importar$
declare
  c text := 'COLE_AQUI_A_CONEXAO_DA_HORSKY';
  v_mod int;
  v_sim smallint;
  r record;
begin
  if c like 'COLE_AQUI%' then
    raise exception 'Troque COLE_AQUI_A_CONEXAO_DA_HORSKY pela conexão do projeto Horsky (veja as instruções no topo).';
  end if;

  ------------------------------------------------------------------ questões
  insert into questoes (banco, origem_id, categoria, enunciado, alternativas, correta)
  select 'anac', t.id, t.bloco, t.q, _cc_alts(t.a, t.b, t.c, t.d), _cc_letra(t.r)
  from extensions.dblink(c, $q$select id::text, block_name, question_text, option_a, option_b, option_c, option_d, correct_answer from anac_questions$q$)
       as t(id text, bloco text, q text, a text, b text, c text, d text, r text)
  where coalesce(t.q,'') <> ''
  on conflict (banco, origem_id) do update set categoria = excluded.categoria, enunciado = excluded.enunciado,
    alternativas = excluded.alternativas, correta = excluded.correta;

  insert into questoes (banco, origem_id, categoria, enunciado, alternativas, correta)
  select 'portugues', t.id, 'Português', t.q, _cc_alts(t.a, t.b, t.c, t.d), _cc_letra(t.r)
  from extensions.dblink(c, $q$select id::text, question_text, option_a, option_b, option_c, option_d, correct_answer from portuguese_questions$q$)
       as t(id text, q text, a text, b text, c text, d text, r text)
  where coalesce(t.q,'') <> ''
  on conflict (banco, origem_id) do update set enunciado = excluded.enunciado, alternativas = excluded.alternativas, correta = excluded.correta;

  insert into questoes (banco, origem_id, categoria, enunciado, alternativas, correta)
  select 'ingles', t.id, 'Inglês', t.q, _cc_alts(t.a, t.b, t.c, t.d), _cc_letra(t.r)
  from extensions.dblink(c, $q$select id::text, question_text, option_a, option_b, option_c, option_d, correct_answer from english_questions$q$)
       as t(id text, q text, a text, b text, c text, d text, r text)
  where coalesce(t.q,'') <> ''
  on conflict (banco, origem_id) do update set enunciado = excluded.enunciado, alternativas = excluded.alternativas, correta = excluded.correta;

  insert into questoes (banco, origem_id, categoria, enunciado, imagem_url, alternativas, correta, explicacao)
  select 'logico', t.id, coalesce(nullif(t.cat,''), 'Raciocínio lógico'), t.q, coalesce(nullif(t.mimg,''), nullif(t.img,'')),
         _cc_alts(t.a, t.b, t.c, t.d, t.e, t.ia, t.ib, t.ic, t.id2), _cc_letra(t.r), t.expl
  from extensions.dblink(c, $q$select id::text, category, question_text, image_url, matrix_image_url, option_a, option_b, option_c, option_d, option_e,
                               option_a_image, option_b_image, option_c_image, option_d_image, correct_answer, explanation from logical_reasoning_questions$q$)
       as t(id text, cat text, q text, img text, mimg text, a text, b text, c text, d text, e text, ia text, ib text, ic text, id2 text, r text, expl text)
  where coalesce(t.q,'') <> ''
  on conflict (banco, origem_id) do update set categoria = excluded.categoria, enunciado = excluded.enunciado, imagem_url = excluded.imagem_url,
    alternativas = excluded.alternativas, correta = excluded.correta, explicacao = excluded.explicacao;

  insert into questoes (banco, origem_id, categoria, contexto, enunciado, imagem_url, alternativas, correta)
  select 'numerico', t.id, 'Raciocínio numérico', nullif(t.ctx,''), t.q, nullif(t.img,''), _cc_alts(t.a, t.b, t.c, t.d), _cc_letra(t.r)
  from extensions.dblink(c, $q$select id::text, data_description, question_text, data_image_url, option_a, option_b, option_c, option_d, correct_answer from numerical_reasoning_questions$q$)
       as t(id text, ctx text, q text, img text, a text, b text, c text, d text, r text)
  where coalesce(t.q,'') <> ''
  on conflict (banco, origem_id) do update set contexto = excluded.contexto, enunciado = excluded.enunciado, imagem_url = excluded.imagem_url,
    alternativas = excluded.alternativas, correta = excluded.correta;

  insert into questoes (banco, origem_id, categoria, contexto, enunciado, alternativas, correta)
  select 'verbal', t.id, 'Raciocínio verbal', nullif(t.ctx,''), coalesce(nullif(t.st,''), t.q), _cc_alts(t.a, t.b, t.c, t.d), _cc_letra(t.r)
  from extensions.dblink(c, $q$select id::text, context_text, question_text, statement_to_evaluate, option_a, option_b, option_c, option_d, correct_answer from verbal_reasoning_questions$q$)
       as t(id text, ctx text, q text, st text, a text, b text, c text, d text, r text)
  where coalesce(nullif(t.st,''), t.q, '') <> ''
  on conflict (banco, origem_id) do update set contexto = excluded.contexto, enunciado = excluded.enunciado,
    alternativas = excluded.alternativas, correta = excluded.correta;

  insert into questoes (banco, origem_id, categoria, enunciado, alternativas, correta)
  select 'sjt', t.id, 'Julgamento situacional', t.q, _cc_alts(t.a, t.b, t.c, t.d), _cc_letra(t.r)
  from extensions.dblink(c, $q$select id::text, scenario, option_a_text, option_b_text, option_c_text, option_d_text, best_answer from sjt_questions$q$)
       as t(id text, q text, a text, b text, c text, d text, r text)
  where coalesce(t.q,'') <> ''
  on conflict (banco, origem_id) do update set enunciado = excluded.enunciado, alternativas = excluded.alternativas, correta = excluded.correta;

  insert into questoes (banco, origem_id, categoria, enunciado, alternativas, correta)
  select 'tecnico', t.id, coalesce(nullif(t.bloco,''), 'Conhecimentos técnicos'), t.q, _cc_alts(t.a, t.b, t.c, t.d), _cc_letra(t.r)
  from extensions.dblink(c, $q$select id::text, block, question_text, option_a, option_b, option_c, option_d, correct_answer from technical_questions$q$)
       as t(id text, bloco text, q text, a text, b text, c text, d text, r text)
  where coalesce(t.q,'') <> ''
  on conflict (banco, origem_id) do update set categoria = excluded.categoria, enunciado = excluded.enunciado,
    alternativas = excluded.alternativas, correta = excluded.correta;

  -- questões sem gabarito ou com menos de 2 alternativas não entram nos simulados
  update questoes set ativo = (correta is not null and jsonb_array_length(alternativas) >= 2)
  where origem_id is not null;

  ------------------------------------------------------------------ dinâmicas
  insert into dinamicas_categorias (slug, titulo, descricao, ordem, ativo)
  select t.slug, t.titulo, t.descricao, coalesce(t.ordem, 0), coalesce(t.ativo, true)
  from extensions.dblink(c, $q$select slug, titulo, descricao, display_order, is_active from group_dynamics_categories$q$)
       as t(slug text, titulo text, descricao text, ordem int, ativo boolean)
  on conflict (slug) do update set titulo = excluded.titulo, descricao = excluded.descricao, ordem = excluded.ordem;

  insert into dinamicas (origem_id, categoria_id, titulo, objetivo, materiais, como_realizada, como_se_destacar, ordem, ativo)
  select t.id, dc.id, t.titulo, t.objetivo, t.materiais, t.como, t.destaque, coalesce(t.ordem, 0), coalesce(t.ativo, true)
  from extensions.dblink(c, $q$select d.id::text, c.slug, d.titulo, d.objetivo, d.materiais, d.como_realizada, d.como_se_destacar, d.display_order, d.is_active
                               from group_dynamics d left join group_dynamics_categories c on c.id = d.category_id$q$)
       as t(id text, slug text, titulo text, objetivo text, materiais text, como text, destaque text, ordem int, ativo boolean)
  left join dinamicas_categorias dc on dc.slug = t.slug
  on conflict (origem_id) do update set categoria_id = excluded.categoria_id, titulo = excluded.titulo, objetivo = excluded.objetivo,
    materiais = excluded.materiais, como_realizada = excluded.como_realizada, como_se_destacar = excluded.como_se_destacar, ordem = excluded.ordem;

  ------------------------------------------------------------------ aulas do Head Hunter (texto)
  -- módulo do Head Hunter → módulo do Crew Select (pela ordem)
  for r in
    select (mo.ord)::int hh, (le.ord)::int n, le.l
    from extensions.dblink(c, $q$select modules::text from courses where title ilike 'Head Hunter%' order by created_at limit 1$q$) as t(m text),
         jsonb_array_elements(t.m::jsonb) with ordinality mo(m, ord),
         jsonb_array_elements(mo.m->'lessons') with ordinality le(l, ord)
    where le.l->>'type' = 'text' and coalesce(le.l->>'textContent','') <> ''
  loop
    select id into v_mod from modulos
    where ordem = (array[1,6,6,6,6,6,4,10,11])[r.hh];
    continue when v_mod is null;
    insert into aulas (modulo_id, ordem, titulo, tipo, resumo, conteudo, duracao_min, publicado, origem)
    values (
      v_mod, r.hh * 10 + r.n, r.l->>'title', 'texto',
      nullif(left(trim(regexp_replace(regexp_replace(coalesce(r.l->>'description',''), '<[^>]+>', ' ', 'g'), '\s+', ' ', 'g')), 400), ''),
      r.l->>'textContent',
      nullif(split_part(coalesce(r.l->>'duration',''), ':', 1), '')::int,
      false,
      'horsky-hh-' || coalesce(r.l->>'id', r.hh || '-' || r.n)
    )
    on conflict (origem) do update set titulo = excluded.titulo, resumo = excluded.resumo, conteudo = excluded.conteudo,
      duracao_min = excluded.duracao_min, modulo_id = excluded.modulo_id;
  end loop;

  ------------------------------------------------------------------ simulados + aula de cada um
  for r in select * from (values
    -- origem,          módulo, ordem, título,                                     bancos,        categorias,                          questões, minutos
    ('cc-pt',             6,  25, 'Simulado de Português',                         '{portugues}', null::text[],                          20,  25),
    ('cc-en',             6,  35, 'Simulado de Inglês',                            '{ingles}',    null,                                  20,  20),
    ('cc-logico',         6,  45, 'Simulado de Raciocínio Lógico',                 '{logico}',    null,                                  20,  25),
    ('cc-numerico',       6,  46, 'Simulado de Raciocínio Numérico',               '{numerico}',  null,                                  20,  25),
    ('cc-verbal',         6,  47, 'Simulado de Raciocínio Verbal',                 '{verbal}',    null,                                  20,  25),
    ('cc-sjt',            6,  65, 'Simulado de Julgamento Situacional (SJT)',      '{sjt}',       null,                                  20,  30),
    ('cc-anac-tecnicos',  5,   1, 'ANAC · Conhecimentos Técnicos',                 '{anac}',      '{"Conhecimentos Técnicos"}',          20,  30),
    ('cc-anac-legislacao',5,   2, 'ANAC · Legislação Aeronáutica',                 '{anac}',      '{"Legislação Aeronáutica"}',          20,  30),
    ('cc-anac-socorros',  5,   3, 'ANAC · Primeiros Socorros',                     '{anac}',      '{"Primeiros Socorros"}',              20,  30),
    ('cc-anac-seguranca', 5,   4, 'ANAC · Segurança e Emergência',                 '{anac}',      '{"Segurança e Emergência"}',          20,  30),
    ('cc-anac-completo',  5,   5, 'Simulado completo da banca ANAC',               '{anac}',      null,                                  80, 120),
    ('cc-tecnico',        5,   6, 'Questões técnicas extras',                      '{tecnico}',   null,                                  15,  20),
    ('cc-final',         11,  99, 'Prova técnica final',                           '{anac,tecnico}', null,                               60,  90)
  ) v(origem, mod, ordem, titulo, bancos, categorias, qtd, minutos)
  loop
    insert into simulados (titulo, bancos, categorias, qtd_questoes, tempo_min, nota_minima, origem)
    values (r.titulo, r.bancos::text[], r.categorias, r.qtd, r.minutos, 70, r.origem)
    on conflict (origem) do update set titulo = excluded.titulo, bancos = excluded.bancos, categorias = excluded.categorias,
      qtd_questoes = excluded.qtd_questoes, tempo_min = excluded.tempo_min
    returning id into v_sim;

    select id into v_mod from modulos where ordem = r.mod;
    continue when v_mod is null;
    insert into aulas (modulo_id, ordem, titulo, tipo, resumo, simulado_id, duracao_min, publicado, origem)
    values (v_mod, r.ordem, r.titulo, 'simulado',
            r.qtd || ' questões · ' || r.minutos || ' minutos · nota mínima 70%', v_sim, r.minutos, false, 'aula-' || r.origem)
    on conflict (origem) do update set titulo = excluded.titulo, resumo = excluded.resumo, simulado_id = excluded.simulado_id,
      duracao_min = excluded.duracao_min;
  end loop;

  update modulos set recurso = 'dinamicas' where ordem = 7;
end
$importar$;

drop function if exists _cc_alts(text, text, text, text, text, text, text, text, text);
drop function if exists _cc_letra(text);
drop extension if exists dblink;

-- Resumo do que foi importado
select 'questões (ativas)' item, count(*)::text total from questoes where ativo
union all select 'questões sem gabarito (fora dos simulados)', count(*)::text from questoes where not ativo
union all select 'simulados', count(*)::text from simulados
union all select 'aulas do Head Hunter (rascunho)', count(*)::text from aulas where origem like 'horsky-hh-%'
union all select 'categorias de dinâmicas', count(*)::text from dinamicas_categorias
union all select 'dinâmicas', count(*)::text from dinamicas;
