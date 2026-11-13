-- Cabin Crew · 0041 · Avisos automáticos personalizados
-- Permite criar novos avisos no admin (ex.: "Dica do comandante" logo após o cadastro),
-- disparados pelos mesmos momentos dos avisos padrão. Pode rodar mais de uma vez.

alter table whatsapp_modelos add column if not exists gatilho text;             -- momento em que dispara (para avisos personalizados)
alter table whatsapp_modelos add column if not exists personalizado boolean not null default false;
alter table whatsapp_modelos add column if not exists created_at timestamptz not null default now();
grant delete on whatsapp_modelos to authenticated;

-- Confirmação da lista Em breve: agora também envia os avisos personalizados desse momento
drop function if exists whatsapp_reservar_interessado(text);
create or replace function whatsapp_reservar_interessado(p_telefone text, p_evento text default 'interessado')
returns table (envio_id bigint, telefone text, nome text, texto text)
language plpgsql security definer set search_path = public as $$
declare
  t text := '+' || regexp_replace(coalesce(p_telefone, ''), '\D', '', 'g');
  v_nome text; v_texto text; v_id bigint;
begin
  -- só para quem acabou de entrar na lista
  select split_part(i.nome, ' ', 1) into v_nome from interessados i
   where i.telefone = t and i.updated_at > now() - interval '10 minutes';
  if v_nome is null then return; end if;
  select m.texto into v_texto from whatsapp_modelos m
   where m.evento = p_evento and m.ativo and (m.evento = 'interessado' or m.gatilho = 'interessado');
  if v_texto is null then return; end if;
  insert into whatsapp_envios (user_id, evento, ref, telefone)
  values (null, p_evento, t, t)
  on conflict do nothing
  returning id into v_id;
  if v_id is null then return; end if;
  return query select v_id, t, v_nome, v_texto;
end $$;
revoke all on function whatsapp_reservar_interessado(text, text) from public;
grant execute on function whatsapp_reservar_interessado(text, text) to anon, authenticated;

-- O resultado dos envios sem aluno passa a aceitar os avisos personalizados da lista
create or replace function whatsapp_resultado_publico(p_id bigint, p_status text, p_texto text, p_erro text default null)
returns void language sql security definer set search_path = public as $$
  update whatsapp_envios set status = p_status, texto = left(p_texto, 4000), erro = left(p_erro, 500)
  where id = p_id and user_id is null and status = 'enviando'
    and (evento in ('interessado', 'conta_excluida') or evento in (select m.evento from whatsapp_modelos m where m.gatilho = 'interessado'))
    and created_at > now() - interval '15 minutes' and p_status in ('enviada', 'erro', 'sem_whatsapp');
$$;

-- Avisos personalizados ativos de um momento (o visitante da página Em breve não lê a tabela de modelos)
create or replace function whatsapp_personalizados(p_gatilho text)
returns setof text language sql stable security definer set search_path = public as $$
  select m.evento from whatsapp_modelos m where m.gatilho = p_gatilho and m.ativo and m.personalizado order by m.created_at;
$$;
revoke all on function whatsapp_personalizados(text) from public;
grant execute on function whatsapp_personalizados(text) to anon, authenticated;

notify pgrst, 'reload schema';
select 'avisos personalizados prontos' as status;
