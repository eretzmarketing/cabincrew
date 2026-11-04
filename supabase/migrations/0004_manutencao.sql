-- =====================================================================
-- Cabin Crew — modo manutenção (página "Em breve" para todos, menos administradores)
-- Rode no SQL Editor do Supabase. Pode rodar mais de uma vez.
-- =====================================================================
insert into configuracoes (chave, valor, descricao) values
  ('manutencao', 'true', 'Site em manutenção: só administradores acessam; o público vê "Em breve"')
on conflict (chave) do nothing;
