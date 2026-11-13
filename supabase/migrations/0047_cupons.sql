-- Cabin Crew · 0047 · Cupons de desconto (parceiros e escolas)
--   • desconto em % ou em R$, para todos os planos ou só alguns
--   • limite de usos e validade (início e fim)
--   • cada compra guarda o cupom usado e o valor do desconto (aparece no livro de compras)
-- O desconto do cupom vale sobre o preço do plano; o desconto do Pix é aplicado depois, por cima.
-- Pode rodar mais de uma vez.

create table if not exists cupons (
  codigo      text primary key check (codigo ~ '^[A-Z0-9_-]{3,30}$'),
  parceiro    text,                                   -- escola, parceiro ou campanha
  tipo        text not null check (tipo in ('percentual', 'valor')),
  valor       numeric(10,2) not null check (valor > 0),
  produtos    text[],                                 -- null = todos os planos
  limite_usos integer check (limite_usos is null or limite_usos > 0),
  inicio      timestamptz,
  fim         timestamptz,
  ativo       boolean not null default true,
  observacao  text,
  criado_por  uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (tipo <> 'percentual' or valor < 100)
);
alter table cupons enable row level security;
drop policy if exists "cupons: admin" on cupons;
create policy "cupons: admin" on cupons for all to authenticated using (is_admin()) with check (is_admin());
grant select, insert, update, delete on cupons to authenticated;

alter table compras add column if not exists cupom text;
alter table compras add column if not exists desconto_cupom numeric(10,2);
create index if not exists compras_cupom on compras (cupom) where cupom is not null;

-- Confere um cupom para um plano (usado na página Planos e no checkout, sem mostrar a lista de cupons)
create or replace function cupom_validar(p_codigo text, p_produto text)
returns table (ok boolean, motivo text, codigo text, tipo text, valor numeric)
language plpgsql stable security definer set search_path = public as $$
declare c cupons; v_usos int;
begin
  select * into c from cupons where cupons.codigo = upper(trim(coalesce(p_codigo, '')));
  if not found or not c.ativo then return query select false, 'Cupom inválido.', null::text, null::text, null::numeric; return; end if;
  if c.inicio is not null and now() < c.inicio then return query select false, 'Este cupom ainda não está valendo.', null::text, null::text, null::numeric; return; end if;
  if c.fim is not null and now() > c.fim then return query select false, 'Este cupom expirou.', null::text, null::text, null::numeric; return; end if;
  if c.produtos is not null and cardinality(c.produtos) > 0 and not (p_produto = any (c.produtos)) then
    return query select false, 'Este cupom não vale para este plano.', null::text, null::text, null::numeric; return;
  end if;
  if c.limite_usos is not null then
    select count(*) into v_usos from compras cp where cp.cupom = c.codigo and cp.status = 'aprovada';
    if v_usos >= c.limite_usos then return query select false, 'Os usos deste cupom se esgotaram.', null::text, null::text, null::numeric; return; end if;
  end if;
  return query select true, null::text, c.codigo, c.tipo, c.valor;
end $$;
revoke all on function cupom_validar(text, text) from public;
grant execute on function cupom_validar(text, text) to anon, authenticated;

-- Pagamento: grava também o cupom e o desconto
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
  v_curso text;
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
    if v_status not in ('aprovada', 'reembolsada', 'contestada') then
      return query select null::bigint, v_status, null::bigint, null::text, null::text, null::text; return;
    end if;
    select coalesce(nullif(trim(pr.nome), ''), pr.apelido), pr.whatsapp into v_nome, v_tel from profiles pr where pr.id = v_user;
    select u.email into v_email from auth.users u where u.id = v_user;
    insert into compras (user_id, nome, email, whatsapp, documento, produto, valor, forma_pagamento, parcelas, plataforma,
                         id_transacao, status, comprada_em, liberada_em, observacao, cupom, desconto_cupom)
    values (v_user, coalesce(v_nome, 'Aluno'), v_email, v_tel, nullif(p->>'cpf', ''), v_prod.nome,
            (p->>'valor')::numeric, coalesce(p->>'metodo', 'outro'), nullif(p->>'parcelas', '')::int, 'Mercado Pago',
            p->>'id', v_status, coalesce((p->>'aprovado_em')::timestamptz, now()),
            case when v_status = 'aprovada' then now() end,
            case when (p->>'total_pago')::numeric > (p->>'valor')::numeric
                 then 'Total pago pelo aluno com juros do parcelamento: R$ ' || replace(to_char((p->>'total_pago')::numeric, 'FM9999990.00'), '.', ',') end,
            nullif(upper(p->>'cupom'), ''), nullif(p->>'desconto_cupom', '')::numeric)
    returning * into v_compra;
  elsif v_compra.status is distinct from v_status and v_status <> 'pendente' and v_status <> 'recusada' then
    update compras set status = v_status,
           liberada_em = coalesce(liberada_em, case when v_status = 'aprovada' then now() end),
           observacao = concat_ws(' · ', nullif(observacao, ''), 'Status no Mercado Pago: ' || (p->>'status') || ' em ' || to_char(now() at time zone 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI'))
     where id = v_compra.id returning * into v_compra;
  end if;

  if v_compra.status = 'aprovada' and v_era is distinct from 'aprovada' and v_user is not null then
    foreach v_curso in array coalesce(v_prod.inclui, array[v_prod.slug]) loop
      insert into acessos (user_id, produto, status, compra_id)
      values (v_user, v_curso, 'ativo', v_compra.id)
      on conflict (user_id, produto) do update
        set status = 'ativo', compra_id = excluded.compra_id, liberado_em = now(), encerrado_em = null, motivo = null,
            concluido_em = null, expira_em = null
        where acessos.compra_id is distinct from excluded.compra_id;
    end loop;
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


notify pgrst, 'reload schema';
select 'cupons prontos' as status;
