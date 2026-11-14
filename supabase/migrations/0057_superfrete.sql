-- Cabin Crew · 0057 · Etiquetas do SuperFrete para os pedidos da loja
--   • CPF de quem recebe passa a ser obrigatório no pedido (o SuperFrete pede nome completo e CPF)
--   • medidas e peso de cada apostila (para o pacote da etiqueta)
--   • dados da etiqueta em cada pedido: id no SuperFrete, situação, serviço, preço e link do PDF
-- Rode depois do 0056. Pode rodar mais de uma vez.

alter table loja_produtos add column if not exists peso_g integer not null default 1000 check (peso_g between 1 and 30000);
alter table loja_produtos add column if not exists altura_cm numeric(5,1) not null default 5 check (altura_cm between 0.4 and 100);
alter table loja_produtos add column if not exists largura_cm numeric(5,1) not null default 25 check (largura_cm between 8 and 100);
alter table loja_produtos add column if not exists comprimento_cm numeric(5,1) not null default 30 check (comprimento_cm between 13 and 100);
alter table loja_produtos alter column peso_g set default 1000;
alter table loja_produtos alter column altura_cm set default 5;
alter table loja_produtos alter column largura_cm set default 25;
-- medida padrão do pacote: 5 × 25 × 30 cm, até 1 kg — vale para 1 apostila e também para o combo com as 3
-- (só troca o que ainda está com uma medida antiga, não mexe no que você ajustou)
update loja_produtos set peso_g = 1000, altura_cm = 5, largura_cm = 25, comprimento_cm = 30
 where (peso_g, altura_cm, largura_cm, comprimento_cm) in ((500, 2, 21, 30), (1500, 6, 21, 30), (3000, 15, 25, 30));

alter table loja_pedidos add column if not exists etiqueta_id text;
alter table loja_pedidos add column if not exists etiqueta_status text;       -- criando, pending (no carrinho), released (paga), posted, delivered, canceled
alter table loja_pedidos add column if not exists etiqueta_servico integer;
alter table loja_pedidos add column if not exists etiqueta_preco numeric(10,2);
alter table loja_pedidos add column if not exists etiqueta_url text;
alter table loja_pedidos add column if not exists etiqueta_em timestamptz;

-- CPF de quem recebe: 11 dígitos válidos
create or replace function cpf_valido(p text) returns boolean language plpgsql immutable as $$
declare d text := regexp_replace(coalesce(p, ''), '\D', '', 'g'); s int; r int; i int;
begin
  if length(d) <> 11 or d ~ '^(\d)\1{10}$' then return false; end if;
  s := 0; for i in 1..9 loop s := s + substr(d, i, 1)::int * (11 - i); end loop;
  r := (s * 10) % 11; if r = 10 then r := 0; end if;
  if r <> substr(d, 10, 1)::int then return false; end if;
  s := 0; for i in 1..10 loop s := s + substr(d, i, 1)::int * (12 - i); end loop;
  r := (s * 10) % 11; if r = 10 then r := 0; end if;
  return r = substr(d, 11, 1)::int;
end $$;

create or replace function loja_pedido_confere_cpf() returns trigger language plpgsql as $$
begin
  if not cpf_valido(new.cpf) then raise exception 'Informe um CPF válido de quem vai receber (o envio pelos Correios exige).'; end if;
  return new;
end $$;
drop trigger if exists loja_pedido_confere_cpf_trg on loja_pedidos;
create trigger loja_pedido_confere_cpf_trg before insert on loja_pedidos for each row execute function loja_pedido_confere_cpf();

-- Reserva a geração da etiqueta (admin): dois cliques não criam duas etiquetas
create or replace function loja_reservar_etiqueta(p_pedido bigint, p_servico integer) returns boolean
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  perform _exige_admin();
  update loja_pedidos set etiqueta_status = 'criando', etiqueta_servico = p_servico, etiqueta_em = now()
   where id = p_pedido and etiqueta_id is null and status in ('pago', 'enviado')
     and (etiqueta_status is null or etiqueta_status <> 'criando' or etiqueta_em < now() - interval '2 minutes');
  get diagnostics n = row_count;
  return n > 0;
end $$;
revoke all on function loja_reservar_etiqueta(bigint, integer) from public, anon;
grant execute on function loja_reservar_etiqueta(bigint, integer) to authenticated;

-- aviso de "pedido enviado": o link de rastreio passa a ser o da transportadora (Correios ou Loggi)
-- (só troca se o texto ainda for o original; se você editou o modelo, ele fica como está)
update whatsapp_modelos
   set texto = E'🚚 {nome}, seu pedido nº {pedido} ({produto}) foi postado ({transportadora})!\n\nCódigo de rastreio: {rastreio}\nAcompanhe a entrega:\n👉 {link_rastreio}\n\nVocê também acompanha em Minha conta › Meus pedidos:\n👉 {link}/conta/pedidos\n\nBons estudos! ✈️'
 where evento = 'loja_enviado'
   and texto = E'🚚 {nome}, seu pedido nº {pedido} ({produto}) foi postado nos Correios!\n\nCódigo de rastreio: {rastreio}\nAcompanhe a entrega:\n👉 https://rastreamento.correios.com.br/app/index.php?objetos={rastreio}\n\nBons estudos! ✈️';


-- ---------------------------------------------------------------- atualização automática das entregas
-- Algumas vezes por dia o servidor do site pergunta ao SuperFrete a situação de cada etiqueta:
--   postada  → pedido "Enviado" (o aluno recebe o rastreio no WhatsApp, se você ainda não marcou)
--   entregue → pedido "Entregue" (o aluno recebe o aviso de entrega)

