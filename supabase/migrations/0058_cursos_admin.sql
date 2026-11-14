-- Cabin Crew · 0058 · Admin › Cursos
--   • cursos: título, descrição e imagem de destaque de cada curso (Head Hunter, English, Spanish), editáveis no admin
--   • idioma_conteudo: ajustes do admin nos cursos de idioma (editar, ocultar, excluir, criar e reordenar módulos e aulas)
--   • modulos.treino_pos_curso: módulos do Head Hunter que mostram "disponível para treinamento até DD/MM/AAAA"
-- Rode depois do 0057. Pode rodar mais de uma vez.

-- ---------------------------------------------------------------- cursos
create table if not exists cursos (
  slug          text primary key check (slug in ('head-hunter', 'english', 'spanish')),
  titulo        text not null check (length(titulo) between 2 and 120),
  descricao     text not null default '' check (length(descricao) <= 4000),
  imagem        text check (imagem is null or imagem ~ '^(/|https://)'),
  ordem         integer not null default 0,
  atualizado_em timestamptz not null default now()
);
alter table cursos enable row level security;
drop policy if exists "cursos: todos leem" on cursos;
create policy "cursos: todos leem" on cursos for select using (true);
drop policy if exists "cursos: admin altera" on cursos;
create policy "cursos: admin altera" on cursos for all to authenticated using (is_admin()) with check (is_admin());

grant select on cursos to anon, authenticated;
grant insert, update, delete on cursos to authenticated;

insert into cursos (slug, titulo, descricao, imagem, ordem) values
  ('head-hunter', 'Head Hunter',
   coalesce((select descricao from produtos where slug = 'head-hunter'), 'Preparatório completo para a seleção de comissário(a) de voo.'),
   '/img/crew-select.jpg', 1),
  ('english', 'Flight Attendant English',
   'O inglês que o comissário usa de verdade, do briefing ao desembarque. Ouça diálogos, pratique a fala, escreva e teste o que aprendeu em cada aula.',
   '/img/ingles/cena-01.jpg', 2),
  ('spanish', 'Flight Attendant Spanish',
   'O espanhol que o comissário usa a bordo, do briefing ao desembarque, com atenção aos falsos amigos do português. Ouça diálogos, pratique a fala, escreva e teste o que aprendeu em cada aula.',
   '/img/ingles/cena-05.jpg', 3)
on conflict (slug) do nothing;
update cursos set imagem = '/img/crew-select.jpg' where slug = 'head-hunter' and imagem = '/img/head-hunter.jpg';

-- ---------------------------------------------------------------- cursos de idioma: ajustes do admin
-- O conteúdo original das aulas fica no código do site; aqui ficam só as mudanças feitas no admin.
-- aula = 0 é o próprio módulo. dados: só os campos alterados (ou a aula inteira, quando foi criada no admin).
create table if not exists idioma_conteudo (
  curso         text not null check (curso in ('english', 'spanish')),
  modulo        integer not null check (modulo between 1 and 99),
  aula          integer not null check (aula between 0 and 99),
  dados         jsonb not null default '{}'::jsonb,
  oculto        boolean not null default false,
  excluido      boolean not null default false,
  novo          boolean not null default false,       -- criado no admin (não existe no código)
  ordem         integer,
  atualizado_em timestamptz not null default now(),
  primary key (curso, modulo, aula)
);
alter table idioma_conteudo enable row level security;
drop policy if exists "idioma_conteudo: quem tem o curso lê" on idioma_conteudo;
create policy "idioma_conteudo: quem tem o curso lê" on idioma_conteudo for select to authenticated using (is_admin() or tem_acesso(curso, auth.uid()));
drop policy if exists "idioma_conteudo: admin altera" on idioma_conteudo;
create policy "idioma_conteudo: admin altera" on idioma_conteudo for all to authenticated using (is_admin()) with check (is_admin());

grant select, insert, update, delete on idioma_conteudo to authenticated;

-- para o gerador de áudio (roda no servidor, com a chave do site)
create or replace function idioma_conteudo_servidor(p_chave text, p_curso text)
returns setof idioma_conteudo language plpgsql stable security definer set search_path = public as $$
begin
  perform _confere_chave(p_chave);
  return query select * from idioma_conteudo where curso = p_curso;
end $$;
revoke all on function idioma_conteudo_servidor(text, text) from public;
grant execute on function idioma_conteudo_servidor(text, text) to anon, authenticated;

-- ---------------------------------------------------------------- Head Hunter: módulos de treino
alter table modulos add column if not exists treino_pos_curso boolean not null default false;
do $$ begin
  if not exists (select 1 from modulos where treino_pos_curso) then
    update modulos set treino_pos_curso = true where titulo ilike '%testes online%' or titulo ilike '%racioc%';
  end if;
end $$;

notify pgrst, 'reload schema';
select 'cursos pronto' as status;
