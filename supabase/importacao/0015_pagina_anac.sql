-- Cabin Crew · liga a página "Simulados ANAC" ao módulo 05 (Prova da ANAC)
-- Os blocos aparecem para o aluno quando as aulas dos simulados ANAC estiverem publicadas.
update modulos set recurso = 'anac' where ordem = 5;
select ordem, titulo, recurso from modulos where recurso is not null order by ordem;
