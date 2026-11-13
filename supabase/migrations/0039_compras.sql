-- Cabin Crew · 0039 · Livro de compras (registro financeiro) e prova de uso
-- Cada venda fica registrada com produto, valor, forma de pagamento, plataforma, ID da transação e data/hora.
-- O registro NÃO é apagado quando o aluno exclui a conta (guarda nome, e-mail e WhatsApp da época da compra),
-- não pode ser excluído por ninguém, e toda alteração fica no histórico (quem, quando, o quê).
-- Pode rodar mais de uma vez.

create table if not exists compras (
  id               bigserial primary key,
  user_id          uuid,                    -- sem vínculo rígido: a compra continua mesmo se a conta for excluída
  nome             text not null,
  email            text,
  whatsapp         text,
  documento        text,                    -- CPF/CNPJ, se houver
  produto          text not null,
  valor            numeric(10,2) not null check (valor >= 0),
  moeda            text not null default 'BRL',
  forma_pagamento  text not null check (forma_pagamento in ('pix', 'cartao_credito', 'cartao_debito', 'boleto', 'transferencia', 'outro')),
  parcelas         integer check (parcelas between 1 and 36),
  plataforma       text not null,           -- Mercado Pago, Hotmart, Pix manual…
  id_transacao     text,
  status           text not null default 'aprovada' check (status in ('aprovada', 'pendente', 'reembolsada', 'cancelada', 'contestada')),
  comprada_em      timestamptz not null,    -- data e hora da compra (pagamento)
  liberada_em      timestamptz,             -- quando o acesso foi liberado
  observacao       text,
  criado_por       uuid,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create unique index if not exists compras_transacao_unica on compras (lower(plataforma), id_transacao) where id_transacao is not null and id_transacao <> '';
create index if not exists compras_user on compras (user_id);
create index if not exists compras_data on compras (comprada_em desc);

create table if not exists compras_historico (
  id        bigserial primary key,
  compra_id bigint not null references compras(id),
  acao      text not null,
  dados     jsonb not null,
  por       uuid,
  em        timestamptz not null default now()
);
create index if not exists compras_historico_compra on compras_historico (compra_id, em);

-- histórico automático de toda criação e alteração; exclusão é proibida
create or replace function compras_registrar_historico() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Compras não podem ser excluídas. Para estornos, altere o status para reembolsada ou cancelada.';
  end if;
  insert into compras_historico (compra_id, acao, dados, por)
  values (new.id, lower(tg_op), to_jsonb(new) - 'updated_at', auth.uid());
  return new;
end $$;
drop trigger if exists compras_historico_trg on compras;
create trigger compras_historico_trg after insert or update on compras for each row execute function compras_registrar_historico();
drop trigger if exists compras_sem_exclusao on compras;
create trigger compras_sem_exclusao before delete on compras for each row execute function compras_registrar_historico();
-- o updated_at precisa ser ajustado antes de gravar
create or replace function compras_atualizado() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
drop trigger if exists compras_atualizado_trg on compras;
create trigger compras_atualizado_trg before update on compras for each row execute function compras_atualizado();

alter table compras enable row level security;
alter table compras_historico enable row level security;
drop policy if exists "compras: admin" on compras;
create policy "compras: admin" on compras for select to authenticated using (is_admin());
drop policy if exists "compras: admin insere" on compras;
create policy "compras: admin insere" on compras for insert to authenticated with check (is_admin());
drop policy if exists "compras: admin altera" on compras;
create policy "compras: admin altera" on compras for update to authenticated using (is_admin()) with check (is_admin());
drop policy if exists "compras: aluno ve as suas" on compras;
create policy "compras: aluno ve as suas" on compras for select to authenticated using (user_id = auth.uid());
drop policy if exists "historico de compras: admin" on compras_historico;
create policy "historico de compras: admin" on compras_historico for select to authenticated using (is_admin());
grant select, insert, update on compras to authenticated;
grant select on compras_historico to authenticated;
grant usage on sequence compras_id_seq to authenticated;

-- Uso do aluno (prova de que estudou depois da compra)
create or replace function admin_uso_aluno(p_user uuid)
returns table (primeira timestamptz, ultima timestamptz, aulas integer, treinos integer, dias integer)
language plpgsql stable security definer set search_path = public as $$
begin
  perform _exige_admin();
  return query
  with ev as (
    select pr.concluida_em as em from progresso pr where pr.user_id = p_user
    union all select coalesce(t.finalizada_em, t.iniciada_em) from tentativas t where t.user_id = p_user
    union all select ip.updated_at from ingles_progresso ip where ip.user_id = p_user
    union all select o.created_at from opq_tentativas o where o.user_id = p_user
    union all select v.created_at from video_treinos v where v.user_id = p_user
  )
  select min(ev.em), max(ev.em),
         (select count(*)::int from progresso where user_id = p_user),
         (select count(*)::int from tentativas where user_id = p_user and finalizada_em is not null),
         count(distinct (ev.em at time zone 'America/Sao_Paulo')::date)::int
  from ev;
end $$;
revoke all on function admin_uso_aluno(uuid) from public, anon;
grant execute on function admin_uso_aluno(uuid) to authenticated;

-- Na exclusão da conta, guarda também o resumo de uso (o progresso em si é apagado)
alter table contas_excluidas add column if not exists primeira_atividade timestamptz;
alter table contas_excluidas add column if not exists ultima_atividade timestamptz;
alter table contas_excluidas add column if not exists aulas_concluidas integer;
alter table contas_excluidas add column if not exists treinos_feitos integer;
alter table contas_excluidas add column if not exists dias_de_estudo integer;
alter table contas_excluidas add column if not exists compras integer;

create or replace function excluir_minha_conta(p_ip text default null, p_navegador text default null)
returns table (envio_id bigint, telefone text, nome text, texto text)
language plpgsql security definer set search_path = public, auth as $$
declare
  uid uuid := auth.uid();
  v_tel text; v_nome text; v_completo text; v_escola text; v_cad timestamptz; v_email text; v_texto text; v_id bigint;
  v_pri timestamptz; v_ult timestamptz; v_aulas int; v_treinos int; v_dias int;
begin
  if uid is null then raise exception 'sem login'; end if;
  if exists (select 1 from profiles where id = uid and is_admin) then raise exception 'administradores não podem se excluir por aqui'; end if;
  select p.whatsapp, coalesce(nullif(trim(p.nome), ''), p.apelido), p.escola, p.created_at
    into v_tel, v_completo, v_escola, v_cad from profiles p where p.id = uid;
  select u.email into v_email from auth.users u where u.id = uid;
  v_nome := split_part(coalesce(v_completo, ''), ' ', 1);

  with ev as (
    select pr.concluida_em as em from progresso pr where pr.user_id = uid
    union all select coalesce(t.finalizada_em, t.iniciada_em) from tentativas t where t.user_id = uid
    union all select ip.updated_at from ingles_progresso ip where ip.user_id = uid
    union all select o.created_at from opq_tentativas o where o.user_id = uid
    union all select v.created_at from video_treinos v where v.user_id = uid
  )
  select min(em), max(em), count(distinct (em at time zone 'America/Sao_Paulo')::date) into v_pri, v_ult, v_dias from ev;
  select count(*) into v_aulas from progresso where user_id = uid;
  select count(*) into v_treinos from tentativas where user_id = uid and finalizada_em is not null;

  insert into contas_excluidas (user_id, nome, email, whatsapp, escola, cadastro_em, ip, navegador,
                                primeira_atividade, ultima_atividade, aulas_concluidas, treinos_feitos, dias_de_estudo, compras)
  values (uid, v_completo, v_email, v_tel, v_escola, v_cad, left(p_ip, 100), left(p_navegador, 300),
          v_pri, v_ult, v_aulas, v_treinos, v_dias, (select count(*) from compras c where c.user_id = uid));

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
select 'livro de compras pronto' as status;
