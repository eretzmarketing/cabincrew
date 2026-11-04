-- =====================================================================
-- Cabin Crew — banco de questões, simulados e biblioteca de dinâmicas
-- Rode no SQL Editor do Supabase. Pode rodar mais de uma vez.
-- =====================================================================

-- ---------- Banco de questões ----------
create table if not exists questoes (
  id            uuid primary key default gen_random_uuid(),
  banco         text not null,          -- anac, portugues, ingles, logico, numerico, verbal, sjt, tecnico
  origem_id     text,                   -- identificador na plataforma de origem (evita duplicar ao reimportar)
  categoria     text,                   -- ex.: bloco da ANAC
  contexto      text,                   -- texto de apoio (leitura, cenário)
  enunciado     text not null,
  imagem_url    text,
  alternativas  jsonb not null,         -- [{"letra":"A","texto":"...","imagem_url":null}]
  correta       text check (correta in ('A','B','C','D','E')),
  explicacao    text,
  ativo         boolean not null default true,
  created_at    timestamptz not null default now(),
  unique (banco, origem_id)
);
create index if not exists questoes_banco on questoes (banco, categoria) where ativo;

-- ---------- Simulados ----------
create table if not exists simulados (
  id               smallint generated always as identity primary key,
  titulo           text not null check (char_length(titulo) between 2 and 160),
  descricao        text,
  bancos           text[] not null,
  categorias       text[],               -- filtro opcional dentro dos bancos
  qtd_questoes     smallint not null default 20 check (qtd_questoes between 1 and 200),
  tempo_min        smallint check (tempo_min between 1 and 300),  -- vazio = sem cronômetro
  nota_minima      smallint not null default 70 check (nota_minima between 0 and 100),
  mostrar_gabarito boolean not null default true,
  origem           text unique,
  created_at       timestamptz not null default now()
);

alter table aulas   add column if not exists simulado_id smallint references simulados(id) on delete set null;
alter table aulas   add column if not exists origem text unique;
alter table modulos add column if not exists recurso text;   -- ex.: 'dinamicas' mostra a biblioteca no módulo

create table if not exists tentativas (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references profiles(id) on delete cascade,
  simulado_id    smallint not null references simulados(id) on delete cascade,
  questoes       uuid[] not null,
  respostas      jsonb not null default '{}'::jsonb,   -- {"<questao_id>": "B"}
  total          smallint not null,
  acertos        smallint,
  nota           smallint,
  iniciada_em    timestamptz not null default now(),
  prazo          timestamptz,
  finalizada_em  timestamptz
);
create index if not exists tentativas_user on tentativas (user_id, simulado_id, iniciada_em desc);

-- ---------- Dinâmicas de grupo ----------
create table if not exists dinamicas_categorias (
  id         smallint generated always as identity primary key,
  slug       text not null unique,
  titulo     text not null,
  descricao  text,
  ordem      smallint not null default 0,
  ativo      boolean not null default true
);

create table if not exists dinamicas (
  id                uuid primary key default gen_random_uuid(),
  categoria_id      smallint references dinamicas_categorias(id) on delete set null,
  titulo            text not null,
  objetivo          text,
  materiais         text,
  como_realizada    text,
  como_se_destacar  text,
  ordem             smallint not null default 0,
  ativo             boolean not null default true,
  origem_id         text unique,
  created_at        timestamptz not null default now()
);

-- ---------- Segurança ----------
alter table questoes             enable row level security;
alter table simulados            enable row level security;
alter table tentativas           enable row level security;
alter table dinamicas_categorias enable row level security;
alter table dinamicas            enable row level security;

-- Questões: só administradores leem direto (alunos recebem pelas funções abaixo, sem o gabarito)
drop policy if exists "admin gerencia" on questoes;
create policy "admin gerencia" on questoes for all using (is_admin()) with check (is_admin());

drop policy if exists "logado ve" on simulados;
create policy "logado ve" on simulados for select to authenticated using (true);
drop policy if exists "admin gerencia" on simulados;
create policy "admin gerencia" on simulados for all using (is_admin()) with check (is_admin());

