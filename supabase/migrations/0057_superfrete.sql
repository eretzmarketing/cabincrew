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

notify pgrst, 'reload schema';
select 'superfrete pronto' as status;
