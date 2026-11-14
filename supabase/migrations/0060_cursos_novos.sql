-- Cabin Crew · 0060 · Criar cursos pelo admin
--   • cursos: qualquer curso (não só Head Hunter, English e Spanish), com tipo e situação (publicado ou rascunho)
--   • módulos e aulas pertencem a um curso; os alunos só veem as aulas do curso que compraram
--   • planos, certificados e simulados aceitam os cursos novos
-- Rode depois do 0059. Pode rodar mais de uma vez.

-- ---------------------------------------------------------------- cursos
alter table cursos drop constraint if exists cursos_slug_check;
alter table cursos add constraint cursos_slug_check check (slug ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$');
alter table cursos add column if not exists tipo text not null default 'padrao';
alter table cursos drop constraint if exists cursos_tipo_check;
alter table cursos add constraint cursos_tipo_check check (tipo in ('head-hunter', 'idioma', 'padrao'));
alter table cursos add column if not exists publicado boolean not null default true;
alter table cursos add column if not exists criado_em timestamptz not null default now();
update cursos set tipo = 'head-hunter' where slug = 'head-hunter';
update cursos set tipo = 'idioma' where slug in ('english', 'spanish');
-- os 3 cursos originais existem sempre (o 0058 já cria; aqui só garante)
insert into cursos (slug, titulo, tipo, ordem) values
  ('head-hunter', 'Head Hunter', 'head-hunter', 1), ('english', 'Flight Attendant English', 'idioma', 2), ('spanish', 'Flight Attendant Spanish', 'idioma', 3)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------- módulos e aulas por curso
alter table modulos add column if not exists curso text not null default 'head-hunter';
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'modulos_curso_fkey') then
    alter table modulos add constraint modulos_curso_fkey foreign key (curso) references cursos(slug) on update cascade on delete cascade;
  end if;
end $$;
create index if not exists modulos_curso_ordem on modulos (curso, ordem);

alter table aulas add column if not exists curso text not null default 'head-hunter';
update aulas a set curso = m.curso from modulos m where m.id = a.modulo_id and a.curso is distinct from m.curso;
create or replace function aulas_curso_do_modulo() returns trigger language plpgsql as $$
begin
  select curso into new.curso from modulos where id = new.modulo_id;
  return new;
end $$;
drop trigger if exists aulas_curso_trg on aulas;
create trigger aulas_curso_trg before insert or update of modulo_id on aulas for each row execute function aulas_curso_do_modulo();
create index if not exists aulas_curso on aulas (curso);

-- cada aluno vê os módulos publicados e as aulas publicadas dos cursos que ele tem
drop policy if exists "logado ve publicados" on modulos;
create policy "logado ve publicados" on modulos for select to authenticated using (is_admin() or publicado);
drop policy if exists "logado ve publicadas" on aulas;
create policy "logado ve publicadas" on aulas for select to authenticated
  using (is_admin() or (publicado and tem_acesso(curso, auth.uid()) and exists (select 1 from modulos m where m.id = modulo_id and m.publicado)));

-- simulado dentro da aula de um curso: libera para quem tem aquele curso
create or replace function simulado_liberado(p_simulado smallint) returns boolean
language sql stable security definer set search_path = public as $$
  select is_admin() or (
    not esta_bloqueado()
    and (
      coalesce((select origem from simulados where id = p_simulado), '') like 'cc-anac%'
      or (
        exists (select 1 from profiles where id = auth.uid() and avatar_em is not null)
        and exists (
          select 1 from aulas a join modulos m on m.id = a.modulo_id
          where a.simulado_id = p_simulado and a.publicado and m.publicado and tem_acesso(m.curso, auth.uid())
        )
      )
    )
  );
$$;

-- ---------------------------------------------------------------- planos: qualquer curso
create or replace function produtos_confere_inclui() returns trigger language plpgsql as $$
begin
  if new.inclui is null or cardinality(new.inclui) = 0 or not (new.inclui <@ (select coalesce(array_agg(slug), '{}') from cursos)) then
    raise exception 'O plano precisa incluir pelo menos um curso.';
  end if;
  if new.slug in ('head-hunter', 'english', 'spanish') and new.excluido then
    raise exception 'Os cursos Head Hunter, Flight Attendant English e Flight Attendant Spanish não podem ser excluídos, só desativados.';
  end if;
  return new;
end $$;

-- ---------------------------------------------------------------- certificados: qualquer curso
alter table certificado_modelos drop constraint if exists certificado_modelos_curso_check;
alter table certificados drop constraint if exists certificados_curso_check;
alter table certificado_modelos add constraint certificado_modelos_curso_check check (curso ~ '^[a-z0-9-]{3,50}$');
alter table certificados add constraint certificados_curso_check check (curso ~ '^[a-z0-9-]{3,50}$');

-- nota no certificado dos cursos novos: média dos simulados das aulas do curso
create or replace function _nota_curso(p_user uuid, p_curso text) returns numeric
language sql stable security definer set search_path = public as $$
  select round(avg(n)::numeric, 1) from (
    select t.nota::numeric as n from tentativas t where p_curso = 'head-hunter' and t.user_id = p_user and t.finalizada_em is not null and t.nota is not null
    union all
    select ip.nota::numeric from ingles_progresso ip where p_curso = 'english' and ip.user_id = p_user and ip.concluida
    union all
    select ep.nota::numeric from espanhol_progresso ep where p_curso = 'spanish' and ep.user_id = p_user and ep.concluida
    union all
    select t.nota::numeric from tentativas t
     where p_curso not in ('head-hunter', 'english', 'spanish') and t.user_id = p_user and t.finalizada_em is not null and t.nota is not null
       and t.simulado_id in (select a.simulado_id from aulas a where a.curso = p_curso and a.simulado_id is not null)
  ) x;
$$;

-- ---------------------------------------------------------------- curso novo concluído: aluno marcou todas as aulas
create or replace function curso_concluir(p_curso text) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare v_falta int;
begin
  if p_curso in ('head-hunter', 'english', 'spanish') then raise exception 'Curso com regra própria'; end if;
  select count(*) into v_falta from aulas a join modulos m on m.id = a.modulo_id
   where a.curso = p_curso and a.publicado and m.publicado
     and not exists (select 1 from progresso p where p.aula_id = a.id and p.user_id = auth.uid());
  if v_falta > 0 then return null; end if;
  return concluir_acesso(p_curso);
end $$;
revoke all on function curso_concluir(text) from public, anon;
grant execute on function curso_concluir(text) to authenticated;

notify pgrst, 'reload schema';
select 'cursos novos prontos' as status;
