-- Cabin Crew · 0078 · Notificações do aluno + resposta das questões reportadas por WhatsApp/SMS
--   • notificacoes: o "sininho" do aluno (Minha conta › Notificações)
--   • novo aviso automático "Questão reportada respondida" (editável em Configurações › WhatsApp e SMS)
-- Pode rodar mais de uma vez.

create table if not exists notificacoes (
  id         bigserial primary key,
  user_id    uuid not null references profiles(id) on delete cascade,
  tipo       text not null default 'aviso',
  titulo     text not null check (char_length(titulo) <= 200),
  texto      text check (char_length(texto) <= 3000),
  link       text check (char_length(link) <= 300),
  lida_em    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notificacoes_user on notificacoes (user_id, created_at desc);
create index if not exists notificacoes_nao_lidas on notificacoes (user_id) where lida_em is null;
alter table notificacoes enable row level security;

drop policy if exists "notificacoes: a propria" on notificacoes;
create policy "notificacoes: a propria" on notificacoes for select to authenticated using (user_id = auth.uid() or is_admin());
drop policy if exists "notificacoes: admin cria" on notificacoes;
create policy "notificacoes: admin cria" on notificacoes for insert to authenticated with check (is_admin());
drop policy if exists "notificacoes: admin apaga" on notificacoes;
create policy "notificacoes: admin apaga" on notificacoes for delete to authenticated using (is_admin());
grant select, insert, delete on notificacoes to authenticated;
grant usage, select on sequence notificacoes_id_seq to authenticated;

-- O aluno marca as próprias notificações como lidas (todas ou uma).
create or replace function marcar_notificacoes_lidas(p_id bigint default null) returns void
language sql security definer set search_path = public as $$
  update notificacoes set lida_em = now()
   where user_id = auth.uid() and lida_em is null and (p_id is null or id = p_id);
$$;
revoke all on function marcar_notificacoes_lidas(bigint) from public, anon;
grant execute on function marcar_notificacoes_lidas(bigint) to authenticated;

-- Aviso automático para a resposta de questão reportada
insert into whatsapp_modelos (evento, titulo, quando, texto, ativo, canal, texto_sms)
values (
  'reporte_respondido', 'Questão reportada respondida',
  'Quando a equipe responde uma questão que o aluno reportou com erro (Simulados ANAC › Questões reportadas).',
  E'🛠️ {nome}, verificamos a questão que você reportou!\n\n{situacao}\n{resposta}\nObrigada por ajudar a deixar os simulados ainda melhores. Veja nas suas notificações:\n👉 {link}/conta/notificacoes',
  true, 'whatsapp',
  'Cabin Crew: {nome}, respondemos a questao que voce reportou. Veja em {link}/conta/notificacoes'
)
on conflict (evento) do nothing;

notify pgrst, 'reload schema';
