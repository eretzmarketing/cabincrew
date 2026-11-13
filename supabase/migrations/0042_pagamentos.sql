-- Cabin Crew · 0042 · Pagamentos (Mercado Pago), produtos com preço e acesso ao Head Hunter
--   • produtos: preço e desconto no Pix definidos no admin
--   • acessos: quem pode usar o Head Hunter (liberado pela compra, encerrado ao concluir a jornada)
--   • mp_registrar_pagamento: grava a compra no livro de compras e libera o acesso
--     (chamada só pelo servidor do site, com uma chave secreta que fica no servidor)
-- Pode rodar mais de uma vez.

-- ---------- Produtos ----------
create table if not exists produtos (
  slug         text primary key check (slug ~ '^[a-z0-9-]{2,40}$'),
  nome         text not null,
  descricao    text,
  preco        numeric(10,2) not null check (preco >= 1),
  desconto_pix numeric(5,2) not null default 0 check (desconto_pix between 0 and 50),   -- em %
  ativo        boolean not null default true,
  updated_at   timestamptz not null default now()
);
alter table produtos enable row level security;
drop policy if exists "produtos: todos veem" on produtos;
create policy "produtos: todos veem" on produtos for select using (true);
drop policy if exists "produtos: admin" on produtos;
create policy "produtos: admin" on produtos for all to authenticated using (is_admin()) with check (is_admin());
grant select on produtos to anon, authenticated;
grant insert, update on produtos to authenticated;

alter table produtos add column if not exists dias_apos_conclusao integer not null default 30 check (dias_apos_conclusao between 0 and 365);

insert into produtos (slug, nome, descricao, preco, desconto_pix) values
  ('head-hunter', 'Head Hunter', 'Preparatório completo para a seleção de comissário(a) de voo: jornada personalizada, simulados, dinâmicas, entrevista e Inglês a bordo.', 250, 5)
on conflict (slug) do nothing;

-- ---------- Acessos ----------
create table if not exists acessos (
  user_id      uuid not null references profiles(id) on delete cascade,
  produto      text not null references produtos(slug),
  status       text not null default 'ativo' check (status in ('ativo', 'concluido', 'revogado')),
  compra_id    bigint references compras(id),
  liberado_em  timestamptz not null default now(),
  encerrado_em timestamptz,
  motivo       text,
  primary key (user_id, produto)
);
alter table acessos add column if not exists concluido_em timestamptz;   -- concluiu toda a jornada
alter table acessos add column if not exists expira_em timestamptz;      -- fim dos dias extras para revisar
alter table acessos enable row level security;
drop policy if exists "acessos: o proprio" on acessos;
create policy "acessos: o proprio" on acessos for select to authenticated using (user_id = auth.uid() or is_admin());
drop policy if exists "acessos: admin" on acessos;
create policy "acessos: admin" on acessos for all to authenticated using (is_admin()) with check (is_admin());
grant select, insert, update, delete on acessos to authenticated;

-- Quem pode usar o Head Hunter: admin, "liberado para todos" (configuração) ou acesso ativo
create or replace function hh_tem_acesso(p_user uuid default auth.uid()) returns boolean
language sql stable security definer set search_path = public as $$
  select p_user is not null and (
    exists (select 1 from profiles where id = p_user and is_admin)
    or (
      not esta_bloqueado(p_user)
      and (
        coalesce((select valor = 'true'::jsonb from configuracoes where chave = 'crew_select_aberto'), false)
        or exists (select 1 from acessos where user_id = p_user and produto = 'head-hunter' and status = 'ativo'
                   and (expira_em is null or expira_em > now()))
      )
    )
  );
$$;
revoke all on function hh_tem_acesso(uuid) from public, anon;
grant execute on function hh_tem_acesso(uuid) to authenticated;

-- O aluno concluiu toda a jornada: o acesso continua por mais alguns dias (para revisar) e depois termina.
-- Devolve a data em que o acesso termina (ou nada, se não havia acesso comprado ativo).
drop function if exists hh_concluir_acesso();
create or replace function hh_concluir_acesso() returns timestamptz
language plpgsql security definer set search_path = public as $$
declare v_dias int; v_fim timestamptz;
begin
  select coalesce(dias_apos_conclusao, 30) into v_dias from produtos where slug = 'head-hunter';
  update acessos a
     set concluido_em = now(), expira_em = now() + make_interval(days => coalesce(v_dias, 30)),
         status = case when coalesce(v_dias, 30) = 0 then 'concluido' else a.status end,
         encerrado_em = case when coalesce(v_dias, 30) = 0 then now() else a.encerrado_em end,
         motivo = 'concluiu toda a jornada'
   where a.user_id = auth.uid() and a.produto = 'head-hunter' and a.status = 'ativo' and a.concluido_em is null
  returning a.expira_em into v_fim;
  return v_fim;
