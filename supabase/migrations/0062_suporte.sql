-- Cabin Crew · 0062 · Suporte e contato
--   • Contato (rodapé): formulário simples para quem não tem conta (nome, e-mail, WhatsApp, assunto, mensagem)
--   • Suporte (alunos logados): chamados com conversa, anexos, aberto/fechado e aviso no WhatsApp quando a equipe responde
-- Rode depois do 0061. Pode rodar mais de uma vez.

-- ---------------------------------------------------------------- contato (sem login)
create table if not exists contatos (
  id         bigserial primary key,
  nome       text not null check (char_length(nome) between 2 and 120),
  email      text not null check (char_length(email) between 5 and 200),
  whatsapp   text,
  assunto    text not null check (char_length(assunto) between 2 and 150),
  mensagem   text not null check (char_length(mensagem) between 5 and 5000),
  ip_hash    text,
  status     text not null default 'novo' check (status in ('novo', 'resolvido')),
  criado_em  timestamptz not null default now()
);
create index if not exists contatos_criado on contatos (criado_em desc);
alter table contatos enable row level security;
drop policy if exists "contatos: admin" on contatos;
create policy "contatos: admin" on contatos for all to authenticated using (is_admin()) with check (is_admin());
grant select, update, delete on contatos to authenticated;
grant usage, select on sequence contatos_id_seq to authenticated;

-- Só o servidor do site grava (com a chave), com limite contra spam: 3 por hora por aparelho/rede e 3 por hora por e-mail
create or replace function contato_enviar(p_chave text, p_nome text, p_email text, p_whatsapp text, p_assunto text, p_mensagem text, p_ip_hash text)
returns bigint language plpgsql security definer set search_path = public as $$
declare v_id bigint;
begin
  perform _confere_chave(p_chave);
  if (select count(*) from contatos where criado_em > now() - interval '1 hour'
        and (ip_hash = p_ip_hash or lower(email) = lower(trim(p_email)))) >= 3 then
    raise exception 'muitas mensagens' using errcode = 'P0001';
  end if;
  insert into contatos (nome, email, whatsapp, assunto, mensagem, ip_hash)
  values (trim(p_nome), lower(trim(p_email)), nullif(trim(coalesce(p_whatsapp, '')), ''), trim(p_assunto), trim(p_mensagem), p_ip_hash)
  returning id into v_id;
  return v_id;