drop policy if exists "ve as proprias" on tentativas;
create policy "ve as proprias" on tentativas for select using (user_id = auth.uid() or is_admin());
-- sem insert/update direto: tudo passa pelas funções

drop policy if exists "logado ve ativas" on dinamicas_categorias;
create policy "logado ve ativas" on dinamicas_categorias for select to authenticated using (ativo or is_admin());
drop policy if exists "admin gerencia" on dinamicas_categorias;
create policy "admin gerencia" on dinamicas_categorias for all using (is_admin()) with check (is_admin());
drop policy if exists "logado ve ativas" on dinamicas;
create policy "logado ve ativas" on dinamicas for select to authenticated using (ativo or is_admin());
drop policy if exists "admin gerencia" on dinamicas;
create policy "admin gerencia" on dinamicas for all using (is_admin()) with check (is_admin());

-- ---------- Funções do simulado ----------
-- O aluno pode fazer o simulado se ele estiver numa aula publicada de um módulo publicado
create or replace function simulado_liberado(p_simulado smallint) returns boolean
language sql stable security definer set search_path = public as $$
  select is_admin() or exists (
    select 1 from aulas a join modulos m on m.id = a.modulo_id
    where a.simulado_id = p_simulado and a.publicado and m.publicado
  );
$$;

