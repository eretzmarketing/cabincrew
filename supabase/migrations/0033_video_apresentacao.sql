-- Cabin Crew · 0033 · Treino de vídeo de apresentação
-- O vídeo NUNCA sai do navegador do aluno: aqui fica só o registro do treino
-- (duração, autoavaliação e nota) para a jornada e o histórico.
-- Pode rodar mais de uma vez.

create table if not exists video_treinos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade default auth.uid(),
  duracao_seg integer not null check (duracao_seg between 1 and 600),
  meta_seg    integer not null check (meta_seg between 30 and 300),
  checklist   jsonb not null default '[]'::jsonb,
  nota        smallint not null check (nota between 0 and 100),
  created_at  timestamptz not null default now()
);
create index if not exists video_treinos_user on video_treinos (user_id, created_at desc);

alter table video_treinos enable row level security;

drop policy if exists "aluno ve os proprios treinos de video" on video_treinos;
create policy "aluno ve os proprios treinos de video" on video_treinos
  for select to authenticated using (user_id = auth.uid() or is_admin());

drop policy if exists "aluno registra o proprio treino de video" on video_treinos;
create policy "aluno registra o proprio treino de video" on video_treinos
  for insert to authenticated with check (user_id = auth.uid());

grant select, insert on video_treinos to authenticated;

select 'video_treinos pronto' as status;
