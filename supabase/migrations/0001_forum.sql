-- =====================================================================
-- Cabin Crew — Fórum de Seleções
-- Rode este arquivo inteiro no SQL Editor do Supabase (uma vez).
-- =====================================================================

-- ---------- Tipos ----------
create type status_selecao as enum ('inscricoes', 'andamento', 'encerrada');
create type formato_etapa  as enum ('online', 'presencial');
create type resultado_etapa as enum ('avancou', 'aguardando', 'nao_avancou');
create type status_relato  as enum ('publicado', 'oculto');

-- ---------- Tabelas ----------
create table companhias (
  id    smallint generated always as identity primary key,
  nome  text not null unique,
  slug  text not null unique
);

create table fases (
  id        smallint primary key,
  nome      text not null,
  descricao text not null
);

create table selecoes (
  id            uuid primary key default gen_random_uuid(),
  companhia_id  smallint not null references companhias(id),
  cargo         text not null default 'Comissários de voo',
  base          text not null,                 -- ex.: GRU
  base_nome     text,                          -- ex.: Guarulhos
  mes_ref       date not null,                 -- 1º dia do mês do processo
  slug          text not null unique,
  status        status_selecao not null default 'andamento',
  aberta_em     date,
  observacao    text,
  created_at    timestamptz not null default now()
);

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  apelido     text not null,
  is_admin    boolean not null default false,
  pontos      integer not null default 0,
  created_at  timestamptz not null default now()
);

create table relatos (
  id             uuid primary key default gen_random_uuid(),
  selecao_id     uuid not null references selecoes(id) on delete cascade,
  fase_id        smallint not null references fases(id),
  autor_id       uuid not null default auth.uid() references profiles(id) on delete cascade,
  anonimo        boolean not null default true,
  base           text,
  data_etapa     date not null,
  formato        formato_etapa not null,
  duracao        text,
  participantes  integer check (participantes between 1 and 500),
  resultado      resultado_etapa not null,
  texto          text not null check (char_length(texto) between 40 and 3000),
  status         status_relato not null default 'publicado',
  created_at     timestamptz not null default now()
);
create index relatos_selecao_fase on relatos (selecao_id, fase_id, created_at desc);

create table confirmacoes (
  relato_id  uuid not null references relatos(id) on delete cascade,
  user_id    uuid not null default auth.uid() references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (relato_id, user_id)
);

create table denuncias (
  relato_id  uuid not null references relatos(id) on delete cascade,
  user_id    uuid not null default auth.uid() references profiles(id) on delete cascade,
  motivo     text not null check (char_length(motivo) between 3 and 500),
  resolvida  boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (relato_id, user_id)
);

create table lista_espera (
  email      text primary key check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  origem     text not null default 'crew-select',
  created_at timestamptz not null default now()
);

-- ---------- Funções auxiliares ----------
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

-- Cria o perfil quando alguém se cadastra
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, apelido)
  values (new.id, coalesce(nullif(split_part(new.email, '@', 1), ''), 'tripulante'));
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();

-- Pontos: +5 por relato, +2 para o autor a cada confirmação recebida
create or replace function pontos_relato() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update profiles set pontos = pontos + 5 where id = new.autor_id;
  return new;
end;
$$;
create trigger relato_pontos after insert on relatos
  for each row execute function pontos_relato();

create or replace function pontos_confirmacao() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update profiles set pontos = pontos + 2
      where id = (select autor_id from relatos where id = new.relato_id);
    return new;
  else
    update profiles set pontos = greatest(pontos - 2, 0)
      where id = (select autor_id from relatos where id = old.relato_id);
    return old;
  end if;
end;
$$;
create trigger confirmacao_pontos after insert or delete on confirmacoes
  for each row execute function pontos_confirmacao();

-- Moderação automática: 3 denúncias ocultam o relato até um admin revisar
create or replace function moderacao_auto() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from denuncias where relato_id = new.relato_id and not resolvida) >= 3 then
    update relatos set status = 'oculto' where id = new.relato_id;
  end if;
  return new;
end;
$$;
create trigger denuncia_moderacao after insert on denuncias
  for each row execute function moderacao_auto();

-- Ninguém confirma o próprio relato
create or replace function bloqueia_auto_confirmacao() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select autor_id from relatos where id = new.relato_id) = new.user_id then
    raise exception 'Você não pode confirmar o próprio relato';
  end if;
  return new;
