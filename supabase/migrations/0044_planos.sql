-- Cabin Crew · 0044 · Planos: Head Hunter, Flight Attendant English, Combo e Simulados ANAC grátis
--   • Flight Attendant English vira um produto separado (antes era o "Inglês a bordo" dentro do Head Hunter)
--   • Combo (Head Hunter + English) libera os dois cursos
--   • Simulados da banca ANAC: grátis para qualquer pessoa cadastrada
-- Rode depois do 0042 e do 0043. Pode rodar mais de uma vez.

-- ---------- Produtos ----------
alter table produtos add column if not exists inclui text[];          -- cursos que a compra libera (combo: os dois)
alter table produtos add column if not exists ordem integer not null default 0;
alter table produtos add column if not exists destaque text;          -- tarja na página de planos (ex.: Mais popular)
alter table produtos add column if not exists topicos text[];         -- principais tópicos mostrados na página de planos
alter table produtos add column if not exists endereco text;          -- onde o aluno estuda depois da compra

insert into produtos (slug, nome, descricao, preco, desconto_pix, ordem) values
  ('english', 'Flight Attendant English', 'Curso completo de inglês para aviação: o inglês que o comissário usa a bordo, do embarque ao desembarque, com diálogos em áudio e exercícios.', 250, 5, 2),
  ('combo', 'Head Hunter + Flight Attendant English', 'Os dois cursos juntos: a preparação completa para a seleção e o inglês de aviação.', 300, 5, 3)
on conflict (slug) do nothing;

update produtos set inclui = array[slug] where inclui is null and slug <> 'combo';
update produtos set inclui = array['head-hunter', 'english'] where slug = 'combo' and inclui is null;
update produtos set ordem = 1, endereco = coalesce(endereco, '/head-hunter') where slug = 'head-hunter';
update produtos set endereco = coalesce(endereco, '/english') where slug = 'english';
update produtos set endereco = coalesce(endereco, '/head-hunter'), destaque = coalesce(destaque, 'Mais popular') where slug = 'combo';
update produtos set topicos = array[
  'Jornada personalizada para a companhia que você quer',
  'Aulas sobre cada etapa da seleção',
  'Simulados no estilo das seleções e dinâmicas de grupo',
  'Perfil comportamental e julgamento situacional',
  'Treino de entrevista em inglês e vídeo de apresentação',
  'Ranking, medalhas e missão do dia'
] where slug = 'head-hunter' and topicos is null;
update produtos set topicos = array[
  '11 módulos e 44 aulas, do embarque ao desembarque',
  'Diálogos reais de bordo com áudio em inglês',
  'Anúncios de cabine (PA) e briefing de segurança',
  'Serviço de bordo, passageiros e situações difíceis',
  'Emergências e primeiros socorros em inglês',
  'Vocabulário de aviação e exercícios com correção'
] where slug = 'english' and topicos is null;
update produtos set topicos = array[
  'Tudo do Head Hunter',
  'Tudo do Flight Attendant English',
  'Economia em relação aos cursos separados'
] where slug = 'combo' and topicos is null;

-- ---------- Acesso por curso ----------
-- Quem pode usar um curso: admin, "cursos liberados para todos" (configuração) ou acesso ativo ao curso
create or replace function tem_acesso(p_produto text, p_user uuid default auth.uid()) returns boolean
language sql stable security definer set search_path = public as $$
  select p_user is not null and (
    exists (select 1 from profiles where id = p_user and is_admin)
    or (
      not esta_bloqueado(p_user)
      and (
        coalesce((select valor = 'true'::jsonb from configuracoes where chave = 'crew_select_aberto'), false)
        or exists (select 1 from acessos where user_id = p_user and produto = p_produto and status = 'ativo'
                   and (expira_em is null or expira_em > now()))
      )
    )
  );
$$;
revoke all on function tem_acesso(text, uuid) from public, anon;
grant execute on function tem_acesso(text, uuid) to authenticated;

create or replace function hh_tem_acesso(p_user uuid default auth.uid()) returns boolean
language sql stable security definer set search_path = public as $$ select tem_acesso('head-hunter', p_user); $$;

-- Concluiu o curso: o acesso continua pelos dias extras do produto e depois termina
create or replace function concluir_acesso(p_produto text) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare v_dias int; v_fim timestamptz;
begin
  select coalesce(dias_apos_conclusao, 30) into v_dias from produtos where slug = p_produto;
  update acessos a
     set concluido_em = now(), expira_em = now() + make_interval(days => coalesce(v_dias, 30)),
         status = case when coalesce(v_dias, 30) = 0 then 'concluido' else a.status end,
         encerrado_em = case when coalesce(v_dias, 30) = 0 then now() else a.encerrado_em end,
         motivo = 'concluiu o curso'
   where a.user_id = auth.uid() and a.produto = p_produto and a.status = 'ativo' and a.concluido_em is null
  returning a.expira_em into v_fim;
  return v_fim;
end $$;
revoke all on function concluir_acesso(text) from public, anon;
grant execute on function concluir_acesso(text) to authenticated;

create or replace function hh_concluir_acesso() returns timestamptz
language sql security definer set search_path = public as $$ select concluir_acesso('head-hunter'); $$;

-- ---------- Simulados ANAC grátis ----------
create or replace function anac_liberado(p_user uuid default auth.uid()) returns boolean
language sql stable security definer set search_path = public as $$
  select p_user is not null and (exists (select 1 from profiles where id = p_user and is_admin) or not esta_bloqueado(p_user));
