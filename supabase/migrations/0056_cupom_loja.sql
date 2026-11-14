-- Cabin Crew · 0056 · Cupons também nas apostilas (loja)
--   • no admin, o cupom pode valer para apostilas específicas ou para "Todas as apostilas"
--   • cupom sem nenhum plano marcado continua valendo só para os cursos (não vale nas apostilas)
--   • o desconto vale sobre o valor dos produtos (o frete não tem desconto); o Pix continua com o desconto dele por cima
-- Rode depois do 0055_loja.sql. Pode rodar mais de uma vez.

alter table loja_pedidos add column if not exists cupom text;
alter table loja_pedidos add column if not exists desconto_cupom numeric(10,2);

create or replace function cupom_validar(p_codigo text, p_produto text)
returns table (ok boolean, motivo text, codigo text, tipo text, valor numeric)
language plpgsql stable security definer set search_path = public as $$
declare c cupons; v_usos int; v_loja boolean := p_produto like 'loja:%';
begin
  select * into c from cupons where cupons.codigo = upper(trim(coalesce(p_codigo, '')));
  if not found or not c.ativo then return query select false, 'Cupom inválido.', null::text, null::text, null::numeric; return; end if;
  if c.inicio is not null and now() < c.inicio then return query select false, 'Este cupom ainda não está valendo.', null::text, null::text, null::numeric; return; end if;
  if c.fim is not null and now() > c.fim then return query select false, 'Este cupom expirou.', null::text, null::text, null::numeric; return; end if;
  if v_loja then
    -- apostilas: só se o cupom foi marcado para elas
    if not (coalesce(c.produtos, '{}') && array[p_produto, 'loja:*']) then
      return query select false, 'Este cupom não vale para esta apostila.', null::text, null::text, null::numeric; return;
    end if;
  elsif c.produtos is not null and cardinality(c.produtos) > 0 and not (p_produto = any (c.produtos)) then
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

drop function if exists loja_criar_pedido(text, integer, jsonb);
create or replace function loja_criar_pedido(p_produto text, p_quantidade integer, p_dados jsonb, p_cupom text default null)
returns loja_pedidos language plpgsql security definer set search_path = public, auth as $$
declare
  v_prod loja_produtos; v_ped loja_pedidos; v_qtd int := greatest(1, least(20, coalesce(p_quantidade, 1)));
  v_itens numeric; v_final numeric; v_desc numeric := 0; v_email text; e jsonb := coalesce(p_dados->'endereco', '{}'::jsonb);
  c record;
begin
  if auth.uid() is null then raise exception 'Entre na sua conta para comprar.'; end if;
  if esta_bloqueado() then raise exception 'Conta bloqueada.'; end if;
  select * into v_prod from loja_produtos where slug = p_produto and ativo and not excluido;
  if not found then raise exception 'Produto indisponível.'; end if;
  if v_prod.estoque is not null and v_prod.estoque < v_qtd then raise exception 'Estoque insuficiente para essa quantidade.'; end if;
  if length(regexp_replace(coalesce(e->>'cep', ''), '\D', '', 'g')) <> 8 or coalesce(trim(e->>'rua'), '') = '' or coalesce(trim(e->>'numero'), '') = ''
     or coalesce(trim(e->>'cidade'), '') = '' or coalesce(e->>'uf', '') !~ '^[A-Z]{2}$' then
    raise exception 'Preencha o endereço completo (CEP, rua, número, cidade e UF).';
  end if;
  if length(trim(coalesce(p_dados->>'nome', ''))) < 5 then raise exception 'Informe o nome completo de quem vai receber.'; end if;
  select u.email into v_email from auth.users u where u.id = auth.uid();
  v_itens := v_prod.preco * v_qtd;
  v_final := v_itens;
  -- cupom: conferido aqui e aplicado sobre o valor dos produtos (o frete não tem desconto)
  if coalesce(trim(p_cupom), '') <> '' then
    select * into c from cupom_validar(p_cupom, 'loja:' || v_prod.slug);
    if not c.ok then raise exception '%', c.motivo; end if;
    v_final := greatest(1, round(v_itens - case when c.tipo = 'percentual' then v_itens * c.valor / 100 else c.valor end, 2));
    v_desc := v_itens - v_final;
  end if;
  insert into loja_pedidos (user_id, produto, produto_nome, quantidade, valor_itens, frete, total, total_pix,
                            nome, cpf, telefone, email, endereco, cupom, desconto_cupom)
  values (auth.uid(), v_prod.slug, v_prod.nome, v_qtd, v_itens, v_prod.frete, v_final + v_prod.frete,
          round(v_final * (100 - v_prod.desconto_pix)) / 100 + v_prod.frete,
          left(trim(p_dados->>'nome'), 120), nullif(regexp_replace(coalesce(p_dados->>'cpf', ''), '\D', '', 'g'), ''),
          nullif(left(trim(coalesce(p_dados->>'telefone', '')), 30), ''), v_email,
          jsonb_build_object(
            'cep', regexp_replace(e->>'cep', '\D', '', 'g'), 'rua', left(trim(e->>'rua'), 150), 'numero', left(trim(e->>'numero'), 20),
            'complemento', left(trim(coalesce(e->>'complemento', '')), 80), 'bairro', left(trim(coalesce(e->>'bairro', '')), 80),
            'cidade', left(trim(e->>'cidade'), 80), 'uf', e->>'uf'),
          case when v_desc > 0 or coalesce(trim(p_cupom), '') <> '' then upper(trim(p_cupom)) end, nullif(v_desc, 0))
  returning * into v_ped;
  return v_ped;
