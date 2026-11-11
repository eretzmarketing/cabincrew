-- Publica as aulas importadas do Head Hunter e do Conduta Profissional (e os módulos delas).
update aulas set publicado = true where origem like 'horsky-hh-%' or origem like 'horsky-conduta-%';
update modulos set publicado = true where ordem in (1, 4, 6, 10, 11, 12);
select count(*) as aulas_publicadas from aulas where publicado and (origem like 'horsky-hh-%' or origem like 'horsky-conduta-%');
