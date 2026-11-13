-- Cabin Crew · 0043 · Adicionar aluno ao Head Hunter pelo admin (cortesia ou pagamento por fora do site)
-- Se a pessoa ainda não tem conta, o acesso fica reservado pelo e-mail e é liberado
-- automaticamente quando ela se cadastrar com esse e-mail. Pode rodar mais de uma vez.

create table if not exists acessos_pendentes (
  email      text primary key check (email = lower(email)),
  produto    text not null default 'head-hunter' references produtos(slug),
  compra_id  bigint references compras(id),
  motivo     text,
  nome       text,
  whatsapp   text,
  criado_por uuid,
  criado_em  timestamptz not null default now()
);
alter table acessos_pendentes enable row level security;
drop policy if exists "acessos pendentes: admin" on acessos_pendentes;
create policy "acessos pendentes: admin" on acessos_pendentes for all to authenticated using (is_admin()) with check (is_admin());
grant select, insert, update, delete on acessos_pendentes to authenticated;

-- Chamado quando o aluno entra no Head Hunter: se havia acesso reservado para o e-mail dele, libera.
create or replace function hh_resgatar_acesso() returns boolean
language plpgsql security definer set search_path = public, auth as $$
declare v_email text; r acessos_pendentes;
begin
  select lower(u.email) into v_email from auth.users u where u.id = auth.uid();
  if v_email is null then return false; end if;
  select * into r from acessos_pendentes where email = v_email;
  if not found then return false; end if;
  insert into acessos (user_id, produto, status, compra_id, motivo)
  values (auth.uid(), r.produto, 'ativo', r.compra_id, r.motivo)
  on conflict (user_id, produto) do update
    set status = 'ativo', compra_id = coalesce(excluded.compra_id, acessos.compra_id), liberado_em = now(),
        encerrado_em = null, concluido_em = null, expira_em = null, motivo = excluded.motivo;
  -- a compra feita antes do cadastro passa a apontar para a conta
  update compras set user_id = auth.uid() where id = r.compra_id and user_id is null;
  delete from acessos_pendentes where email = v_email;
  return true;
end $$;
revoke all on function hh_resgatar_acesso() from public, anon;
grant execute on function hh_resgatar_acesso() to authenticated;

insert into whatsapp_modelos (evento, titulo, quando, texto) values
  ('acesso_liberado', 'Acesso liberado pelo admin', 'Quando você adiciona um aluno ao Head Hunter pelo painel (cortesia, Pix direto, curso presencial).',
   E'✈️ {nome}, seu acesso ao Head Hunter está liberado!\n\n👨‍✈️ {passo}\n👉 {endereco}\n\nNo Head Hunter você monta a sua jornada até a aprovação: aulas, simulados, dinâmicas, entrevista e Inglês a bordo.\n\n📲 Salve este número na sua agenda para receber todos os avisos da Cabin Crew.')
on conflict (evento) do nothing;

notify pgrst, 'reload schema';
select 'adicionar aluno pronto' as status;
