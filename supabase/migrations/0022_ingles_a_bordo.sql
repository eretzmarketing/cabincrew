-- Cabin Crew · 0022 · Curso "Inglês a bordo"
-- 1) Progresso do aluno em cada aula (nota do quiz).
-- 2) Lista dos áudios do curso: MP3 subidos na galeria de Mídia com nome "1.1.mp3", "1.2.mp3"…
--    O nome precisa começar pelo número da aula: "1.1.mp3", "1.1 - Introducing.mp3" ou "Aula 1.1.mp3".
--    (a tabela midias é só do administrador; esta função entrega aos alunos apenas nome e endereço dos áudios).
-- Pode rodar mais de uma vez.

create table if not exists ingles_progresso (
  user_id     uuid not null references profiles(id) on delete cascade,
  aula        text not null check (aula ~ '^\d{1,2}\.\d{1,2}$'),   -- ex.: 1.3
  nota        int  not null check (nota between 0 and 100),
  concluida   boolean not null default false,
  updated_at  timestamptz not null default now(),
  primary key (user_id, aula)
);

alter table ingles_progresso enable row level security;
drop policy if exists "aluno ve o proprio progresso de ingles" on ingles_progresso;
create policy "aluno ve o proprio progresso de ingles" on ingles_progresso
  for select to authenticated using (user_id = auth.uid() or is_admin());
drop policy if exists "aluno grava o proprio progresso de ingles" on ingles_progresso;
create policy "aluno grava o proprio progresso de ingles" on ingles_progresso
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "aluno atualiza o proprio progresso de ingles" on ingles_progresso;
create policy "aluno atualiza o proprio progresso de ingles" on ingles_progresso
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update on ingles_progresso to authenticated;

create or replace function audios_ingles()
returns table (nome text, arquivo text)
language sql stable security definer set search_path = public as $$
  select m.nome, m.arquivo
  from midias m
  where m.tipo = 'audio' and m.nome ~* '^\s*(aula\s*)?\d{1,2}\.\d{1,2}([^\d]|$)'
  order by m.created_at desc
$$;
revoke all on function audios_ingles() from public, anon;
grant execute on function audios_ingles() to authenticated;

notify pgrst, 'reload schema';

select 'Inglês a bordo pronto' as status;