-- Fecha e corrige a tentativa (uso interno)
create or replace function _corrigir_tentativa(p_tentativa uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_acertos int;
begin
  select count(*) into v_acertos
  from tentativas t, unnest(t.questoes) qid
  join questoes q on q.id = qid
  where t.id = p_tentativa and upper(t.respostas ->> qid::text) = q.correta;

  update tentativas set
    acertos = v_acertos,
    nota = round(v_acertos * 100.0 / greatest(total, 1)),
    finalizada_em = coalesce(finalizada_em, least(now(), coalesce(prazo, now())))
  where id = p_tentativa and finalizada_em is null;
end;
$$;

-- Começa (ou continua) um simulado e devolve o id da tentativa
create or replace function iniciar_simulado(p_simulado smallint) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  s simulados;
  v_id uuid;
  v_ids uuid[];
begin
  if v_user is null then raise exception 'Faça login para continuar'; end if;
  select * into s from simulados where id = p_simulado;
  if not found or not simulado_liberado(p_simulado) then raise exception 'Simulado indisponível'; end if;

  -- tentativa em andamento e dentro do prazo: continua de onde parou
  select id into v_id from tentativas
  where user_id = v_user and simulado_id = p_simulado and finalizada_em is null
    and (prazo is null or prazo > now())
  order by iniciada_em desc limit 1;
  if v_id is not null then return v_id; end if;

  -- tentativas vencidas são fechadas e corrigidas
  perform _corrigir_tentativa(t.id) from tentativas t
  where t.user_id = v_user and t.simulado_id = p_simulado and t.finalizada_em is null;

  select array_agg(id) into v_ids from (
    select id from questoes
    where ativo and banco = any(s.bancos) and (s.categorias is null or categoria = any(s.categorias))
    order by random() limit s.qtd_questoes
  ) x;
  if v_ids is null then raise exception 'Este simulado ainda não tem questões'; end if;

  insert into tentativas (user_id, simulado_id, questoes, total, prazo)
  values (v_user, p_simulado, v_ids, array_length(v_ids, 1),
          case when s.tempo_min is null then null else now() + make_interval(mins => s.tempo_min) end)
  returning id into v_id;
  return v_id;
end;
$$;

-- Questões da tentativa, na ordem sorteada e SEM gabarito
create or replace function questoes_da_tentativa(p_tentativa uuid)
returns table (ordem int, id uuid, categoria text, contexto text, enunciado text, imagem_url text, alternativas jsonb, resposta text)
language sql stable security definer set search_path = public as $$
  select o.ordem::int, q.id, q.categoria, q.contexto, q.enunciado, q.imagem_url,
         (select jsonb_agg(jsonb_build_object('letra', a->>'letra', 'texto', a->>'texto', 'imagem_url', a->>'imagem_url') order by a->>'letra')
            from jsonb_array_elements(q.alternativas) a),
         t.respostas ->> q.id::text
  from tentativas t
  cross join lateral unnest(t.questoes) with ordinality o(qid, ordem)
  join questoes q on q.id = o.qid
  where t.id = p_tentativa and (t.user_id = auth.uid() or is_admin())
  order by o.ordem;
$$;

-- Salva a resposta de uma questão (enquanto a tentativa estiver aberta e no prazo, com 1 minuto de tolerância)
create or replace function responder_questao(p_tentativa uuid, p_questao uuid, p_letra text) returns boolean
language plpgsql security definer set search_path = public as $$
declare v_ok int;
begin
  if upper(coalesce(p_letra, '')) not in ('A','B','C','D','E') then return false; end if;
  update tentativas
     set respostas = respostas || jsonb_build_object(p_questao::text, upper(p_letra))
   where id = p_tentativa and user_id = auth.uid() and finalizada_em is null
     and p_questao = any(questoes)
     and (prazo is null or prazo + interval '1 minute' > now());
  get diagnostics v_ok = row_count;
  return v_ok = 1;
end;
$$;

-- Entrega o simulado e devolve a nota
create or replace function finalizar_tentativa(p_tentativa uuid) returns smallint
language plpgsql security definer set search_path = public as $$
declare v_nota smallint;
begin
  if not exists (select 1 from tentativas where id = p_tentativa and user_id = auth.uid()) then
    raise exception 'Tentativa não encontrada';
  end if;
  perform _corrigir_tentativa(p_tentativa);
  select nota into v_nota from tentativas where id = p_tentativa;
  return v_nota;
end;
$$;

-- Gabarito comentado: só depois de entregue
create or replace function gabarito_da_tentativa(p_tentativa uuid)
returns table (ordem int, id uuid, categoria text, contexto text, enunciado text, imagem_url text, alternativas jsonb, resposta text, correta text, explicacao text)
language sql stable security definer set search_path = public as $$
  select o.ordem::int, q.id, q.categoria, q.contexto, q.enunciado, q.imagem_url,
         (select jsonb_agg(jsonb_build_object('letra', a->>'letra', 'texto', a->>'texto', 'imagem_url', a->>'imagem_url') order by a->>'letra')
            from jsonb_array_elements(q.alternativas) a),
         t.respostas ->> q.id::text, q.correta, q.explicacao
  from tentativas t
  join simulados s on s.id = t.simulado_id
  cross join lateral unnest(t.questoes) with ordinality o(qid, ordem)
  join questoes q on q.id = o.qid
  where t.id = p_tentativa and t.finalizada_em is not null
    and (t.user_id = auth.uid() or is_admin())
    and (s.mostrar_gabarito or is_admin())
  order by o.ordem;
$$;

-- Quantas questões ativas cada banco tem (painel do administrador)
create or replace function contagem_bancos() returns table (banco text, categoria text, total bigint)
language sql stable security definer set search_path = public as $$
  select banco, categoria, count(*) from questoes where ativo and is_admin() group by 1, 2 order by 1, 2;
$$;

revoke all on function _corrigir_tentativa(uuid) from public, anon, authenticated;
revoke all on function iniciar_simulado(smallint), questoes_da_tentativa(uuid), responder_questao(uuid, uuid, text),
  finalizar_tentativa(uuid), gabarito_da_tentativa(uuid), contagem_bancos(), simulado_liberado(smallint) from public, anon;
grant execute on function iniciar_simulado(smallint), questoes_da_tentativa(uuid), responder_questao(uuid, uuid, text),
  finalizar_tentativa(uuid), gabarito_da_tentativa(uuid), contagem_bancos(), simulado_liberado(smallint) to authenticated;

-- O módulo 07 mostra a biblioteca de dinâmicas
update modulos set recurso = 'dinamicas' where ordem = 7 and recurso is null;
