-- Cabin Crew · 0038 · Registro das contas excluídas pelo próprio aluno
-- Guarda o mínimo necessário para comprovação (LGPD, art. 16, II: exercício regular de direitos em processo judicial):
-- nome, e-mail, WhatsApp, datas, confirmação de ciência (sem reembolso) e IP. Só administradores leem.
-- Pode rodar mais de uma vez.

create table if not exists contas_excluidas (
  id           bigserial primary key,
  user_id      uuid not null,
  nome         text,
  email        text,
  whatsapp     text,
  escola       text,
  cadastro_em  timestamptz,
  excluida_em  timestamptz not null default now(),
  ciente_sem_reembolso boolean not null default true,
  ip           text,
  navegador    text
);
create index if not exists contas_excluidas_data on contas_excluidas (excluida_em desc);

alter table contas_excluidas enable row level security;
drop policy if exists "contas excluidas: admin le" on contas_excluidas;
create policy "contas excluidas: admin le" on contas_excluidas for select to authenticated using (is_admin());
grant select on contas_excluidas to authenticated;

-- Exclusão pelo aluno: registra os dados acima e só então apaga a conta (e tudo dela, em cascata).
drop function if exists excluir_minha_conta();
create or replace function excluir_minha_conta(p_ip text default null, p_navegador text default null)
returns table (envio_id bigint, telefone text, nome text, texto text)
language plpgsql security definer set search_path = public, auth as $$
declare
  uid uuid := auth.uid();
  v_tel text; v_nome text; v_completo text; v_escola text; v_cad timestamptz; v_email text; v_texto text; v_id bigint;
begin
  if uid is null then raise exception 'sem login'; end if;
  if exists (select 1 from profiles where id = uid and is_admin) then raise exception 'administradores não podem se excluir por aqui'; end if;
  select p.whatsapp, coalesce(nullif(trim(p.nome), ''), p.apelido), p.escola, p.created_at
    into v_tel, v_completo, v_escola, v_cad from profiles p where p.id = uid;
  select u.email into v_email from auth.users u where u.id = uid;
  v_nome := split_part(coalesce(v_completo, ''), ' ', 1);

  insert into contas_excluidas (user_id, nome, email, whatsapp, escola, cadastro_em, ip, navegador)
  values (uid, v_completo, v_email, v_tel, v_escola, v_cad, left(p_ip, 100), left(p_navegador, 300));

  select m.texto into v_texto from whatsapp_modelos m where m.evento = 'conta_excluida' and m.ativo;
  if coalesce(v_tel, '') <> '' and v_texto is not null then
    insert into whatsapp_envios (user_id, evento, ref, telefone) values (null, 'conta_excluida', uid::text, v_tel)
    on conflict do nothing returning id into v_id;
  end if;
  if coalesce(v_tel, '') <> '' then delete from interessados i where i.telefone = v_tel; end if;
  delete from auth.users where id = uid;
  if v_id is not null then return query select v_id, v_tel, v_nome, v_texto; end if;
end $$;
revoke all on function excluir_minha_conta(text, text) from public, anon;
grant execute on function excluir_minha_conta(text, text) to authenticated;

notify pgrst, 'reload schema';
select 'registro de contas excluídas pronto' as status;
