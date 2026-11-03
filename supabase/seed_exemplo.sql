-- OPCIONAL — seleções de exemplo para testar o site antes de cadastrar as reais.
-- Apague depois em: delete from selecoes where observacao = 'exemplo';
insert into selecoes (companhia_id, base, base_nome, mes_ref, slug, status, observacao)
select id, 'GRU', 'Guarulhos', date '2026-11-01', 'latam-gru-2026-11', 'andamento', 'exemplo' from companhias where slug = 'latam'
union all
select id, 'CGH', 'Congonhas', date '2026-10-01', 'gol-cgh-2026-10', 'andamento', 'exemplo' from companhias where slug = 'gol'
union all
select id, 'VCP', 'Campinas', date '2026-11-01', 'azul-vcp-2026-11', 'inscricoes', 'exemplo' from companhias where slug = 'azul';