end $$;
revoke all on function hh_concluir_acesso() from public, anon;
grant execute on function hh_concluir_acesso() to authenticated;

-- As aulas só aparecem para quem tem acesso (também protege a API)
drop policy if exists "logado ve publicadas" on aulas;
create policy "logado ve publicadas" on aulas for select to authenticated
  using (is_admin() or (publicado and hh_tem_acesso() and exists (select 1 from modulos m where m.id = modulo_id and m.publicado)));

create or replace function simulado_liberado(p_simulado smallint) returns boolean
language sql stable security definer set search_path = public as $$
  select is_admin() or (
    not esta_bloqueado()
    and hh_tem_acesso()
    and exists (select 1 from profiles where id = auth.uid() and avatar_em is not null)
    and exists (
      select 1 from aulas a join modulos m on m.id = a.modulo_id
      where a.simulado_id = p_simulado and a.publicado and m.publicado
    )
    and (
      coalesce((select origem from simulados where id = p_simulado), '') not like 'cc-anac%'
      or anac_liberado()
    )
  );
$$;

-- ---------- Chave secreta do servidor (só o hash fica no banco) ----------
create table if not exists pagamentos_chave (
  id    smallint primary key default 1 check (id = 1),
  hash  text not null,
  em    timestamptz not null default now()
);
alter table pagamentos_chave enable row level security;   -- sem políticas: ninguém lê pela API

create or replace function pagamento_definir_chave(p_hash text) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform _exige_admin();
  if p_hash !~ '^[a-f0-9]{64}$' then raise exception 'chave inválida'; end if;
  insert into pagamentos_chave (id, hash) values (1, p_hash)
  on conflict (id) do update set hash = excluded.hash, em = now();
end $$;
revoke all on function pagamento_definir_chave(text) from public, anon;
grant execute on function pagamento_definir_chave(text) to authenticated;

create or replace function _confere_chave(p_chave text) returns void
language plpgsql stable security definer set search_path = public as $$
begin
  if p_chave is null or not exists (
    select 1 from pagamentos_chave where hash = encode(sha256(convert_to(p_chave, 'UTF8')), 'hex')
  ) then raise exception 'acesso negado'; end if;
end $$;
revoke all on function _confere_chave(text) from public, anon, authenticated;

-- ---------- Registro do pagamento (chamado pelo servidor do site) ----------
-- p: id, status (do Mercado Pago), metodo (pix|cartao_credito|cartao_debito|boleto|outro), valor, total_pago,
--    parcelas, user_id, produto, aprovado_em, cpf
create or replace function mp_registrar_pagamento(p_chave text, p jsonb)
returns table (compra_id bigint, situacao text, envio_id bigint, telefone text, nome text, texto text)
language plpgsql security definer set search_path = public, auth as $$
declare
  v_user uuid := (p->>'user_id')::uuid;
  v_prod produtos;
  v_status text;
  v_compra compras;
  v_nome text; v_email text; v_tel text;
  v_envio bigint; v_texto text;
  v_era text;
