-- Cabin Crew · 0059 · Tipos de aula e PDFs na galeria
--   • aulas: novos tipos "audio" e "ao_vivo" (com data e hora da transmissão e link da gravação)
--   • midias (galeria): aceita documentos em PDF
-- Rode depois do 0058. Pode rodar mais de uma vez.

alter table aulas drop constraint if exists aulas_tipo_check;
alter table aulas add constraint aulas_tipo_check check (tipo in ('texto', 'video', 'audio', 'ao_vivo', 'pdf', 'simulado'));
alter table aulas add column if not exists ao_vivo_em timestamptz;
alter table aulas add column if not exists gravacao_url text;

alter table midias drop constraint if exists midias_tipo_check;
alter table midias add constraint midias_tipo_check check (tipo in ('imagem', 'video', 'audio', 'documento'));

notify pgrst, 'reload schema';
select 'tipos de aula prontos' as status;