$$;

create or replace function simulado_liberado(p_simulado smallint) returns boolean
language sql stable security definer set search_path = public as $$
  select is_admin() or (
    not esta_bloqueado()
    and (
      -- banca ANAC: grátis
      coalesce((select origem from simulados where id = p_simulado), '') like 'cc-anac%'
      or (
        hh_tem_acesso()
        and exists (select 1 from profiles where id = auth.uid() and avatar_em is not null)
        and exists (
          select 1 from aulas a join modulos m on m.id = a.modulo_id
          where a.simulado_id = p_simulado and a.publicado and m.publicado
        )
      )
    )
  );
$$;

create or replace function iniciar_treino(p_banco text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_sim smallint;
  v_id uuid;
  v_ids uuid[];
begin
  if v_user is null then raise exception 'Faça login para continuar'; end if;
  if esta_bloqueado() then raise exception 'Acesso bloqueado'; end if;
  -- banca ANAC: grátis para todo cadastrado · inglês: Head Hunter ou Flight Attendant English · demais: Head Hunter
  if p_banco = 'ingles' and not (hh_tem_acesso() or tem_acesso('english')) then raise exception 'Treino disponível para alunos'; end if;
  if p_banco not in ('anac', 'ingles') and not hh_tem_acesso() then raise exception 'Treino disponível para alunos do Head Hunter'; end if;
  select id into v_sim from simulados where origem = 'cc-treino-' || p_banco;
  if v_sim is null then raise exception 'Treino indisponível'; end if;

  -- treino aberto do mesmo banco: continua
  select id into v_id from tentativas
  where user_id = v_user and simulado_id = v_sim and finalizada_em is null
  order by iniciada_em desc limit 1;
  if v_id is not null then return v_id; end if;

  with vistas as (
    select qid, bool_or(upper(t.respostas ->> qid::text) is distinct from q.correta) as errou
    from tentativas t cross join lateral unnest(t.questoes) qid
    join questoes q on q.id = qid
    where t.user_id = v_user and t.finalizada_em is not null
    group by qid
  )
  select array_agg(id) into v_ids from (
    select q.id from questoes q left join vistas v on v.qid = q.id
    where q.ativo and q.banco = p_banco
    order by case when v.qid is null then 0 when v.errou then 1 else 2 end, random()
    limit 10
  ) x;
  if v_ids is null then raise exception 'Este banco ainda não tem questões'; end if;

  insert into tentativas (user_id, simulado_id, questoes, total, prazo, modo)
  values (v_user, v_sim, v_ids, array_length(v_ids, 1), null, 'treino')
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function iniciar_treino(text) from public, anon;
grant execute on function iniciar_treino(text) to authenticated;

-- ---------- Reserva de acesso por e-mail (agora por curso) ----------
alter table acessos_pendentes drop constraint if exists acessos_pendentes_pkey;
alter table acessos_pendentes add primary key (email, produto);

create or replace function hh_resgatar_acesso() returns boolean
language plpgsql security definer set search_path = public, auth as $$
declare v_email text; r acessos_pendentes; achou boolean := false;
begin
  select lower(u.email) into v_email from auth.users u where u.id = auth.uid();
  if v_email is null then return false; end if;
  for r in select * from acessos_pendentes where email = v_email loop
    achou := true;
    insert into acessos (user_id, produto, status, compra_id, motivo)
    values (auth.uid(), r.produto, 'ativo', r.compra_id, r.motivo)
    on conflict (user_id, produto) do update
      set status = 'ativo', compra_id = coalesce(excluded.compra_id, acessos.compra_id), liberado_em = now(),
          encerrado_em = null, concluido_em = null, expira_em = null, motivo = excluded.motivo;
    update compras set user_id = auth.uid() where id = r.compra_id and user_id is null;
  end loop;
  delete from acessos_pendentes where email = v_email;
  return achou;
end $$;

-- ---------- Pagamento: libera todos os cursos do produto (combo = os dois) ----------
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

-- textos padrão dos avisos passam a servir para qualquer curso (só se você ainda não editou)
update whatsapp_modelos set texto = E'✈️ Pagamento confirmado, {nome}! Seu acesso ao {produto} está liberado.\n\n👨‍✈️ É só entrar e começar:\n👉 {endereco}\n\n🧾 Compra: {produto} · {valor} · {forma}\n\n📲 Salve este número na sua agenda para receber todos os avisos da Cabin Crew.'
 where evento = 'compra_aprovada' and texto like '%Seu acesso ao Head Hunter está liberado.%Comece pelo check-in%';
update whatsapp_modelos set texto = replace(texto, 'seu acesso ao Head Hunter está liberado!', 'seu acesso ao {produto} está liberado!'),
       quando = 'Quando você adiciona um aluno a um curso pelo painel (cortesia, Pix direto, curso presencial).'
 where evento = 'acesso_liberado' and texto like '%seu acesso ao Head Hunter está liberado!%';
update whatsapp_modelos set titulo = replace(titulo, 'Inglês a bordo', 'Flight Attendant English'),
       quando = replace(quando, 'Inglês a bordo', 'Flight Attendant English'),
       texto = replace(replace(texto, 'Inglês a bordo', 'Flight Attendant English'), '/head-hunter/ingles-a-bordo', '/english')
 where evento in ('ingles_modulo', 'ingles_concluido');

notify pgrst, 'reload schema';
select 'planos prontos' as status, string_agg(slug || ' R$ ' || preco, ' · ' order by ordem) as produtos from produtos;
