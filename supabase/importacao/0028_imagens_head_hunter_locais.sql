-- Troca as imagens das aulas do Head Hunter (site da Horsky) pelas cópias na VPS do Cabin Crew.
-- Rode SOMENTE depois do comando scripts/baixar-imagens-head-hunter.sh ter copiado as imagens.
update aulas set conteudo = replace(conteudo, 'https://horsky.com.br/upload/image/course-headhunter/', '/midia/imagens/aulas/head-hunter/'), updated_at = now()
where origem like 'horsky-hh-%' and conteudo like '%horsky.com.br/upload/image/course-headhunter/%';
select count(*) as aulas_atualizadas from aulas where origem like 'horsky-hh-%' and conteudo like '%/midia/imagens/aulas/head-hunter/%';
