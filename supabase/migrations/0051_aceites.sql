-- Cabin Crew · 0051 · Registro de aceite dos Termos de Uso, Política de Privacidade e Política de Reembolso
-- Cada aceite guarda quem, quando, a versão do texto, onde (cadastro ou checkout), IP e navegador.
-- Os registros não podem ser alterados nem apagados pelo site (prova em caso de disputa).
-- Pode rodar mais de uma vez.

create table if not exists aceites (
  id         bigserial primary key,
  user_id    uuid,                                  -- sem vínculo rígido: o registro fica mesmo se a conta for excluída
  email      text,
  documentos text[] not null,                       -- termos, privacidade, reembolso
  versao     text not null,                         -- data da versão dos textos (ex.: 2026-11-13)
  contexto   text not null check (contexto in ('cadastro', 'checkout')),
  produto    text,
  ref        text,                                  -- no checkout: ID do pagamento no Mercado Pago
  ip         text,
  navegador  text,
  aceito_em  timestamptz not null default now()
);
create index if not exists aceites_user on aceites (user_id, aceito_em desc);
create index if not exists aceites_ref on aceites (ref) where ref is not null;

alter table aceites enable row level security;
drop policy if exists "aceites: registra o proprio" on aceites;
create policy "aceites: registra o proprio" on aceites for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "aceites: ve o proprio ou admin" on aceites;
create policy "aceites: ve o proprio ou admin" on aceites for select to authenticated using (user_id = auth.uid() or is_admin());
grant select, insert on aceites to authenticated;
grant usage on sequence aceites_id_seq to authenticated;

-- Reembolso ou contestação: o certificado do curso é revogado junto com o acesso
create or replace function acessos_revoga_certificado() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'revogado' and old.status is distinct from 'revogado' and coalesce(new.motivo, '') like 'compra %' then
    update certificados set revogado = true where user_id = new.user_id and curso = new.produto and not revogado;
  end if;
  return new;
end $$;
drop trigger if exists acessos_revoga_certificado_trg on acessos;
create trigger acessos_revoga_certificado_trg after update on acessos for each row execute function acessos_revoga_certificado();

notify pgrst, 'reload schema';
select 'registro de aceites pronto' as status;