end;
$$;
create trigger confirmacao_propria before insert on confirmacoes
  for each row execute function bloqueia_auto_confirmacao();

-- ---------- Segurança (RLS) ----------
alter table companhias   enable row level security;
alter table fases        enable row level security;
alter table selecoes     enable row level security;
alter table profiles     enable row level security;
alter table relatos      enable row level security;
alter table confirmacoes enable row level security;
alter table denuncias    enable row level security;
alter table lista_espera enable row level security;

create policy "leitura publica" on companhias for select using (true);
create policy "leitura publica" on fases      for select using (true);
create policy "leitura publica" on selecoes   for select using (true);
create policy "admin gerencia"  on companhias for all using (is_admin()) with check (is_admin());
create policy "admin gerencia"  on selecoes   for all using (is_admin()) with check (is_admin());

create policy "ver o proprio perfil" on profiles for select using (id = auth.uid() or is_admin());
create policy "editar o proprio apelido" on profiles for update using (id = auth.uid())
  with check (id = auth.uid());
-- impede que o usuário mude is_admin ou pontos pela API
revoke update on profiles from authenticated;
grant update (apelido) on profiles to authenticated;

-- relatos: leitura pública é feita pela view relatos_publicos (esconde o autor)
create policy "ver os proprios ou admin" on relatos for select
  using (autor_id = auth.uid() or is_admin());
create policy "logado publica" on relatos for insert to authenticated
  with check (autor_id = auth.uid() and status = 'publicado');
create policy "admin modera" on relatos for update using (is_admin()) with check (is_admin());
create policy "autor ou admin apaga" on relatos for delete using (autor_id = auth.uid() or is_admin());

create policy "ver as proprias" on confirmacoes for select using (user_id = auth.uid());
create policy "logado confirma" on confirmacoes for insert to authenticated with check (user_id = auth.uid());
create policy "desfaz a propria" on confirmacoes for delete using (user_id = auth.uid());

create policy "logado denuncia" on denuncias for insert to authenticated with check (user_id = auth.uid());
create policy "admin ve denuncias" on denuncias for select using (is_admin() or user_id = auth.uid());
create policy "admin resolve" on denuncias for update using (is_admin()) with check (is_admin());

create policy "qualquer um entra na lista" on lista_espera for insert to anon, authenticated with check (true);

-- ---------- Views de leitura ----------
-- Relatos publicados, sem expor quem escreveu quando é anônimo
create view relatos_publicos as
select
  r.id, r.selecao_id, r.fase_id, r.base, r.data_etapa, r.formato, r.duracao,
  r.participantes, r.resultado, r.texto, r.created_at,
  case when r.anonimo then null else p.apelido end as autor_nome,
  (select count(*) from confirmacoes c where c.relato_id = r.id)::int as confirmacoes,
  (select count(*) from confirmacoes c where c.relato_id = r.id) >= 3 as verificado,
  exists (select 1 from confirmacoes c where c.relato_id = r.id and c.user_id = auth.uid()) as confirmei,
  (r.autor_id = auth.uid()) as meu
from relatos r
join profiles p on p.id = r.autor_id
where r.status = 'publicado';

-- Resumo de cada seleção para listas e cards
create view selecoes_resumo as
select
  s.*, c.nome as companhia, c.slug as companhia_slug,
  (select count(*) from relatos r where r.selecao_id = s.id and r.status = 'publicado')::int as total_relatos,
  (select max(r.fase_id) from relatos r where r.selecao_id = s.id and r.status = 'publicado') as fase_max,
  (select max(r.created_at) from relatos r where r.selecao_id = s.id and r.status = 'publicado') as ultimo_relato
from selecoes s
join companhias c on c.id = s.companhia_id;

grant select on relatos_publicos, selecoes_resumo to anon, authenticated;

-- ---------- Dados fixos ----------
insert into fases (id, nome, descricao) values
  (1, 'Inscrição',            'Gupy ou site da companhia'),
  (2, 'Testes online',        'Lógica, perfil e inglês'),
  (3, 'Dinâmica de grupo',    'Online ou presencial'),
  (4, 'Entrevista RH',        'Por competências'),
  (5, 'Entrevista em inglês', 'Conversação e leitura'),
  (6, 'Exames admissionais',  'Médicos e documentação'),
  (7, 'Treinamento',          'Curso na companhia');

insert into companhias (nome, slug) values
  ('LATAM', 'latam'), ('GOL', 'gol'), ('Azul', 'azul');
