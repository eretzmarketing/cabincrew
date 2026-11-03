-- =====================================================================
-- Cabin Crew — cadastro com nome, WhatsApp e escola (sem confirmação por e-mail)
-- Rode no SQL Editor do Supabase DEPOIS do 0001_forum.sql.
-- =====================================================================

alter table profiles
  add column if not exists nome     text,
  add column if not exists whatsapp text,
  add column if not exists escola   text;

alter table profiles drop constraint if exists profiles_nome_tamanho;
alter table profiles add constraint profiles_nome_tamanho check (nome is null or char_length(nome) between 2 and 80);
alter table profiles drop constraint if exists profiles_whatsapp_formato;
alter table profiles add constraint profiles_whatsapp_formato check (whatsapp is null or whatsapp ~ '^\+55[0-9]{10,11}$');
alter table profiles drop constraint if exists profiles_escola_tamanho;
alter table profiles add constraint profiles_escola_tamanho check (escola is null or char_length(escola) between 2 and 120);

-- O perfil nasce com os dados enviados no cadastro
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_nome text := nullif(left(btrim(m->>'nome'), 80), '');
  v_zap  text := nullif(m->>'whatsapp', '');
  v_esc  text := nullif(left(btrim(m->>'escola'), 120), '');
begin
  if v_zap is not null and v_zap !~ '^\+55[0-9]{10,11}$' then v_zap := null; end if;
  if v_nome is not null and char_length(v_nome) < 2 then v_nome := null; end if;
  if v_esc is not null and char_length(v_esc) < 2 then v_esc := null; end if;

  insert into profiles (id, apelido, nome, whatsapp, escola)
  values (
    new.id,
    coalesce(split_part(v_nome, ' ', 1), nullif(split_part(new.email, '@', 1), ''), 'tripulante'),
    v_nome, v_zap, v_esc
  );
  return new;
end;
$$;

-- O usuário pode editar os próprios dados (nunca is_admin nem pontos)
revoke update on profiles from authenticated;
grant update (apelido, nome, whatsapp, escola) on profiles to authenticated;
