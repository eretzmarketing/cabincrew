-- Cabin Crew · 0007 · garante que visitantes (não logados) leiam as chaves do site
-- Sem isso, o modo manutenção só valia para quem estava logado.
-- Pode rodar mais de uma vez.

grant select on configuracoes to anon, authenticated;

create or replace function public.config_publica()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_object_agg(chave, valor), '{}'::jsonb) from configuracoes;
$$;

revoke all on function public.config_publica() from public;
grant execute on function public.config_publica() to anon, authenticated;

notify pgrst, 'reload schema';

-- Conferência: deve mostrar manutencao = true se ela estiver ligada no painel
select chave, valor from configuracoes order by chave;
