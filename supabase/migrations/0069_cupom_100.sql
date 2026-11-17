-- Cabin Crew · 0069 · Cupom de até 100% e validade com horário
--   • o cupom em % agora pode ser de 100% (antes ia até 99%)
--   • curso com cupom de 100%: o aluno confirma e o acesso é liberado na hora, sem Mercado Pago
--     (fica no Financeiro › Compras com valor R$ 0,00, plataforma "Cupom 100%", e conta no limite de usos)
--   • apostila com cupom de 100%: os produtos saem grátis; o frete continua sendo cobrado (se o frete for zero, o pedido sai grátis)
--   • o horário da validade é gravado pelo admin (a coluna já guardava data e hora)
-- Pode rodar mais de uma vez.

-- 1) libera 100%: tira a regra antiga "menor que 100" e põe "até 100"
do $$
declare r record;
begin
  for r in select conname from pg_constraint
            where conrelid = 'public.cupons'::regclass and contype = 'c'
              and pg_get_constraintdef(oid) ilike '%percentual%' and pg_get_constraintdef(oid) ilike '%100%'
  loop
    execute format('alter table cupons drop constraint %I', r.conname);
  end loop;
end $$;
alter table cupons add constraint cupons_percentual_ate_100 check (tipo <> 'percentual' or valor <= 100);

-- 2) curso grátis com cupom de 100%: confere tudo de novo no banco e libera o acesso
create or replace function cupom_liberar_gratis(p_produto text, p_cupom text)
returns table (compra_id bigint, situacao text, envio_id bigint, telefone text, nome text, texto text)
language plpgsql security definer set search_path = public, auth as $$
declare
  v_user uuid := auth.uid();
  v_prod produtos; v_compra compras; c record;
  v_desc numeric; v_nome text; v_email text; v_tel text; v_envio bigint; v_texto text; v_curso text;
begin
  if v_user is null then raise exception 'Entre na sua conta para continuar.'; end if;
  if esta_bloqueado() then raise exception 'Conta bloqueada.'; end if;
  select * into v_prod from produtos where slug = p_produto and ativo and not coalesce(excluido, false);
  if not found then raise exception 'Produto indisponível.'; end if;
  if (select bool_and(exists (select 1 from acessos a where a.user_id = v_user and a.produto = x and a.status = 'ativo'))
        from unnest(coalesce(v_prod.inclui, array[v_prod.slug])) x) then
    raise exception 'Você já tem acesso a %.', v_prod.nome;
  end if;

  select * into c from cupom_validar(p_cupom, p_produto);
  if not c.ok then raise exception '%', c.motivo; end if;
  v_desc := case when c.tipo = 'percentual' then v_prod.preco * c.valor / 100 else c.valor end;
  if round(v_prod.preco - v_desc, 2) > 0 then raise exception 'Este cupom não deixa o curso grátis.'; end if;

  -- trava para não liberar duas vezes ao mesmo tempo
  perform pg_advisory_xact_lock(hashtext('cupom-gratis:' || v_user || ':' || p_produto));

  select coalesce(nullif(trim(pr.nome), ''), pr.apelido), pr.whatsapp into v_nome, v_tel from profiles pr where pr.id = v_user;
  select u.email into v_email from auth.users u where u.id = v_user;
  insert into compras (user_id, nome, email, whatsapp, produto, valor, forma_pagamento, plataforma, id_transacao, status,
                       comprada_em, liberada_em, observacao, cupom, desconto_cupom)
  values (v_user, coalesce(v_nome, 'Aluno'), v_email, v_tel, v_prod.nome, 0, 'outro', 'Cupom 100%',
          'CUPOM-' || c.codigo || '-' || p_produto || '-' || v_user || '-' || extract(epoch from now())::bigint,
          'aprovada', now(), now(), 'Liberado com cupom de 100% (' || c.codigo || ')', c.codigo, v_prod.preco)
  returning * into v_compra;

  foreach v_curso in array coalesce(v_prod.inclui, array[v_prod.slug]) loop
    insert into acessos (user_id, produto, status, compra_id)
    values (v_user, v_curso, 'ativo', v_compra.id)
    on conflict (user_id, produto) do update
      set status = 'ativo', compra_id = excluded.compra_id, liberado_em = now(), encerrado_em = null, motivo = null,
          concluido_em = null, expira_em = null
      where acessos.status is distinct from 'ativo';
  end loop;

  select m.texto into v_texto from whatsapp_modelos m where m.evento = 'compra_aprovada' and m.ativo;
  select pr.whatsapp, split_part(coalesce(nullif(trim(pr.nome), ''), pr.apelido, ''), ' ', 1) into v_tel, v_nome from profiles pr where pr.id = v_user;
  if v_texto is not null and coalesce(v_tel, '') <> '' then
    insert into whatsapp_envios (user_id, evento, ref, telefone) values (v_user, 'compra_aprovada', 'cupom-' || v_compra.id, v_tel)
    on conflict do nothing returning id into v_envio;
  end if;

  return query select v_compra.id, 'aprovada'::text, v_envio, case when v_envio is not null then v_tel end,
                      case when v_envio is not null then v_nome end, case when v_envio is not null then v_texto end;
end $$;
revoke all on function cupom_liberar_gratis(text, text) from public, anon;
grant execute on function cupom_liberar_gratis(text, text) to authenticated;

-- 3) apostilas: com 100%, os produtos saem por R$ 0,00 (o frete continua)
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
    v_final := round(v_itens - case when c.tipo = 'percentual' then v_itens * c.valor / 100 else c.valor end, 2);
    -- 100% (ou mais que o valor): os produtos saem grátis; senão, mínimo de R$ 1,00 (Mercado Pago)
    v_final := case when v_final <= 0 then 0 else greatest(1, v_final) end;
    v_desc := v_itens - v_final;
  end if;
  insert into loja_pedidos (user_id, produto, produto_nome, quantidade, valor_itens, frete, total, total_pix,
                            nome, cpf, telefone, email, endereco, cupom, desconto_cupom)
  values (auth.uid(), v_prod.slug, v_prod.nome, v_qtd, v_itens, v_prod.frete, v_final + v_prod.frete,
          case when v_final = 0 then 0 else round(v_final * (100 - v_prod.desconto_pix)) / 100 end + v_prod.frete,
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


notify pgrst, 'reload schema';
select 'cupom de 100% e horário prontos' as status;