begin
  perform _confere_chave(p_chave);
  select * into v_prod from produtos where slug = coalesce(p->>'produto', 'head-hunter');
  if not found then raise exception 'produto inexistente'; end if;

  v_status := case p->>'status'
    when 'approved' then 'aprovada' when 'authorized' then 'aprovada'
    when 'refunded' then 'reembolsada' when 'charged_back' then 'contestada'
    when 'cancelled' then 'cancelada' when 'rejected' then 'recusada'
    else 'pendente' end;

  select * into v_compra from compras c where lower(c.plataforma) = 'mercado pago' and c.id_transacao = p->>'id';
  v_era := v_compra.status;

  if v_compra.id is null then
    -- no livro só entra o que foi pago (Pix gerado e não pago, ou cartão recusado, não é compra)
    if v_status not in ('aprovada', 'reembolsada', 'contestada') then
      return query select null::bigint, v_status, null::bigint, null::text, null::text, null::text; return;
    end if;
    select coalesce(nullif(trim(pr.nome), ''), pr.apelido), pr.whatsapp into v_nome, v_tel from profiles pr where pr.id = v_user;
    select u.email into v_email from auth.users u where u.id = v_user;
    insert into compras (user_id, nome, email, whatsapp, documento, produto, valor, forma_pagamento, parcelas, plataforma,
                         id_transacao, status, comprada_em, liberada_em, observacao)
    values (v_user, coalesce(v_nome, 'Aluno'), v_email, v_tel, nullif(p->>'cpf', ''), v_prod.nome,
            (p->>'valor')::numeric, coalesce(p->>'metodo', 'outro'), nullif(p->>'parcelas', '')::int, 'Mercado Pago',
            p->>'id', v_status, coalesce((p->>'aprovado_em')::timestamptz, now()),
            case when v_status = 'aprovada' then now() end,
            case when (p->>'total_pago')::numeric > (p->>'valor')::numeric
                 then 'Total pago pelo aluno com juros do parcelamento: R$ ' || replace(to_char((p->>'total_pago')::numeric, 'FM9999990.00'), '.', ',') end)
    returning * into v_compra;
  elsif v_compra.status is distinct from v_status and v_status <> 'pendente' and v_status <> 'recusada' then
    update compras set status = v_status,
           liberada_em = coalesce(liberada_em, case when v_status = 'aprovada' then now() end),
           observacao = concat_ws(' · ', nullif(observacao, ''), 'Status no Mercado Pago: ' || (p->>'status') || ' em ' || to_char(now() at time zone 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI'))
     where id = v_compra.id returning * into v_compra;
  end if;

  if v_compra.status = 'aprovada' and v_era is distinct from 'aprovada' and v_user is not null then
    -- libera o acesso (uma nova compra reabre um acesso concluído)
    insert into acessos (user_id, produto, status, compra_id)
    values (v_user, v_prod.slug, 'ativo', v_compra.id)
    on conflict (user_id, produto) do update
      set status = 'ativo', compra_id = excluded.compra_id, liberado_em = now(), encerrado_em = null, motivo = null,
          concluido_em = null, expira_em = null
      where acessos.compra_id is distinct from excluded.compra_id;
    -- confirmação no WhatsApp (uma vez por compra)
    select m.texto into v_texto from whatsapp_modelos m where m.evento = 'compra_aprovada' and m.ativo;
    select pr.whatsapp, split_part(coalesce(nullif(trim(pr.nome), ''), pr.apelido, ''), ' ', 1) into v_tel, v_nome from profiles pr where pr.id = v_user;
    if v_texto is not null and coalesce(v_tel, '') <> '' then
      insert into whatsapp_envios (user_id, evento, ref, telefone) values (v_user, 'compra_aprovada', p->>'id', v_tel)
      on conflict do nothing returning id into v_envio;
    end if;
  elsif v_compra.status in ('reembolsada', 'contestada', 'cancelada') and v_era is distinct from v_compra.status then
    update acessos a set status = 'revogado', encerrado_em = now(), motivo = 'compra ' || v_compra.status
     where a.user_id = v_compra.user_id and a.compra_id = v_compra.id and a.status = 'ativo';
  end if;

  return query select v_compra.id, v_compra.status, v_envio, case when v_envio is not null then v_tel end,
                      case when v_envio is not null then v_nome end, case when v_envio is not null then v_texto end;
end $$;
revoke all on function mp_registrar_pagamento(text, jsonb) from public;
grant execute on function mp_registrar_pagamento(text, jsonb) to anon, authenticated;

-- resultado do WhatsApp de confirmação (enviado pelo servidor, sem a sessão do aluno)
create or replace function mp_whatsapp_resultado(p_chave text, p_id bigint, p_status text, p_texto text, p_erro text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform _confere_chave(p_chave);
  update whatsapp_envios set status = p_status, texto = left(p_texto, 4000), erro = left(p_erro, 500)
   where id = p_id and evento = 'compra_aprovada' and p_status in ('enviada', 'erro', 'sem_whatsapp');
end $$;
revoke all on function mp_whatsapp_resultado(text, bigint, text, text, text) from public;
grant execute on function mp_whatsapp_resultado(text, bigint, text, text, text) to anon, authenticated;

insert into whatsapp_modelos (evento, titulo, quando, texto) values
  ('compra_aprovada', 'Compra aprovada', 'Quando o pagamento do Head Hunter é aprovado no Mercado Pago.',
   E'✈️ Pagamento confirmado, {nome}! Seu acesso ao Head Hunter está liberado.\n\n👨‍✈️ Comece pelo check-in: em 2 minutos você escolhe a companhia e monta a sua jornada até a aprovação.\n👉 {link}/head-hunter\n\n🧾 Compra: {produto} · {valor} · {forma}\n\n📲 Salve este número na sua agenda para receber todos os avisos da Cabin Crew.')
on conflict (evento) do nothing;

-- configuração: o texto da chave passa a dizer o que ela faz agora
update configuracoes set descricao = 'Head Hunter liberado para todos os cadastrados, sem pagamento' where chave = 'crew_select_aberto';

notify pgrst, 'reload schema';
select 'pagamentos prontos' as status, (select preco from produtos where slug = 'head-hunter') as preco_head_hunter;