end $$;

revoke all on function loja_criar_pedido(text, integer, jsonb, text) from public, anon;
grant execute on function loja_criar_pedido(text, integer, jsonb, text) to authenticated;

create or replace function loja_registrar_pagamento(p_chave text, p jsonb)
returns table (pedido_id bigint, situacao text, envio_id bigint, telefone text, nome text, texto text)
language plpgsql security definer set search_path = public as $$
declare
  v_ped loja_pedidos; v_era text; v_novo text; v_envio bigint; v_texto text; v_tel text; v_nome text;
begin
  perform _confere_chave(p_chave);
  select * into v_ped from loja_pedidos where id = (p->>'pedido')::bigint;
  if not found then return query select null::bigint, 'ignorado'::text, null::bigint, null::text, null::text, null::text; return; end if;
  v_era := v_ped.status;
  v_novo := case p->>'status'
    when 'approved' then 'pago' when 'authorized' then 'pago'
    when 'refunded' then 'reembolsado' when 'charged_back' then 'reembolsado'
    else null end;

  if v_novo = 'pago' and v_era = 'aguardando' then
    -- o valor pago precisa cobrir o pedido (Pix com desconto ou cartão)
    if (p->>'valor')::numeric + 0.01 < least(v_ped.total, v_ped.total_pix) then
      update loja_pedidos set observacao = concat_ws(' · ', observacao, 'Valor pago menor que o do pedido: R$ ' || (p->>'valor')) where id = v_ped.id;
      return query select v_ped.id, 'divergente'::text, null::bigint, null::text, null::text, null::text; return;
    end if;
    update loja_pedidos set status = 'pago', pago_em = now(), mp_id = coalesce(mp_id, p->>'id'), pago_valor = (p->>'valor')::numeric,
           metodo = coalesce(nullif(p->>'metodo', ''), metodo)
     where id = v_ped.id returning * into v_ped;
    update loja_produtos set estoque = estoque - v_ped.quantidade where slug = v_ped.produto and estoque is not null;
    -- também no livro de compras (Financeiro › Compras)
    insert into compras (user_id, nome, email, whatsapp, documento, produto, valor, forma_pagamento, plataforma, id_transacao, status, comprada_em, liberada_em, observacao, cupom, desconto_cupom)
    values (v_ped.user_id, v_ped.nome, v_ped.email, v_ped.telefone, v_ped.cpf, 'Loja: ' || v_ped.produto_nome || case when v_ped.quantidade > 1 then ' (' || v_ped.quantidade || ' un.)' else '' end,
            v_ped.pago_valor, coalesce(v_ped.metodo, 'outro'), 'Mercado Pago', p->>'id', 'aprovada', now(), now(), 'Pedido da loja nº ' || v_ped.id,
            v_ped.cupom, v_ped.desconto_cupom)
    on conflict do nothing;
    select m.texto into v_texto from whatsapp_modelos m where m.evento = 'loja_pago' and m.ativo;
    select coalesce(nullif(v_ped.telefone, ''), pr.whatsapp), split_part(v_ped.nome, ' ', 1) into v_tel, v_nome from profiles pr where pr.id = v_ped.user_id;
    if v_texto is not null and coalesce(v_tel, '') <> '' then
      insert into whatsapp_envios (user_id, evento, ref, telefone) values (v_ped.user_id, 'loja_pago', v_ped.id::text, v_tel)
      on conflict do nothing returning id into v_envio;
    end if;
  elsif v_novo = 'reembolsado' and v_era in ('pago', 'enviado', 'entregue') then
    update loja_pedidos set status = 'reembolsado', observacao = concat_ws(' · ', observacao, 'Reembolsado no Mercado Pago em ' || to_char(now() at time zone 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI'))
     where id = v_ped.id returning * into v_ped;
    update compras set status = 'reembolsada' where lower(plataforma) = 'mercado pago' and id_transacao = p->>'id';
  end if;

  return query select v_ped.id, v_ped.status, v_envio, case when v_envio is not null then v_tel end,
                      case when v_envio is not null then v_nome end, case when v_envio is not null then v_texto end;
end $$;


notify pgrst, 'reload schema';
select 'cupons nas apostilas prontos' as status;
