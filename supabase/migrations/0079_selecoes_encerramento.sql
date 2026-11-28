-- Cabin Crew · 0079 · Fórum: data de encerramento das seleções
--   • selecoes.encerrada_em: depois dessa data a seleção aparece como "Encerrada" sozinha
-- Pode rodar mais de uma vez.

alter table selecoes add column if not exists encerrada_em date;

create or replace view selecoes_resumo as
 select s.id, s.companhia_id, s.cargo, s.base, s.base_nome, s.mes_ref, s.slug,
    case when s.encerrada_em is not null and s.encerrada_em < (now() at time zone 'America/Sao_Paulo')::date
         then 'encerrada'::status_selecao else s.status end as status,
    s.aberta_em, s.observacao, s.created_at,
    c.nome as companhia, c.slug as companhia_slug,
    (select count(*) from relatos r where r.selecao_id = s.id and r.status = 'publicado'::status_relato)::integer as total_relatos,
    (select max(r.fase_id) from relatos r where r.selecao_id = s.id and r.status = 'publicado'::status_relato) as fase_max,
    (select max(r.created_at) from relatos r where r.selecao_id = s.id and r.status = 'publicado'::status_relato) as ultimo_relato,
    s.encerrada_em,
    s.status as status_manual
   from selecoes s
   join companhias c on c.id = s.companhia_id;

grant select on selecoes_resumo to anon, authenticated;

notify pgrst, 'reload schema';