-- Pedidos para conferir (servidor do site, com a chave)
create or replace function loja_rastrear_lista(p_chave text)
returns table (id bigint, etiqueta_id text, status text)
language plpgsql stable security definer set search_path = public as $$
begin
  perform _confere_chave(p_chave);
  return query
    select lp.id, lp.etiqueta_id, lp.status from loja_pedidos lp
     where lp.etiqueta_id is not null and lp.status in ('pago', 'enviado')
       and coalesce(lp.etiqueta_status, '') not in ('canceled', 'criando')
       and lp.criado_em > now() - interval '120 days'
     order by lp.id;
end $$;
revoke all on function loja_rastrear_lista(text) from public;
grant execute on function loja_rastrear_lista(text) to anon, authenticated;

-- Grava a situação lida no SuperFrete e avança o pedido. Devolve a mensagem de WhatsApp a enviar (no máximo uma).
create or replace function loja_rastrear_atualizar(p_chave text, p_pedido bigint, p_etiqueta_status text, p_rastreio text)
returns table (status text, evento text, envio_id bigint, telefone text, nome text, texto text,
               produto_nome text, quantidade int, endereco jsonb, rastreio text, etiqueta_servico int)
language plpgsql security definer set search_path = public as $$
declare v_ped loja_pedidos; v_era text; v_evento text; v_envio bigint; v_texto text; v_tel text; v_nome text;
begin
  perform _confere_chave(p_chave);
  if p_etiqueta_status !~ '^[a-z_]{3,20}$' then raise exception 'situação inválida'; end if;
  update loja_pedidos lp set etiqueta_status = p_etiqueta_status,
         rastreio = coalesce(lp.rastreio, nullif(upper(regexp_replace(coalesce(p_rastreio, ''), '[^A-Za-z0-9]', '', 'g')), ''))
   where lp.id = p_pedido and lp.etiqueta_id is not null and lp.status in ('pago', 'enviado')
  returning * into v_ped;
  if not found then return; end if;
  v_era := v_ped.status;

  if p_etiqueta_status in ('posted', 'delivered') and v_ped.status = 'pago' and v_ped.rastreio is not null then
    update loja_pedidos lp set status = 'enviado', enviado_em = now() where lp.id = v_ped.id returning * into v_ped;
  end if;
  if p_etiqueta_status = 'delivered' and v_ped.status = 'enviado' then
    update loja_pedidos lp set status = 'entregue', entregue_em = now() where lp.id = v_ped.id returning * into v_ped;
  end if;

  -- um aviso só: se pulou direto para entregue, manda só o de entrega
  v_evento := case when v_ped.status = 'entregue' and v_era <> 'entregue' then 'loja_entregue'
                   when v_ped.status = 'enviado' and v_era = 'pago' then 'loja_enviado' end;
  if v_evento is not null then
    select m.texto into v_texto from whatsapp_modelos m where m.evento = v_evento and m.ativo;
    select coalesce(nullif(v_ped.telefone, ''), pr.whatsapp) into v_tel from profiles pr where pr.id = v_ped.user_id;
    v_tel := coalesce(v_tel, nullif(v_ped.telefone, ''));
    v_nome := split_part(v_ped.nome, ' ', 1);
    if v_texto is not null and coalesce(v_tel, '') <> '' then
      insert into whatsapp_envios (user_id, evento, ref, telefone) values (v_ped.user_id, v_evento, v_ped.id::text, v_tel)
      on conflict do nothing returning id into v_envio;
    end if;
  end if;

  return query select v_ped.status, v_evento, v_envio,
    case when v_envio is not null then v_tel end, case when v_envio is not null then v_nome end, case when v_envio is not null then v_texto end,
    v_ped.produto_nome, v_ped.quantidade, v_ped.endereco, v_ped.rastreio, v_ped.etiqueta_servico;
end $$;
revoke all on function loja_rastrear_atualizar(text, bigint, text, text) from public;
grant execute on function loja_rastrear_atualizar(text, bigint, text, text) to anon, authenticated;

-- resultado do envio do WhatsApp (agora também para enviado e entregue)
create or replace function loja_whatsapp_resultado(p_chave text, p_id bigint, p_status text, p_texto text, p_erro text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform _confere_chave(p_chave);
  update whatsapp_envios set status = p_status, texto = left(p_texto, 4000), erro = left(p_erro, 500)
   where id = p_id and evento in ('loja_pago', 'loja_enviado', 'loja_entregue') and p_status in ('enviada', 'erro', 'sem_whatsapp');
end $$;
revoke all on function loja_whatsapp_resultado(text, bigint, text, text, text) from public;
grant execute on function loja_whatsapp_resultado(text, bigint, text, text, text) to anon, authenticated;

insert into whatsapp_modelos (evento, titulo, quando, texto) values
  ('loja_entregue', 'Loja: pedido entregue', 'Quando os Correios ou a Loggi confirmam a entrega (o site confere sozinho no SuperFrete).',
   E'✅ {nome}, seu pedido nº {pedido} ({produto}) foi entregue!\n\nQualquer problema com a entrega, é só responder esta mensagem.\n\nBons estudos! ✈️')
on conflict (evento) do nothing;
update whatsapp_modelos set quando = 'Quando o pedido é postado: você marca como enviado ou o site percebe sozinho pelo SuperFrete.'
 where evento = 'loja_enviado' and quando = 'Quando você marca o pedido como enviado e informa o código de rastreio.';

notify pgrst, 'reload schema';
select 'superfrete pronto' as status;
