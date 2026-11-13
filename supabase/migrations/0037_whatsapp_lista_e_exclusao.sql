-- Cabin Crew · 0037 · WhatsApp para a lista "Em breve", fim da opção de desligar avisos e exclusão da conta pelo aluno
-- O WhatsApp passa a ser o canal oficial de avisos (não há opção de desligar).
-- Pode rodar mais de uma vez.

-- 1) Avisos sempre ligados
update profiles set whatsapp_avisos = true where not whatsapp_avisos;

update whatsapp_modelos
   set texto = replace(texto, E'\n\n(Se preferir não receber estes avisos, desligue em Minha conta.)',
                       E'\n\n📲 Salve este número na sua agenda: é por aqui que você recebe todos os avisos da Cabin Crew.'),
       updated_at = now()
 where evento = 'boas_vindas' and texto like '%desligue em Minha conta%';

insert into whatsapp_modelos (evento, titulo, quando, texto) values
  ('interessado', 'Lista "Em breve"', 'Quando alguém entra na lista da página Em breve.',
   E'✈️ Bem-vindo(a) a bordo, {nome}!\n\n👨‍✈️ Aqui é o comandante da Cabin Crew. Seu lugar na lista está garantido: assim que o embarque for liberado, você recebe o aviso em primeira mão aqui no WhatsApp.\n\n📲 Salve este número na sua agenda para receber todos os avisos da Cabin Crew.\n\nAté breve! ✈️'),
  ('conta_excluida', 'Conta excluída', 'Quando o aluno exclui a própria conta em Minha conta.',
   E'{nome}, sua conta na Cabin Crew foi excluída, como você pediu. ✈️\n\nSeus dados e seu progresso foram apagados e você não vai mais receber avisos por este WhatsApp.\n\nSe um dia quiser voltar, será um prazer ter você a bordo de novo. 👨‍✈️')
on conflict (evento) do nothing;

-- envios sem aluno (lista Em breve, conta excluída): um por telefone/conta
create unique index if not exists whatsapp_envios_sem_aluno on whatsapp_envios (evento, ref) where user_id is null;

-- 2) Reserva de aviso do aluno: não depende mais da opção de avisos
create or replace function whatsapp_reservar(p_evento text, p_ref text default '')
returns table (envio_id bigint, telefone text, nome text, texto text)
language plpgsql security definer set search_path = public as $$
declare
  v_tel text; v_nome text; v_ok boolean; v_texto text; v_id bigint;
begin
  if auth.uid() is null or p_evento in ('manual', 'interessado', 'conta_excluida') then return; end if;
  select p.whatsapp, split_part(coalesce(nullif(trim(p.nome), ''), p.apelido), ' ', 1), not coalesce(p.bloqueado, false)
    into v_tel, v_nome, v_ok from profiles p where p.id = auth.uid();
  if not coalesce(v_ok, false) or coalesce(v_tel, '') = '' then return; end if;
  select m.texto into v_texto from whatsapp_modelos m where m.evento = p_evento and m.ativo;
  if v_texto is null then return; end if;
  insert into whatsapp_envios (user_id, evento, ref, telefone)
  values (auth.uid(), p_evento, coalesce(p_ref, ''), v_tel)
  on conflict do nothing
  returning id into v_id;
  if v_id is null then return; end if;
  return query select v_id, v_tel, v_nome, v_texto;
end $$;

-- 3) Confirmação para quem entrou na lista Em breve (visitante sem login), uma vez por telefone
create or replace function whatsapp_reservar_interessado(p_telefone text)
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
  select m.texto into v_texto from whatsapp_modelos m where m.evento = 'interessado' and m.ativo;
  if v_texto is null then return; end if;
  insert into whatsapp_envios (user_id, evento, ref, telefone)
  values (null, 'interessado', t, t)
  on conflict do nothing
  returning id into v_id;
  if v_id is null then return; end if;
  return query select v_id, t, v_nome, v_texto;
end $$;
revoke all on function whatsapp_reservar_interessado(text) from public;
grant execute on function whatsapp_reservar_interessado(text) to anon, authenticated;

-- Resultado dos envios sem aluno (só os recém-reservados)
create or replace function whatsapp_resultado_publico(p_id bigint, p_status text, p_texto text, p_erro text default null)
returns void language sql security definer set search_path = public as $$
  update whatsapp_envios set status = p_status, texto = left(p_texto, 4000), erro = left(p_erro, 500)
  where id = p_id and user_id is null and evento in ('interessado', 'conta_excluida') and status = 'enviando'
    and created_at > now() - interval '15 minutes' and p_status in ('enviada', 'erro', 'sem_whatsapp');
$$;
revoke all on function whatsapp_resultado_publico(bigint, text, text, text) from public;
grant execute on function whatsapp_resultado_publico(bigint, text, text, text) to anon, authenticated;

-- 4) O aluno exclui a própria conta: apaga o login e, em cascata, perfil, progresso, notas, relatos etc.
-- Devolve os dados para a mensagem de confirmação no WhatsApp (enviada depois pelo site).
create or replace function excluir_minha_conta()
returns table (envio_id bigint, telefone text, nome text, texto text)
language plpgsql security definer set search_path = public, auth as $$
declare
  uid uuid := auth.uid();
  v_tel text; v_nome text; v_texto text; v_id bigint;
begin
  if uid is null then raise exception 'sem login'; end if;
  if exists (select 1 from profiles where id = uid and is_admin) then raise exception 'administradores não podem se excluir por aqui'; end if;
  select p.whatsapp, split_part(coalesce(nullif(trim(p.nome), ''), p.apelido), ' ', 1) into v_tel, v_nome from profiles p where p.id = uid;
  select m.texto into v_texto from whatsapp_modelos m where m.evento = 'conta_excluida' and m.ativo;
  if coalesce(v_tel, '') <> '' and v_texto is not null then
    insert into whatsapp_envios (user_id, evento, ref, telefone) values (null, 'conta_excluida', uid::text, v_tel)
    on conflict do nothing returning id into v_id;
  end if;
  if coalesce(v_tel, '') <> '' then delete from interessados i where i.telefone = v_tel; end if;
  delete from auth.users where id = uid;
  if v_id is not null then return query select v_id, v_tel, v_nome, v_texto; end if;
end $$;
revoke all on function excluir_minha_conta() from public, anon;
grant execute on function excluir_minha_conta() to authenticated;

notify pgrst, 'reload schema';
select 'lista, avisos e exclusão de conta prontos' as status;
