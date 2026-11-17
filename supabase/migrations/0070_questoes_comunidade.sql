-- Cabin Crew · 0070 · Questões: Reportar erro, Comentários (fórum da questão), Favoritas e o plano "Questões Plus"
--   • Reportar erro: grátis para todos. Vai por e-mail/WhatsApp para a equipe e fica em Admin › Simulados ANAC › Reportes.
--   • Comentários e Favoritas fazem parte do "Questões Plus".
--     Cobrança desligada (padrão): todo aluno cadastrado usa de graça.
--     Cobrança ligada: só quem tem o Plus (liberado à mão pelo admin ou, no futuro, comprado).
--   • Simulado de favoritas: liberado a partir de 20 questões favoritadas.
-- Pode rodar mais de uma vez.

-- ------------------------------------------------------------------ Plus: quem tem e a chave de cobrança
create table if not exists plus_assinantes (
  user_id      uuid primary key references profiles(id) on delete cascade,
  ate          timestamptz,                 -- vazio = sem prazo
  origem       text not null default 'manual' check (origem in ('manual', 'compra')),
  compra_id    bigint references compras(id) on delete set null,
  observacao   text,
  liberado_por uuid references profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table plus_assinantes enable row level security;
drop policy if exists "plus: o proprio" on plus_assinantes;
create policy "plus: o proprio" on plus_assinantes for select to authenticated using (user_id = auth.uid() or is_admin());
drop policy if exists "plus: admin" on plus_assinantes;
create policy "plus: admin" on plus_assinantes for all to authenticated using (is_admin()) with check (is_admin());

insert into configuracoes (chave, valor, descricao) values
  ('plus_cobrar', 'false'::jsonb, 'Questões Plus: cobrar pelos comentários e favoritas (desligado = grátis para todos)'),
  ('plus_preco', '29.90'::jsonb, 'Questões Plus: preço por mês mostrado ao aluno')
on conflict (chave) do nothing;

create or replace function tem_plus(p_user uuid default auth.uid()) returns boolean
language sql stable security definer set search_path = public as $$
  select p_user is not null and (
    exists (select 1 from profiles where id = p_user and is_admin)
    or coalesce((select valor = 'true'::jsonb from configuracoes where chave = 'plus_cobrar'), false) = false
    or exists (select 1 from plus_assinantes s where s.user_id = p_user and (s.ate is null or s.ate > now()))
  );
$$;
revoke all on function tem_plus(uuid) from public, anon;
grant execute on function tem_plus(uuid) to authenticated;

-- o que a tela do aluno precisa saber de uma vez
create or replace function plus_status() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'cobrar', coalesce((select valor = 'true'::jsonb from configuracoes where chave = 'plus_cobrar'), false),
    'preco', coalesce((select (valor #>> '{}')::numeric from configuracoes where chave = 'plus_preco'), 29.90),
    'tem', tem_plus(auth.uid()),
    'ate', (select ate from plus_assinantes where user_id = auth.uid())
  );
$$;
revoke all on function plus_status() from public, anon;
grant execute on function plus_status() to authenticated;

-- o aluno já viu a resposta certa desta questão? (gabarito final, treino ou gabarito imediato)
create or replace function viu_gabarito(p_questao uuid, p_so_final boolean default false) returns boolean
language sql stable security definer set search_path = public as $$
  select is_admin() or exists (
    select 1 from tentativas t join simulados s on s.id = t.simulado_id
     where t.user_id = auth.uid() and p_questao = any(t.questoes)
       and ((t.finalizada_em is not null and s.mostrar_gabarito)
            or (not p_so_final and (t.modo = 'treino' or t.gabarito_imediato) and t.respostas ? p_questao::text))
  );
$$;
revoke all on function viu_gabarito(uuid, boolean) from public, anon;
grant execute on function viu_gabarito(uuid, boolean) to authenticated;

-- ------------------------------------------------------------------ Reportar erro
create table if not exists questao_reportes (
  id           bigint generated always as identity primary key,
  questao_id   uuid not null references questoes(id) on delete cascade,
  user_id      uuid not null references profiles(id) on delete cascade,
  tentativa_id uuid references tentativas(id) on delete set null,
  tipo         text not null default 'gabarito' check (tipo in ('gabarito', 'enunciado', 'alternativas', 'explicacao', 'outro')),
  mensagem     text check (char_length(mensagem) <= 1500),
  status       text not null default 'aberto' check (status in ('aberto', 'corrigido', 'sem_erro')),
  resposta     text check (char_length(resposta) <= 1500),
  resolvido_em timestamptz,
  resolvido_por uuid references profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);
create index if not exists questao_reportes_status on questao_reportes (status, created_at desc);
alter table questao_reportes enable row level security;
drop policy if exists "reportes: o proprio" on questao_reportes;
create policy "reportes: o proprio" on questao_reportes for select to authenticated using (user_id = auth.uid() or is_admin());
drop policy if exists "reportes: admin" on questao_reportes;
create policy "reportes: admin" on questao_reportes for all to authenticated using (is_admin()) with check (is_admin());

-- grava o reporte e devolve a questão completa para o e-mail da equipe
create or replace function reportar_questao(p_questao uuid, p_tentativa uuid, p_tipo text, p_mensagem text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_id bigint; q questoes;
begin
  if auth.uid() is null then raise exception 'Entre na sua conta para continuar.'; end if;
  if esta_bloqueado() then raise exception 'Conta bloqueada.'; end if;
  if not viu_gabarito(p_questao) then raise exception 'Responda a questão antes de reportar.'; end if;
  if (select count(*) from questao_reportes where user_id = auth.uid() and created_at > now() - interval '1 day') >= 30 then
    raise exception 'Você já enviou muitos reportes hoje. Tente de novo amanhã.';
  end if;
  if exists (select 1 from questao_reportes where user_id = auth.uid() and questao_id = p_questao and status = 'aberto') then
    raise exception 'Você já reportou esta questão. Nossa equipe está verificando.';
  end if;
  insert into questao_reportes (questao_id, user_id, tentativa_id, tipo, mensagem)
  values (p_questao, auth.uid(),
          case when exists (select 1 from tentativas where id = p_tentativa and user_id = auth.uid()) then p_tentativa end,
          case when p_tipo in ('gabarito', 'enunciado', 'alternativas', 'explicacao', 'outro') then p_tipo else 'outro' end,
          nullif(left(trim(coalesce(p_mensagem, '')), 1500), ''))
  returning id into v_id;
  select * into q from questoes where id = p_questao;
  return jsonb_build_object('id', v_id, 'banco', q.banco, 'categoria', q.categoria, 'enunciado', q.enunciado,
                            'alternativas', q.alternativas, 'correta', q.correta, 'explicacao', q.explicacao);
end $$;
revoke all on function reportar_questao(uuid, uuid, text, text) from public, anon;
grant execute on function reportar_questao(uuid, uuid, text, text) to authenticated;

-- ------------------------------------------------------------------ Comentários (fórum de cada questão)
create table if not exists questao_comentarios (
  id          bigint generated always as identity primary key,
  questao_id  uuid not null references questoes(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  pai_id      bigint references questao_comentarios(id) on delete cascade,  -- resposta a um comentário
  texto       text not null check (char_length(texto) between 1 and 2000),
  apagado     boolean not null default false,   -- apagado pelo autor (some o texto, ficam as respostas)
  oculto      boolean not null default false,   -- escondido pela equipe
  created_at  timestamptz not null default now(),
  editado_em  timestamptz
);
create index if not exists questao_comentarios_q on questao_comentarios (questao_id, created_at);
create index if not exists questao_comentarios_recentes on questao_comentarios (created_at desc);
alter table questao_comentarios enable row level security;
drop policy if exists "comentarios: admin" on questao_comentarios;
create policy "comentarios: admin" on questao_comentarios for all to authenticated using (is_admin()) with check (is_admin());

create table if not exists questao_curtidas (
  comentario_id bigint not null references questao_comentarios(id) on delete cascade,
  user_id       uuid not null references profiles(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (comentario_id, user_id)
);
alter table questao_curtidas enable row level security;
drop policy if exists "curtidas: admin" on questao_curtidas;
create policy "curtidas: admin" on questao_curtidas for all to authenticated using (is_admin()) with check (is_admin());

-- quantos comentários cada questão tem (aparece no botão, mesmo sem o Plus)
create or replace function comentarios_contagem(p_questoes uuid[]) returns table (questao_id uuid, total int)
language sql stable security definer set search_path = public as $$
  select c.questao_id, count(*)::int from questao_comentarios c
   where c.questao_id = any(p_questoes) and not c.oculto and not c.apagado
   group by c.questao_id;
$$;
revoke all on function comentarios_contagem(uuid[]) from public, anon;
grant execute on function comentarios_contagem(uuid[]) to authenticated;

create or replace function comentarios_da_questao(p_questao uuid)
returns table (id bigint, pai_id bigint, texto text, created_at timestamptz, editado boolean, autor text, autor_id uuid, avatar_em timestamptz,
               equipe boolean, curtidas int, curti boolean, meu boolean, apagado boolean)
language plpgsql stable security definer set search_path = public as $$
begin
  if not tem_plus() then raise exception 'plus'; end if;
  if not viu_gabarito(p_questao) then raise exception 'Responda a questão para ver os comentários.'; end if;
  return query
  select c.id, c.pai_id, case when c.apagado then '' else c.texto end, c.created_at, c.editado_em is not null,
         n.partes[1] || case when array_length(n.partes, 1) > 1 then ' ' || left(n.partes[array_length(n.partes, 1)], 1) || '.' else '' end,
         c.user_id, p.avatar_em, p.is_admin,
         (select count(*)::int from questao_curtidas k where k.comentario_id = c.id),
         exists (select 1 from questao_curtidas k where k.comentario_id = c.id and k.user_id = auth.uid()),
         c.user_id = auth.uid(), c.apagado
    from questao_comentarios c join profiles p on p.id = c.user_id
    cross join lateral (select regexp_split_to_array(trim(coalesce(nullif(trim(p.nome), ''), nullif(trim(p.apelido), ''), 'Aluno')), '\s+') as partes) n
   where c.questao_id = p_questao and not c.oculto
     -- comentário apagado só continua aparecendo se tiver respostas
     and (not c.apagado or exists (select 1 from questao_comentarios r where r.pai_id = c.id and not r.oculto and not r.apagado))
   order by c.created_at;
end $$;
revoke all on function comentarios_da_questao(uuid) from public, anon;
grant execute on function comentarios_da_questao(uuid) to authenticated;

create or replace function comentar_questao(p_questao uuid, p_pai bigint, p_texto text) returns bigint
language plpgsql security definer set search_path = public as $$
declare v_id bigint; v_pai bigint := p_pai; v_texto text := left(trim(coalesce(p_texto, '')), 2000);
begin
  if auth.uid() is null then raise exception 'Entre na sua conta para continuar.'; end if;
  if esta_bloqueado() then raise exception 'Conta bloqueada.'; end if;
  if not tem_plus() then raise exception 'plus'; end if;
  if not viu_gabarito(p_questao) then raise exception 'Responda a questão antes de comentar.'; end if;
  if v_texto = '' then raise exception 'Escreva o seu comentário.'; end if;
  if (select count(*) from questao_comentarios where user_id = auth.uid() and created_at > now() - interval '1 hour') >= 40 then
    raise exception 'Muitos comentários em pouco tempo. Espere um pouco e tente de novo.';
  end if;
  if v_pai is not null then
    -- respostas ficam sempre no primeiro nível (resposta de resposta vai para o comentário principal)
    select coalesce(c.pai_id, c.id) into v_pai from questao_comentarios c where c.id = p_pai and c.questao_id = p_questao;
    if v_pai is null then raise exception 'Comentário não encontrado.'; end if;
  end if;
  insert into questao_comentarios (questao_id, user_id, pai_id, texto) values (p_questao, auth.uid(), v_pai, v_texto)
  returning id into v_id;
  return v_id;
end $$;
revoke all on function comentar_questao(uuid, bigint, text) from public, anon;
grant execute on function comentar_questao(uuid, bigint, text) to authenticated;

create or replace function editar_comentario(p_id bigint, p_texto text) returns boolean
language plpgsql security definer set search_path = public as $$
declare v_texto text := left(trim(coalesce(p_texto, '')), 2000); v_ok int;
begin
  if v_texto = '' then raise exception 'Escreva o seu comentário.'; end if;
  update questao_comentarios set texto = v_texto, editado_em = now()
   where id = p_id and user_id = auth.uid() and not apagado and tem_plus();
  get diagnostics v_ok = row_count;
  return v_ok = 1;
end $$;
revoke all on function editar_comentario(bigint, text) from public, anon;
grant execute on function editar_comentario(bigint, text) to authenticated;

create or replace function apagar_comentario(p_id bigint) returns boolean
language plpgsql security definer set search_path = public as $$
declare v_ok int;
begin
  update questao_comentarios set apagado = true where id = p_id and (user_id = auth.uid() or is_admin());
  get diagnostics v_ok = row_count;
  return v_ok = 1;
end $$;
revoke all on function apagar_comentario(bigint) from public, anon;
grant execute on function apagar_comentario(bigint) to authenticated;

create or replace function curtir_comentario(p_id bigint) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if not tem_plus() then raise exception 'plus'; end if;
  if exists (select 1 from questao_curtidas where comentario_id = p_id and user_id = auth.uid()) then
    delete from questao_curtidas where comentario_id = p_id and user_id = auth.uid();
    return false;
  end if;
  insert into questao_curtidas (comentario_id, user_id)
  select c.id, auth.uid() from questao_comentarios c where c.id = p_id and not c.oculto and not c.apagado and viu_gabarito(c.questao_id)
  on conflict do nothing;
  return true;
end $$;
revoke all on function curtir_comentario(bigint) from public, anon;
grant execute on function curtir_comentario(bigint) to authenticated;

-- ------------------------------------------------------------------ Favoritas
create table if not exists questao_favoritas (
  user_id    uuid not null references profiles(id) on delete cascade,
  questao_id uuid not null references questoes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, questao_id)
);
alter table questao_favoritas enable row level security;
drop policy if exists "favoritas: ver" on questao_favoritas;
create policy "favoritas: ver" on questao_favoritas for select to authenticated using (user_id = auth.uid() or is_admin());
drop policy if exists "favoritas: tirar" on questao_favoritas;
create policy "favoritas: tirar" on questao_favoritas for delete to authenticated using (user_id = auth.uid());
-- favoritar: só com o Plus e só depois de ver o gabarito final da prova
drop policy if exists "favoritas: marcar" on questao_favoritas;
create policy "favoritas: marcar" on questao_favoritas for insert to authenticated
  with check (user_id = auth.uid() and tem_plus() and viu_gabarito(questao_id, true));

-- lista de favoritas do aluno (ele já viu o gabarito de todas)
create or replace function minhas_favoritas()
returns table (questao_id uuid, categoria text, enunciado text, correta text, texto_correta text, favoritada_em timestamptz)
language sql stable security definer set search_path = public as $$
  select q.id, q.categoria, q.enunciado, q.correta,
         (select a->>'texto' from jsonb_array_elements(q.alternativas) a where a->>'letra' = q.correta limit 1),
         f.created_at
    from questao_favoritas f join questoes q on q.id = f.questao_id
   where f.user_id = auth.uid() and q.ativo
   order by f.created_at desc;
$$;
revoke all on function minhas_favoritas() from public, anon;
grant execute on function minhas_favoritas() to authenticated;

-- o simulado das favoritas (sem cronômetro; todas as favoritas, em ordem aleatória)
insert into simulados (titulo, descricao, bancos, qtd_questoes, tempo_min, nota_minima, mostrar_gabarito, origem)
select 'Minhas questões favoritas', 'Simulado exclusivo com as questões que você favoritou.', array['anac'], 200, null, 70, true, 'cc-favoritas'
where not exists (select 1 from simulados where origem = 'cc-favoritas');

create or replace function iniciar_favoritas(p_gabarito boolean default false, p_auto boolean default false) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_sim smallint; v_id uuid; v_ids uuid[];
begin
  if v_user is null then raise exception 'Entre na sua conta para continuar.'; end if;
  if esta_bloqueado() then raise exception 'Conta bloqueada.'; end if;
  if not tem_plus() then raise exception 'plus'; end if;
  select id into v_sim from simulados where origem = 'cc-favoritas';
  select array_agg(questao_id) into v_ids from (
    select f.questao_id from questao_favoritas f join questoes q on q.id = f.questao_id
     where f.user_id = v_user and q.ativo order by random() limit 200
  ) x;
  if coalesce(array_length(v_ids, 1), 0) < 20 then raise exception 'Favorite pelo menos 20 questões para liberar este simulado.'; end if;
  -- simulado de favoritas que ficou aberto: descarta e começa um novo com a lista atual
  delete from tentativas where user_id = v_user and simulado_id = v_sim and finalizada_em is null;
  insert into tentativas (user_id, simulado_id, questoes, total, prazo, modo, gabarito_imediato, auto_proxima)
  values (v_user, v_sim, v_ids, array_length(v_ids, 1), null, 'prova', coalesce(p_gabarito, false), coalesce(p_auto, false))
  returning id into v_id;
  return v_id;
end $$;
revoke all on function iniciar_favoritas(boolean, boolean) from public, anon;
grant execute on function iniciar_favoritas(boolean, boolean) to authenticated;

-- ------------------------------------------------------------------ permissões das tabelas (as regras de cima decidem quem vê o quê)
grant select, insert, update, delete on plus_assinantes, questao_reportes, questao_comentarios, questao_curtidas, questao_favoritas to authenticated;

-- ------------------------------------------------------------------ Admin
create or replace function admin_plus_lista()
returns table (user_id uuid, nome text, email text, ate timestamptz, origem text, observacao text, created_at timestamptz, ativo boolean)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  perform _exige_admin();
  return query
  select s.user_id, coalesce(nullif(trim(p.nome), ''), p.apelido), u.email::text, s.ate, s.origem, s.observacao, s.created_at,
         (s.ate is null or s.ate > now())
    from plus_assinantes s join profiles p on p.id = s.user_id left join auth.users u on u.id = s.user_id
   order by (s.ate is null or s.ate > now()) desc, s.created_at desc;
end $$;
revoke all on function admin_plus_lista() from public, anon;
grant execute on function admin_plus_lista() to authenticated;

create or replace function admin_reportes(p_status text default 'aberto')
returns table (id bigint, questao_id uuid, banco text, categoria text, enunciado text, alternativas jsonb, correta text, explicacao text,
               tipo text, mensagem text, status text, resposta text, created_at timestamptz, resolvido_em timestamptz,
               aluno_id uuid, aluno text, email text, reportes_da_questao int)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  perform _exige_admin();
  return query
  select r.id, q.id, q.banco, q.categoria, q.enunciado, q.alternativas, q.correta, q.explicacao,
         r.tipo, r.mensagem, r.status, r.resposta, r.created_at, r.resolvido_em,
         r.user_id, coalesce(nullif(trim(p.nome), ''), p.apelido), u.email::text,
         (select count(*)::int from questao_reportes x where x.questao_id = r.questao_id and x.status = 'aberto')
    from questao_reportes r join questoes q on q.id = r.questao_id
    join profiles p on p.id = r.user_id left join auth.users u on u.id = r.user_id
   where p_status = 'todos' or r.status = p_status
   order by r.created_at desc
   limit 300;
end $$;
revoke all on function admin_reportes(text) from public, anon;
grant execute on function admin_reportes(text) to authenticated;

create or replace function admin_comentarios(p_filtro text default 'recentes')
returns table (id bigint, questao_id uuid, enunciado text, pai_id bigint, texto text, apagado boolean, oculto boolean, created_at timestamptz,
               aluno_id uuid, aluno text, email text, equipe boolean)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  perform _exige_admin();
  return query
  select c.id, q.id, q.enunciado, c.pai_id, c.texto, c.apagado, c.oculto, c.created_at,
         c.user_id, coalesce(nullif(trim(p.nome), ''), p.apelido), u.email::text, p.is_admin
    from questao_comentarios c join questoes q on q.id = c.questao_id
    join profiles p on p.id = c.user_id left join auth.users u on u.id = c.user_id
   where p_filtro = 'recentes' or (p_filtro = 'ocultos' and c.oculto)
   order by c.created_at desc
   limit 200;
end $$;
revoke all on function admin_comentarios(text) from public, anon;
grant execute on function admin_comentarios(text) to authenticated;

notify pgrst, 'reload schema';
select 'reportar, comentários, favoritas e Questões Plus prontos' as status;
