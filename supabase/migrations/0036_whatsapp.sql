-- Cabin Crew · 0036 · Mensagens automáticas de WhatsApp (Wawp)
-- Modelos editáveis no admin, registro de cada envio (sem repetir o mesmo aviso) e
-- a opção do aluno de não receber avisos (Minha conta). O envio em si é feito pelo servidor do site,
-- com o token do Wawp guardado só no servidor. Pode rodar mais de uma vez.

alter table profiles add column if not exists whatsapp_avisos boolean not null default true;
grant update (whatsapp_avisos) on profiles to authenticated;

create table if not exists whatsapp_modelos (
  evento     text primary key,
  titulo     text not null,
  quando     text not null,
  texto      text not null,
  ativo      boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table whatsapp_modelos enable row level security;
drop policy if exists "modelos de whatsapp: leitura" on whatsapp_modelos;
create policy "modelos de whatsapp: leitura" on whatsapp_modelos for select to authenticated using (true);
drop policy if exists "modelos de whatsapp: admin" on whatsapp_modelos;
create policy "modelos de whatsapp: admin" on whatsapp_modelos for all to authenticated using (is_admin()) with check (is_admin());
grant select, insert, update on whatsapp_modelos to authenticated;

insert into whatsapp_modelos (evento, titulo, quando, texto) values
  ('boas_vindas', 'Boas-vindas', 'Logo depois do cadastro no site.',
   E'Olá, {nome}! ✈️ Seja bem-vindo(a) ao Cabin Crew. Aqui é o Daniel.\n\nSeu cadastro está pronto. O primeiro passo é o check-in do Head Hunter: em 2 minutos você escolhe a companhia e monta a sua jornada até a aprovação.\n👉 {link}/head-hunter/checkin\n\nQualquer dúvida, é só responder esta mensagem.\n\n(Se preferir não receber estes avisos, desligue em Minha conta.)'),
  ('checkin', 'Jornada montada', 'No primeiro check-in do Head Hunter.',
   E'{nome}, sua jornada rumo à {companhia} está montada! 🎯\n\nTodo dia aparece a Missão do dia no seu painel, com cerca de 30 minutos de estudo. Constância é o que aprova.\n👉 {link}/head-hunter'),
  ('modulo_concluido', 'Módulo concluído', 'Quando o aluno conclui todas as aulas de um módulo do Head Hunter.',
   E'Parabéns, {nome}! 🎉 Você concluiu o módulo "{modulo}" do Head Hunter.\n\nSiga no ritmo, o próximo passo já está no seu painel:\n👉 {link}/head-hunter'),
  ('ingles_modulo', 'Módulo de inglês concluído', 'Quando o aluno conclui um módulo do Inglês a bordo.',
   E'Well done, {nome}! 🇬🇧 Você concluiu o Módulo {numero} do Inglês a bordo: {modulo}.\n\nPróxima aula:\n👉 {link}/head-hunter/ingles-a-bordo'),
  ('ingles_concluido', 'Inglês a bordo concluído', 'Quando o aluno conclui as 44 aulas do Inglês a bordo.',
   E'Congratulations, {nome}! 🏆 Você concluiu o curso Inglês a bordo inteiro.\n\nAgora treine a Entrevista em inglês para chegar afiado(a) na seleção:\n👉 {link}/head-hunter/entrevista-ingles'),
  ('jornada_concluida', 'Jornada completa', 'Quando o aluno conclui todas as etapas da jornada do Head Hunter.',
   E'{nome}, você concluiu toda a jornada do Head Hunter! 👑\n\nAgora é manter a forma: simulados no modo Prova real, revisão dos pontos fracos e olho nos editais. Boa sorte na seleção! ✈️\n👉 {link}/head-hunter')
on conflict (evento) do nothing;

create table if not exists whatsapp_envios (
  id         bigserial primary key,
  user_id    uuid references profiles(id) on delete cascade,
  evento     text not null,
  ref        text not null default '',
  telefone   text,
  texto      text,
  status     text not null default 'enviando' check (status in ('enviando', 'enviada', 'erro', 'sem_whatsapp')),
  erro       text,
  created_at timestamptz not null default now()
);
create unique index if not exists whatsapp_envios_unico on whatsapp_envios (user_id, evento, ref) where evento <> 'manual';
create index if not exists whatsapp_envios_data on whatsapp_envios (created_at desc);
alter table whatsapp_envios enable row level security;
drop policy if exists "envios de whatsapp: admin" on whatsapp_envios;
create policy "envios de whatsapp: admin" on whatsapp_envios for all to authenticated using (is_admin()) with check (is_admin());
grant select, insert, update on whatsapp_envios to authenticated;
grant usage on sequence whatsapp_envios_id_seq to authenticated;

-- Reserva o envio de um aviso automático para o próprio aluno (uma vez por evento/ref).
-- Devolve telefone, primeiro nome e o texto do modelo; ou nada, se não deve enviar.
create or replace function whatsapp_reservar(p_evento text, p_ref text default '')
returns table (envio_id bigint, telefone text, nome text, texto text)
language plpgsql security definer set search_path = public as $$
declare
  v_tel text; v_nome text; v_ok boolean; v_texto text; v_id bigint;
begin
  if auth.uid() is null or p_evento = 'manual' then return; end if;
  select p.whatsapp, split_part(coalesce(nullif(trim(p.nome), ''), p.apelido), ' ', 1), p.whatsapp_avisos and not coalesce(p.bloqueado, false)
    into v_tel, v_nome, v_ok from profiles p where p.id = auth.uid();
  if not coalesce(v_ok, false) or coalesce(v_tel, '') = '' then return; end if;
  select m.texto into v_texto from whatsapp_modelos m where m.evento = p_evento and m.ativo;
  if v_texto is null then return; end if;
  insert into whatsapp_envios (user_id, evento, ref, telefone)
  values (auth.uid(), p_evento, coalesce(p_ref, ''), v_tel)
  on conflict do nothing
  returning id into v_id;
  if v_id is null then return; end if;
  return query select v_id, v_tel, v_nome, v_texto;
end $$;
revoke all on function whatsapp_reservar(text, text) from public, anon;
grant execute on function whatsapp_reservar(text, text) to authenticated;

-- Grava o resultado do envio reservado acima (só do próprio aluno, só uma vez).
create or replace function whatsapp_resultado(p_id bigint, p_status text, p_texto text, p_erro text default null)
returns void language sql security definer set search_path = public as $$
  update whatsapp_envios set status = p_status, texto = left(p_texto, 4000), erro = left(p_erro, 500)
  where id = p_id and user_id = auth.uid() and status = 'enviando'
    and p_status in ('enviada', 'erro', 'sem_whatsapp');
$$;
revoke all on function whatsapp_resultado(bigint, text, text, text) from public, anon;
grant execute on function whatsapp_resultado(bigint, text, text, text) to authenticated;

notify pgrst, 'reload schema';
select 'whatsapp pronto' as status;
