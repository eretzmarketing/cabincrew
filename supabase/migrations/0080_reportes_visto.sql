-- Cabin Crew · 0080 · Questões reportadas: marca quando o admin abriu o reporte (Aberto → Pendente)
-- Pode rodar mais de uma vez.
alter table questao_reportes add column if not exists visto_em timestamptz;
notify pgrst, 'reload schema';
