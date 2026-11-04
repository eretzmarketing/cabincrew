-- =====================================================================
-- Cabin Crew — painel admin (configurações) + Crew Select (módulos, aulas, progresso)
-- Rode no SQL Editor do Supabase DEPOIS do 0001 e do 0002. Pode rodar mais de uma vez.
-- =====================================================================

-- ---------- Configurações do site (chaves liga/desliga) ----------
create table if not exists configuracoes (
  chave       text primary key,
  valor       jsonb not null,
  descricao   text,
  updated_at  timestamptz not null default now()
);
alter table configuracoes enable row level security;
drop policy if exists "leitura publica" on configuracoes;
create policy "leitura publica" on configuracoes for select using (true);
drop policy if exists "admin altera" on configuracoes;
create policy "admin altera" on configuracoes for all using (is_admin()) with check (is_admin());

insert into configuracoes (chave, valor, descricao) values
  ('forum_ativo',        'false', 'Fórum de Seleções visível no site'),
  ('crew_select_aberto', 'true',  'Crew Select liberado para todos os cadastrados')
on conflict (chave) do nothing;

-- ---------- Crew Select ----------
create table if not exists modulos (
  id          smallint generated always as identity primary key,
  ordem       smallint not null,
  titulo      text not null check (char_length(titulo) between 2 and 120),
  descricao   text,
  fase        text,                         -- fase da seleção a que o módulo prepara
  publicado   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists aulas (
  id           uuid primary key default gen_random_uuid(),
  modulo_id    smallint not null references modulos(id) on delete cascade,
  ordem        smallint not null default 1,
  titulo       text not null check (char_length(titulo) between 2 and 160),
  tipo         text not null default 'texto' check (tipo in ('texto', 'video', 'pdf', 'simulado')),
  resumo       text,
  conteudo     text,                        -- texto em Markdown
  video_url    text,                        -- YouTube, Vimeo ou link direto
  arquivo_url  text,                        -- PDF ou material de apoio
  duracao_min  smallint check (duracao_min between 1 and 600),
  publicado    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists aulas_modulo on aulas (modulo_id, ordem);

create table if not exists progresso (
  user_id      uuid not null default auth.uid() references profiles(id) on delete cascade,
  aula_id      uuid not null references aulas(id) on delete cascade,
  concluida_em timestamptz not null default now(),
  primary key (user_id, aula_id)
);

alter table modulos   enable row level security;
alter table aulas     enable row level security;
alter table progresso enable row level security;

drop policy if exists "logado ve publicados" on modulos;
create policy "logado ve publicados" on modulos for select to authenticated using (publicado or is_admin());
drop policy if exists "admin gerencia" on modulos;
create policy "admin gerencia" on modulos for all using (is_admin()) with check (is_admin());

drop policy if exists "logado ve publicadas" on aulas;
create policy "logado ve publicadas" on aulas for select to authenticated
  using (is_admin() or (publicado and exists (select 1 from modulos m where m.id = modulo_id and m.publicado)));
drop policy if exists "admin gerencia" on aulas;
create policy "admin gerencia" on aulas for all using (is_admin()) with check (is_admin());

drop policy if exists "ve o proprio" on progresso;
create policy "ve o proprio" on progresso for select using (user_id = auth.uid() or is_admin());
drop policy if exists "marca o proprio" on progresso;
create policy "marca o proprio" on progresso for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "desmarca o proprio" on progresso;
create policy "desmarca o proprio" on progresso for delete using (user_id = auth.uid());

-- Admin pode ver e editar todos os perfis (usuários) — o próprio usuário continua limitado
drop policy if exists "admin edita perfis" on profiles;
create policy "admin edita perfis" on profiles for update using (is_admin()) with check (is_admin());
grant update (is_admin) on profiles to authenticated;   -- só passa pela policy acima se quem altera é admin

-- Quem não é admin não pode mudar is_admin (nem de si mesmo)
create or replace function protege_is_admin() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() nulo = SQL Editor / servidor (permitido); pela API sempre há um usuário
  if new.is_admin is distinct from old.is_admin and auth.uid() is not null and not is_admin() then
    raise exception 'Somente administradores podem alterar permissões';
  end if;
  return new;
end;
$$;
drop trigger if exists profiles_protege_admin on profiles;
create trigger profiles_protege_admin before update on profiles
  for each row execute function protege_is_admin();

-- ---------- Os 13 módulos do Crew Select (só na primeira vez) ----------
insert into modulos (ordem, titulo, descricao, fase)
select * from (values
  (0,  'Diagnóstico e Plano de Voo',            'Teste de nivelamento, checklist de requisitos e escolha da companhia e da base.', 'Antes de começar'),
  (1,  'A Profissão e as Seleções',              'Como funcionam as seleções, etapas e prazos típicos, e a mentalidade profissional.', 'Visão geral'),
  (2,  'Conheça as Companhias',                  'GOL, LATAM e Azul: cultura, valores, perfil buscado e formato de seleção.', 'Visão geral'),
  (3,  'Requisitos, Documentos e Imagem Pessoal','Requisitos físicos, documentação, CMA, natação, passaporte e padrões de apresentação.', 'Inscrição'),
  (4,  'Inscrição e Triagem',                    'Currículo para aviação, ATS e perfil na Gupy e no site das companhias.', 'Inscrição e triagem'),
  (5,  'Banca ANAC',                             'Principais temas cobrados na banca e revisão por bloco.', 'Certificação'),
  (6,  'Testes Online',                          'Português, inglês, raciocínio lógico, SHL e perfil comportamental (SJT).', 'Testes online'),
  (7,  'Dinâmicas de Grupo',                     'Tipos de dinâmica, o que o avaliador observa e comportamentos que eliminam.', 'Dinâmica'),
  (8,  'Entrevistas',                            'Entrevista de RH, por competências (STAR) e em inglês.', 'Entrevistas'),
  (9,  'Atendimento e Situações de Cabine',      'Cultura de serviço, passageiros difíceis e anúncios de bordo.', 'Entrevistas e dinâmica'),
  (10, 'Comunicação e Apresentação Pessoal',     'Postura, gestos, contato visual, voz e ritmo.', 'Entrevistas'),
  (11, 'Reta Final',                             'Guia do dia da seleção, simulado final completo e prova técnica.', 'Todas as fases'),
  (12, 'Aprovado, e agora?',                     'Exames admissionais, treinamento na companhia, escolha de base e primeiros meses.', 'Admissão')
) as v(ordem, titulo, descricao, fase)
where not exists (select 1 from modulos);
