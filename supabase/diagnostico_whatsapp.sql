-- Diagnóstico do WhatsApp: cole no Supabase → SQL Editor → Run e mande um print do resultado.
-- Só leitura: não altera nada. Se der erro "whatsapp_envios does not exist", falta rodar o SQL 0036.
select 1 as ordem, 'SQL 0036 a 0040' as item,
       concat_ws(' · ',
         '0036 ' || case when to_regclass('public.whatsapp_envios') is not null then 'ok' else 'FALTA' end,
         '0037 ' || case when to_regprocedure('public.whatsapp_reservar_interessado(text)') is not null then 'ok' else 'FALTA' end,
         '0038 ' || case when to_regclass('public.contas_excluidas') is not null then 'ok' else 'FALTA' end,
         '0039 ' || case when to_regclass('public.compras') is not null then 'ok' else 'FALTA' end,
         '0040 ' || case when to_regclass('public.whatsapp_campanhas') is not null then 'ok' else 'FALTA' end) as resultado
union all
select 2, 'Modelo boas-vindas', coalesce((select case when ativo then 'ativo' else 'DESATIVADO' end from whatsapp_modelos where evento = 'boas_vindas'), 'NÃO EXISTE')
union all
select * from (
  select 3, 'Cadastro ' || to_char(p.created_at at time zone 'America/Sao_Paulo', 'DD/MM HH24:MI'),
         coalesce(p.nome, p.apelido, '?') || ' · WhatsApp: ' || coalesce(p.whatsapp, 'VAZIO') || ' · avisos: ' || p.whatsapp_avisos::text
  from profiles p where not p.is_admin order by p.created_at desc limit 3) a
union all
select * from (
  select 4, 'Envio ' || to_char(e.created_at at time zone 'America/Sao_Paulo', 'DD/MM HH24:MI'),
         e.evento || ' · ' || coalesce(e.telefone, '') || ' · ' || e.status || coalesce(' · ' || e.erro, '')
  from whatsapp_envios e order by e.created_at desc limit 8) b
order by 1;
