-- Cabin Crew · O preparatório passou a se chamar Head Hunter (antes: Crew Select).
-- Troca o nome e os links antigos dentro das aulas, módulos e configurações. Pode rodar mais de uma vez.

update aulas set
  titulo   = replace(titulo, 'Crew Select', 'Head Hunter'),
  resumo   = replace(resumo, 'Crew Select', 'Head Hunter'),
  conteudo = replace(replace(conteudo, 'Crew Select', 'Head Hunter'), '/crew-select', '/head-hunter'),
  updated_at = now()
where titulo like '%Crew Select%' or resumo like '%Crew Select%' or conteudo like '%Crew Select%' or conteudo like '%/crew-select%';

update modulos set
  titulo    = replace(titulo, 'Crew Select', 'Head Hunter'),
  descricao = replace(descricao, 'Crew Select', 'Head Hunter')
where titulo like '%Crew Select%' or descricao like '%Crew Select%';

update configuracoes set descricao = replace(descricao, 'Crew Select', 'Head Hunter')
where descricao like '%Crew Select%';

select
  (select count(*) from aulas where coalesce(titulo,'') || coalesce(resumo,'') || coalesce(conteudo,'') like '%Crew Select%') as aulas_com_nome_antigo,
  (select count(*) from modulos where coalesce(titulo,'') || coalesce(descricao,'') like '%Crew Select%') as modulos_com_nome_antigo;
