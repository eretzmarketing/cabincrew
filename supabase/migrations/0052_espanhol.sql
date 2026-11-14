-- Cabin Crew · 0052 · Flight Attendant Spanish e Combo dos 3 cursos
--   • curso novo: Flight Attendant Spanish (R$ 197), com progresso próprio por aula
--   • combo novo: Head Hunter + English + Spanish (R$ 397); o combo HH + English continua
--   • certificados, planos, reset de módulo e avisos de WhatsApp passam a aceitar o espanhol
-- Pode rodar mais de uma vez.

-- ---------- progresso das aulas de espanhol ----------
create table if not exists espanhol_progresso (
  user_id     uuid not null references profiles(id) on delete cascade,
  aula        text not null check (aula ~ '^\d{1,2}\.\d{1,2}$'),   -- ex.: 1.3
  nota        int  not null check (nota between 0 and 100),
  concluida   boolean not null default false,
  updated_at  timestamptz not null default now(),
  primary key (user_id, aula)
);
alter table espanhol_progresso enable row level security;
drop policy if exists "aluno ve o proprio progresso de espanhol" on espanhol_progresso;
create policy "aluno ve o proprio progresso de espanhol" on espanhol_progresso
  for select to authenticated using (user_id = auth.uid() or is_admin());
drop policy if exists "aluno grava o proprio progresso de espanhol" on espanhol_progresso;
create policy "aluno grava o proprio progresso de espanhol" on espanhol_progresso
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "aluno atualiza o proprio progresso de espanhol" on espanhol_progresso;
create policy "aluno atualiza o proprio progresso de espanhol" on espanhol_progresso
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update on espanhol_progresso to authenticated;

-- ---------- planos ----------
create or replace function produtos_confere_inclui() returns trigger language plpgsql as $$
begin
  if new.inclui is null or cardinality(new.inclui) = 0 or not (new.inclui <@ array['head-hunter', 'english', 'spanish']) then
    raise exception 'O plano precisa incluir pelo menos um curso: Head Hunter, Flight Attendant English ou Flight Attendant Spanish.';
  end if;
  if new.slug in ('head-hunter', 'english', 'spanish') and new.excluido then
    raise exception 'Os cursos Head Hunter, Flight Attendant English e Flight Attendant Spanish não podem ser excluídos, só desativados.';
  end if;
  return new;
end $$;

insert into produtos (slug, nome, descricao, preco, desconto_pix, ordem, inclui, endereco, topicos) values
  ('spanish', 'Flight Attendant Spanish',
   'Curso de espanhol para aviação: o espanhol que o comissário usa a bordo, do embarque ao desembarque, com diálogos em áudio e exercícios.',
   197, 5, 3, array['spanish'], '/spanish', array[
     '8 módulos e 24 aulas, do briefing ao desembarque',
     'Diálogos de bordo com áudio em espanhol',
     'Sotaques da Espanha, México, Argentina, Colômbia e Chile',
     'Falsos amigos do português que confundem a bordo',
     'Serviço, passageiros, saúde e emergências em espanhol',
     'Vocabulário de aviação e exercícios com correção'
   ]),
  ('combo-completo', 'Combo completo',
   'Head Hunter + Flight Attendant English + Flight Attendant Spanish: a preparação para a seleção e os dois idiomas da aviação.',
   397, 5, 5, array['head-hunter', 'english', 'spanish'], '/head-hunter', array[
     'Tudo do Head Hunter',
     'Tudo do Flight Attendant English',
     'Tudo do Flight Attendant Spanish',
     'A maior economia em relação aos cursos separados'
   ])
on conflict (slug) do nothing;
update produtos set destaque = 'Mais completo' where slug = 'combo-completo' and destaque is null;
-- o combo HH + English vem depois dos três cursos (se você ainda não mudou a ordem)
update produtos set ordem = 4 where slug = 'combo' and ordem = 3;

-- ---------- certificados ----------
alter table certificado_modelos drop constraint if exists certificado_modelos_curso_check;
alter table certificado_modelos add constraint certificado_modelos_curso_check check (curso in ('head-hunter', 'english', 'spanish'));
alter table certificados drop constraint if exists certificados_curso_check;
alter table certificados add constraint certificados_curso_check check (curso in ('head-hunter', 'english', 'spanish'));

-- nota do curso: média dos simulados/treinos (Head Hunter) ou dos quizzes (English, Spanish)
create or replace function _nota_curso(p_user uuid, p_curso text) returns numeric
language sql stable security definer set search_path = public as $$
  select round(avg(n)::numeric, 1) from (
    select t.nota::numeric as n from tentativas t where p_curso = 'head-hunter' and t.user_id = p_user and t.finalizada_em is not null and t.nota is not null
    union all
    select ip.nota::numeric from ingles_progresso ip where p_curso = 'english' and ip.user_id = p_user and ip.concluida
    union all
    select ep.nota::numeric from espanhol_progresso ep where p_curso = 'spanish' and ep.user_id = p_user and ep.concluida
  ) x;
$$;

-- ---------- admin: resetar módulo ----------
create or replace function admin_resetar_modulo(p_user uuid, p_curso text, p_modulo integer)
returns integer language plpgsql security definer set search_path = public as $$
declare n integer := 0; m integer;
begin
  perform _exige_admin();
  if p_curso = 'english' then
    delete from ingles_progresso where user_id = p_user and split_part(aula, '.', 1) = p_modulo::text;
    get diagnostics n = row_count;
  elsif p_curso = 'spanish' then
    delete from espanhol_progresso where user_id = p_user and split_part(aula, '.', 1) = p_modulo::text;
    get diagnostics n = row_count;
  else
    delete from progresso pr using aulas a
     where pr.user_id = p_user and pr.aula_id = a.id and a.modulo_id = p_modulo;
    get diagnostics n = row_count;
    delete from tentativas t using aulas a
     where t.user_id = p_user and a.modulo_id = p_modulo and a.simulado_id is not null and t.simulado_id = a.simulado_id;
    get diagnostics m = row_count;
    n := n + m;
  end if;
  -- se o curso estava concluído (período de revisão), volta a valer normalmente
  update acessos set concluido_em = null, expira_em = null where user_id = p_user and produto = p_curso and status = 'ativo';
  return n;
end $$;
revoke all on function admin_resetar_modulo(uuid, text, integer) from public, anon;
grant execute on function admin_resetar_modulo(uuid, text, integer) to authenticated;

-- ---------- avisos de WhatsApp ----------
insert into whatsapp_modelos (evento, titulo, quando, texto) values
  ('espanhol_modulo', 'Módulo de espanhol concluído', 'Quando o aluno conclui um módulo do Flight Attendant Spanish.',
   E'¡Muy bien, {nome}! 🇪🇸 Você concluiu o Módulo {numero} do Flight Attendant Spanish: {modulo}.\n\nPróxima aula:\n👉 {link}/spanish'),
  ('espanhol_concluido', 'Flight Attendant Spanish concluído', 'Quando o aluno conclui todas as aulas do Flight Attendant Spanish.',
   E'¡Felicidades, {nome}! 🏆 Você concluiu o Flight Attendant Spanish.\n\nSeu certificado já está disponível:\n👉 {link}/spanish')
on conflict (evento) do nothing;

notify pgrst, 'reload schema';
select 'espanhol pronto' as status, string_agg(slug || ' R$ ' || preco, ' · ' order by ordem) as produtos from produtos where not excluido;
