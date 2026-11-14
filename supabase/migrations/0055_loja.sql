-- Cabin Crew · 0055 · Loja de apostilas físicas (enviadas pelos Correios)
--   • loja_produtos: o que está à venda (preço, fotos, frete, prazo)
--   • loja_pedidos: cada compra, com endereço de entrega, situação e código de rastreio
--   • o preço é sempre calculado aqui no banco; o pagamento é confirmado pelo Mercado Pago (chave do site)
--   • avisos de WhatsApp: pagamento confirmado e pedido enviado (com o rastreio)
-- Pode rodar mais de uma vez.

-- ---------------------------------------------------------------- produtos
create table if not exists loja_produtos (
  slug         text primary key check (slug ~ '^[a-z0-9-]{2,60}$'),
  nome         text not null,
  resumo       text,
  descricao    text,
  preco        numeric(10,2) not null check (preco >= 1),
  preco_de     numeric(10,2),                                  -- preço "de" riscado (opcional)
  desconto_pix numeric(5,2) not null default 0 check (desconto_pix between 0 and 50),
  imagens      text[] not null default '{}',                   -- a primeira é a capa
  frete        numeric(10,2) not null default 0 check (frete >= 0),   -- 0 = frete grátis
  prazo        text not null default 'Postagem em até 3 dias úteis após o pagamento. Entrega pelos Correios em todo o Brasil.',
  estoque      integer,                                        -- vazio = sem controle de estoque
  ativo        boolean not null default true,
  excluido     boolean not null default false,
  ordem        integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table loja_produtos enable row level security;
drop policy if exists "loja produtos: todos veem os ativos" on loja_produtos;
create policy "loja produtos: todos veem os ativos" on loja_produtos for select using ((ativo and not excluido) or is_admin());
drop policy if exists "loja produtos: admin" on loja_produtos;
create policy "loja produtos: admin" on loja_produtos for all to authenticated using (is_admin()) with check (is_admin());
grant select on loja_produtos to anon, authenticated;
grant insert, update, delete on loja_produtos to authenticated;

-- ---------------------------------------------------------------- pedidos
create table if not exists loja_pedidos (
  id            bigserial primary key,
  user_id       uuid references profiles(id) on delete set null,
  produto       text not null references loja_produtos(slug),
  produto_nome  text not null,
  quantidade    integer not null default 1 check (quantidade between 1 and 20),
  valor_itens   numeric(10,2) not null,
  frete         numeric(10,2) not null default 0,
  total         numeric(10,2) not null,          -- cartão
  total_pix     numeric(10,2) not null,          -- com o desconto do Pix
  status        text not null default 'aguardando' check (status in ('aguardando', 'pago', 'enviado', 'entregue', 'cancelado', 'reembolsado')),
  metodo        text,
  pago_valor    numeric(10,2),
  mp_id         text unique,
  nome          text not null,                   -- destinatário
  cpf           text,
  telefone      text,
  email         text,
  endereco      jsonb not null,                  -- cep, rua, numero, complemento, bairro, cidade, uf
  rastreio      text,
  observacao    text,
  criado_em     timestamptz not null default now(),
  pago_em       timestamptz,
  enviado_em    timestamptz,
  entregue_em   timestamptz
);
create index if not exists loja_pedidos_user on loja_pedidos (user_id, criado_em desc);
create index if not exists loja_pedidos_status on loja_pedidos (status, criado_em desc);
alter table loja_pedidos enable row level security;
drop policy if exists "loja pedidos: o proprio ou admin" on loja_pedidos;
create policy "loja pedidos: o proprio ou admin" on loja_pedidos for select to authenticated using (user_id = auth.uid() or is_admin());
drop policy if exists "loja pedidos: admin altera" on loja_pedidos;
create policy "loja pedidos: admin altera" on loja_pedidos for update to authenticated using (is_admin()) with check (is_admin());
grant select, update on loja_pedidos to authenticated;

-- O aluno cria o pedido: preço, frete e desconto vêm do cadastro do produto, nunca do navegador.
create or replace function loja_criar_pedido(p_produto text, p_quantidade integer, p_dados jsonb)
returns loja_pedidos language plpgsql security definer set search_path = public, auth as $$
declare
  v_prod loja_produtos; v_ped loja_pedidos; v_qtd int := greatest(1, least(20, coalesce(p_quantidade, 1)));
  v_itens numeric; v_email text; e jsonb := coalesce(p_dados->'endereco', '{}'::jsonb);
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
  insert into loja_pedidos (user_id, produto, produto_nome, quantidade, valor_itens, frete, total, total_pix,
                            nome, cpf, telefone, email, endereco)
  values (auth.uid(), v_prod.slug, v_prod.nome, v_qtd, v_itens, v_prod.frete, v_itens + v_prod.frete,
          round((v_itens * (100 - v_prod.desconto_pix) / 100) + v_prod.frete, 2),
          left(trim(p_dados->>'nome'), 120), nullif(regexp_replace(coalesce(p_dados->>'cpf', ''), '\D', '', 'g'), ''),
          nullif(left(trim(coalesce(p_dados->>'telefone', '')), 30), ''), v_email,
          jsonb_build_object(
            'cep', regexp_replace(e->>'cep', '\D', '', 'g'), 'rua', left(trim(e->>'rua'), 150), 'numero', left(trim(e->>'numero'), 20),
            'complemento', left(trim(coalesce(e->>'complemento', '')), 80), 'bairro', left(trim(coalesce(e->>'bairro', '')), 80),
            'cidade', left(trim(e->>'cidade'), 80), 'uf', e->>'uf'))
  returning * into v_ped;
  return v_ped;
end $$;
revoke all on function loja_criar_pedido(text, integer, jsonb) from public, anon;
grant execute on function loja_criar_pedido(text, integer, jsonb) to authenticated;

-- O servidor do site liga o pagamento criado no Mercado Pago ao pedido
create or replace function loja_ligar_pagamento(p_chave text, p_pedido bigint, p_mp text, p_metodo text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform _confere_chave(p_chave);
  update loja_pedidos set mp_id = p_mp, metodo = p_metodo where id = p_pedido and status = 'aguardando';
end $$;
revoke all on function loja_ligar_pagamento(text, bigint, text, text) from public;
grant execute on function loja_ligar_pagamento(text, bigint, text, text) to anon, authenticated;

-- Pagamento confirmado (ou reembolsado) no Mercado Pago. p: id, status, valor, pedido, metodo
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
    insert into compras (user_id, nome, email, whatsapp, documento, produto, valor, forma_pagamento, plataforma, id_transacao, status, comprada_em, liberada_em, observacao)
    values (v_ped.user_id, v_ped.nome, v_ped.email, v_ped.telefone, v_ped.cpf, 'Loja: ' || v_ped.produto_nome || case when v_ped.quantidade > 1 then ' (' || v_ped.quantidade || ' un.)' else '' end,
            v_ped.pago_valor, coalesce(v_ped.metodo, 'outro'), 'Mercado Pago', p->>'id', 'aprovada', now(), now(), 'Pedido da loja nº ' || v_ped.id)
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
revoke all on function loja_registrar_pagamento(text, jsonb) from public;
grant execute on function loja_registrar_pagamento(text, jsonb) to anon, authenticated;

create or replace function loja_whatsapp_resultado(p_chave text, p_id bigint, p_status text, p_texto text, p_erro text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform _confere_chave(p_chave);
  update whatsapp_envios set status = p_status, texto = left(p_texto, 4000), erro = left(p_erro, 500)
   where id = p_id and evento = 'loja_pago' and p_status in ('enviada', 'erro', 'sem_whatsapp');
end $$;
revoke all on function loja_whatsapp_resultado(text, bigint, text, text, text) from public;
grant execute on function loja_whatsapp_resultado(text, bigint, text, text, text) to anon, authenticated;

-- Resumo do pedido para montar a mensagem (servidor do site, com a chave)
create or replace function loja_resumo_pedido(p_chave text, p_pedido bigint)
returns table (produto_nome text, quantidade int, endereco jsonb)
language plpgsql stable security definer set search_path = public as $$
begin
  perform _confere_chave(p_chave);
  return query select lp.produto_nome, lp.quantidade, lp.endereco from loja_pedidos lp where lp.id = p_pedido;
end $$;
revoke all on function loja_resumo_pedido(text, bigint) from public;
grant execute on function loja_resumo_pedido(text, bigint) to anon, authenticated;

-- ---------------------------------------------------------------- avisos de WhatsApp
insert into whatsapp_modelos (evento, titulo, quando, texto) values
  ('loja_pago', 'Loja: pagamento confirmado', 'Quando o pagamento de um pedido da loja é aprovado.',
   E'📦 Pagamento confirmado, {nome}! Recebemos seu pedido nº {pedido}: {produto}.\n\nVamos postar em até 3 dias úteis e você recebe aqui o código de rastreio.\n\nEntrega em: {endereco}\n\nAcompanhe em Minha conta › Meus pedidos:\n👉 {link}/conta/pedidos'),
  ('loja_enviado', 'Loja: pedido enviado', 'Quando você marca o pedido como enviado e informa o código de rastreio.',
   E'🚚 {nome}, seu pedido nº {pedido} ({produto}) foi postado nos Correios!\n\nCódigo de rastreio: {rastreio}\nAcompanhe a entrega:\n👉 https://rastreamento.correios.com.br/app/index.php?objetos={rastreio}\n\nBons estudos! ✈️')
on conflict (evento) do nothing;

-- ---------------------------------------------------------------- produtos iniciais (as apostilas)
insert into loja_produtos (slug, nome, resumo, descricao, preco, imagens, ordem) values
  ('voando-rumo-ao-sucesso', 'Voando Rumo ao Sucesso',
   'Um guia prático para quem deseja se preparar e construir uma carreira de sucesso na aviação.',
   E'A apostila Voando Rumo ao Sucesso foi desenvolvida para quem deseja iniciar ou desenvolver sua carreira na aviação e quer estar mais preparado para os desafios do mercado.\n\nO material reúne orientações práticas sobre carreira, preparação profissional e os principais pontos que podem fazer diferença na trajetória de quem busca uma oportunidade nas empresas aéreas.\n\nMais do que conquistar uma vaga, é importante entender como se preparar, como se apresentar profissionalmente e quais atitudes contribuem para construir uma carreira sólida.\n\nUma leitura indicada para quem deseja transformar o sonho de trabalhar na aviação em um projeto profissional, com mais conhecimento, planejamento e preparação.',
   89, array['/midia/imagens/loja/6ad64c8117203_1792429185.png'], 1),
  ('conduta-profissional', 'Conduta Profissional na Aviação Comercial',
   'Postura, comportamento e atitudes essenciais para quem deseja atuar profissionalmente na aviação.',
   E'Trabalhar na aviação exige muito mais do que conhecimento técnico. Postura, comportamento, comunicação, responsabilidade e imagem profissional fazem parte da rotina de quem representa uma empresa aérea.\n\nA apostila Conduta Profissional na Aviação Comercial apresenta orientações importantes sobre o comportamento esperado dos profissionais que atuam ou desejam atuar no setor.\n\nO material aborda situações relacionadas à postura profissional, relacionamento interpessoal, comunicação, ética, apresentação pessoal e atitudes que podem impactar positiva ou negativamente a carreira.\n\nIndicada tanto para quem está buscando sua primeira oportunidade na aviação quanto para profissionais que desejam aperfeiçoar sua postura e compreender melhor as expectativas das empresas em relação aos seus colaboradores.',
   89, array['/midia/imagens/loja/6ad64c92cc233_1792429202.png'], 2),
  ('recrutamento-e-selecao', 'Recrutamento e Seleção',
   'Prepare-se para processos seletivos e entenda o que os recrutadores realmente avaliam nos candidatos.',
   E'A apostila Recrutamento e Seleção foi desenvolvida para ajudar candidatos a compreender melhor como funcionam os processos seletivos das empresas aéreas e como se preparar para cada etapa.\n\nO material aborda pontos importantes da preparação do candidato, desde a apresentação profissional até situações encontradas durante seleções, entrevistas e avaliações.\n\nVocê encontrará orientações para entender o que os recrutadores observam, como evitar erros que podem prejudicar sua participação e como demonstrar suas competências de maneira mais clara e profissional.\n\nUm material especialmente indicado para quem está se preparando para processos seletivos para comissário de voo e outras oportunidades no setor aéreo e deseja chegar às seleções mais seguro e preparado.',
   89, array['/midia/imagens/loja/6ad64d125881f_1792429330.png'], 3),
  ('combo-3-apostilas', 'Combo: as 3 apostilas',
   'Preparação completa para conquistar sua oportunidade e desenvolver uma carreira de sucesso na aviação.',
   E'Prepare-se de forma mais completa para conquistar uma oportunidade e construir uma carreira de sucesso na aviação.\n\nEste combo reúne as três apostilas voltadas à preparação e ao desenvolvimento profissional:\n\n✈️ Voando Rumo ao Sucesso\nOrientações para quem deseja iniciar ou desenvolver sua carreira na aviação, entendendo melhor os desafios do mercado e como se preparar profissionalmente.\n\n🎯 Recrutamento e Seleção\nConteúdo direcionado à preparação para processos seletivos, entrevistas e avaliações, ajudando você a compreender o que os recrutadores observam e como evitar erros durante uma seleção.\n\n👔 Conduta Profissional na Aviação Comercial\nOrientações sobre postura, comportamento, comunicação, ética, apresentação pessoal e atitudes esperadas dos profissionais que atuam no setor aéreo.\n\nCom o Combo das 3 Apostilas, você terá uma preparação que acompanha diferentes momentos da sua trajetória: da busca pela oportunidade ao desenvolvimento da sua postura profissional dentro da aviação.',
   180, array['/midia/imagens/loja/6ad64d4836121_1792429384.png', '/midia/imagens/loja/6ad64d125881f_1792429330.png', '/midia/imagens/loja/6ad64c92cc233_1792429202.png', '/midia/imagens/loja/6ad64c8117203_1792429185.png'], 4)
on conflict (slug) do nothing;
update loja_produtos set preco_de = 267 where slug = 'combo-3-apostilas' and preco_de is null;

notify pgrst, 'reload schema';
select 'loja pronta' as status, string_agg(nome || ' R$ ' || preco, ' · ' order by ordem) as produtos from loja_produtos;
