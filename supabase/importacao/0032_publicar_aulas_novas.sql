-- Publica as aulas novas dos módulos 00, 02, 03, 07, 08 e 09 (e os módulos delas).
update aulas set publicado = true where origem like 'cc-aula-%';
update modulos set publicado = true where ordem in (0, 2, 3, 7, 8, 9);
select count(*) as aulas_publicadas from aulas where publicado and origem like 'cc-aula-%';