end $$;
revoke all on function contato_enviar(text, text, text, text, text, text, text) from public;
grant execute on function contato_enviar(text, text, text, text, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------- chamados (alunos logados)
create table if not exists tickets (
  id            bigserial primary key,
  user_id       uuid not null references profiles(id) on delete cascade,
  departamento  text not null check (departamento in ('tecnico', 'financeiro', 'comercial')),
  assunto       text not null check (char_length(assunto) between 3 and 150),
  status        text not null default 'aberto' check (status in ('aberto', 'fechado')),
  aguardando    text not null default 'equipe' check (aguardando in ('equipe', 'aluno')),
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index if not exists tickets_user on tickets (user_id, atualizado_em desc);
create index if not exists tickets_fila on tickets (status, atualizado_em desc);

create table if not exists ticket_mensagens (
  id         bigserial primary key,
  ticket_id  bigint not null references tickets(id) on delete cascade,
  autor_id   uuid references profiles(id) on delete set null,
  da_equipe  boolean not null default false,
  texto      text not null check (char_length(texto) between 1 and 5000),
  anexos     jsonb not null default '[]'::jsonb,
  criado_em  timestamptz not null default now()
);
create index if not exists ticket_mensagens_ticket on ticket_mensagens (ticket_id, criado_em);

alter table tickets enable row level security;
alter table ticket_mensagens enable row level security;
drop policy if exists "tickets: dono ou admin" on tickets;
create policy "tickets: dono ou admin" on tickets for select to authenticated using (user_id = auth.uid() or is_admin());
drop policy if exists "tickets: admin apaga" on tickets;
create policy "tickets: admin apaga" on tickets for delete to authenticated using (is_admin());
drop policy if exists "mensagens: dono ou admin" on ticket_mensagens;
create policy "mensagens: dono ou admin" on ticket_mensagens for select to authenticated
  using (is_admin() or exists (select 1 from tickets t where t.id = ticket_id and t.user_id = auth.uid()));
grant select, delete on tickets to authenticated;
grant select on ticket_mensagens to authenticated;

-- Abrir um chamado (o próprio aluno). Limite: 5 chamados por dia.
create or replace function ticket_abrir(p_departamento text, p_assunto text, p_texto text, p_anexos jsonb default '[]'::jsonb)
returns bigint language plpgsql security definer set search_path = public as $$
declare v_id bigint;
begin
  if auth.uid() is null then raise exception 'faça login' using errcode = 'P0001'; end if;
  if (select coalesce(bloqueado, false) from profiles where id = auth.uid()) then raise exception 'conta bloqueada' using errcode = 'P0001'; end if;
  if (select count(*) from tickets where user_id = auth.uid() and criado_em > now() - interval '1 day') >= 5 then
    raise exception 'limite de chamados' using errcode = 'P0001';
  end if;
  insert into tickets (user_id, departamento, assunto) values (auth.uid(), p_departamento, trim(p_assunto)) returning id into v_id;
  insert into ticket_mensagens (ticket_id, autor_id, da_equipe, texto, anexos)
  values (v_id, auth.uid(), false, trim(p_texto), coalesce(p_anexos, '[]'::jsonb));
  return v_id;
end $$;
revoke all on function ticket_abrir(text, text, text, jsonb) from public, anon;
grant execute on function ticket_abrir(text, text, text, jsonb) to authenticated;

-- Responder (aluno dono ou equipe). Resposta do aluno reabre o chamado; resposta da equipe passa a aguardar o aluno.
create or replace function ticket_responder(p_ticket bigint, p_texto text, p_anexos jsonb default '[]'::jsonb)
returns bigint language plpgsql security definer set search_path = public as $$
declare v_dono uuid; v_admin boolean := is_admin(); v_id bigint;
begin
  select user_id into v_dono from tickets where id = p_ticket;
  if v_dono is null then raise exception 'chamado não encontrado' using errcode = 'P0001'; end if;
  if not v_admin and v_dono <> auth.uid() then raise exception 'sem permissão' using errcode = 'P0001'; end if;
  if not v_admin and (select count(*) from ticket_mensagens where autor_id = auth.uid() and criado_em > now() - interval '1 hour') >= 20 then
    raise exception 'muitas mensagens' using errcode = 'P0001';
  end if;
  insert into ticket_mensagens (ticket_id, autor_id, da_equipe, texto, anexos)
  values (p_ticket, auth.uid(), v_admin and v_dono <> auth.uid(), trim(p_texto), coalesce(p_anexos, '[]'::jsonb))
  returning id into v_id;
  update tickets set atualizado_em = now(),
    aguardando = case when v_admin and v_dono <> auth.uid() then 'aluno' else 'equipe' end,
    status = case when v_admin and v_dono <> auth.uid() then status else 'aberto' end
  where id = p_ticket;
  return v_id;
end $$;
revoke all on function ticket_responder(bigint, text, jsonb) from public, anon;
grant execute on function ticket_responder(bigint, text, jsonb) to authenticated;

-- Aberto / fechado (só a equipe)
create or replace function ticket_status(p_ticket bigint, p_status text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform _exige_admin();
  if p_status not in ('aberto', 'fechado') then raise exception 'status inválido'; end if;
  update tickets set status = p_status, atualizado_em = now() where id = p_ticket;
end $$;
revoke all on function ticket_status(bigint, text) from public, anon;
grant execute on function ticket_status(bigint, text) to authenticated;

-- ---------------------------------------------------------------- aviso no WhatsApp: "seu chamado foi respondido"
insert into whatsapp_modelos (evento, titulo, quando, texto) values
  ('ticket_respondido', 'Suporte: chamado respondido', 'Quando a equipe responde um chamado de suporte do aluno.',
   E'💬 {nome}, seu chamado de suporte foi respondido!\n\nAssunto: {assunto}\n\nVeja a resposta aqui:\n👉 {link}/conta/suporte/{chamado}')
on conflict (evento) do nothing;

-- A equipe reserva o envio para o dono do chamado (uma vez por resposta)
create or replace function ticket_whatsapp_reservar(p_mensagem bigint)
returns table (envio_id bigint, telefone text, nome text, texto text, assunto text, chamado bigint)
language plpgsql security definer set search_path = public as $$
declare v_user uuid; v_tel text; v_nome text; v_ok boolean; v_texto text; v_id bigint; v_assunto text; v_ticket bigint;
begin
  perform _exige_admin();
  select t.user_id, t.assunto, t.id into v_user, v_assunto, v_ticket
    from ticket_mensagens m join tickets t on t.id = m.ticket_id where m.id = p_mensagem and m.da_equipe;
  if v_user is null then return; end if;
  select p.whatsapp, split_part(coalesce(nullif(trim(p.nome), ''), p.apelido), ' ', 1), not coalesce(p.bloqueado, false)
    into v_tel, v_nome, v_ok from profiles p where p.id = v_user;
  if not coalesce(v_ok, false) or coalesce(v_tel, '') = '' then return; end if;
  select m.texto into v_texto from whatsapp_modelos m where m.evento = 'ticket_respondido' and m.ativo;
  if v_texto is null then return; end if;
  insert into whatsapp_envios (user_id, evento, ref, telefone) values (v_user, 'ticket_respondido', p_mensagem::text, v_tel)
  on conflict do nothing returning id into v_id;
  if v_id is null then return; end if;
  return query select v_id, v_tel, v_nome, v_texto, v_assunto, v_ticket;
end $$;
revoke all on function ticket_whatsapp_reservar(bigint) from public, anon;
grant execute on function ticket_whatsapp_reservar(bigint) to authenticated;

create or replace function ticket_whatsapp_resultado(p_id bigint, p_status text, p_texto text, p_erro text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform _exige_admin();
  update whatsapp_envios set status = p_status, texto = left(p_texto, 4000), erro = left(p_erro, 500)
   where id = p_id and evento = 'ticket_respondido' and status = 'enviando' and p_status in ('enviada', 'erro', 'sem_whatsapp');
end $$;
revoke all on function ticket_whatsapp_resultado(bigint, text, text, text) from public, anon;
grant execute on function ticket_whatsapp_resultado(bigint, text, text, text) to authenticated;

notify pgrst, 'reload schema';
select 'suporte e contato prontos' as status;
