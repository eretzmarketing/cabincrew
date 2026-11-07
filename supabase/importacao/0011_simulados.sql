-- Cabin Crew · Simulados prontos e uma aula (rascunho) para cada um
-- Rode depois das questões. Pode rodar mais de uma vez (atualiza, não duplica).
-- Tudo entra como RASCUNHO: publique em Administrador › Crew Select.

do $simulados$
declare
  v_mod int;
  v_sim smallint;
  r record;
begin
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
$simulados$;

select s.titulo as simulado, s.qtd_questoes as questoes, s.tempo_min as minutos,
       (select count(*) from questoes q where q.ativo and q.banco = any(s.bancos)
          and (s.categorias is null or q.categoria = any(s.categorias))) as questoes_disponiveis
from simulados s order by s.titulo;
