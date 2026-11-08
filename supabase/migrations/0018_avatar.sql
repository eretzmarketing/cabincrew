-- Cabin Crew · 0018 · foto de perfil (avatar) obrigatória para usar o Crew Select
-- Rode depois do 0016. Pode rodar mais de uma vez.

alter table profiles add column if not exists avatar_em timestamptz;   -- quando a foto foi enviada (nulo = sem foto)

-- Pasta pública de fotos: cada aluno só mexe na própria pasta (avatares/<id do aluno>/avatar.webp)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatares', 'avatares', true, 2097152, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update set public = true, file_size_limit = 2097152, allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png'];

drop policy if exists "avatar: ver a propria" on storage.objects;
create policy "avatar: ver a propria" on storage.objects for select to authenticated
  using (bucket_id = 'avatares' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "avatar: enviar a propria" on storage.objects;
create policy "avatar: enviar a propria" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatares' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "avatar: trocar a propria" on storage.objects;
create policy "avatar: trocar a propria" on storage.objects for update to authenticated
  using (bucket_id = 'avatares' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "avatar: apagar a propria" on storage.objects;
create policy "avatar: apagar a propria" on storage.objects for delete to authenticated
  using (bucket_id = 'avatares' and (storage.foldername(name))[1] = auth.uid()::text);

-- Marca o perfil como "com foto" só se o arquivo existe de verdade
create or replace function confirmar_avatar() returns timestamptz
language plpgsql security definer set search_path = public, storage as $$
declare v timestamptz;
begin
  if auth.uid() is null then raise exception 'Entre na sua conta'; end if;
  if not exists (select 1 from storage.objects where bucket_id = 'avatares' and name = auth.uid()::text || '/avatar.webp') then
    raise exception 'Foto não encontrada';
  end if;
  update profiles set avatar_em = now() where id = auth.uid() returning avatar_em into v;
  return v;
end;
$$;
revoke all on function confirmar_avatar() from public, anon;
grant execute on function confirmar_avatar() to authenticated;

-- Sem foto também não começa simulado (mesmo chamando direto a API)
create or replace function simulado_liberado(p_simulado smallint) returns boolean
language sql stable security definer set search_path = public as $$
  select is_admin() or (
    not esta_bloqueado()
    and exists (select 1 from profiles where id = auth.uid() and avatar_em is not null)
    and exists (
      select 1 from aulas a join modulos m on m.id = a.modulo_id
      where a.simulado_id = p_simulado and a.publicado and m.publicado
    )
    and (
      coalesce((select origem from simulados where id = p_simulado), '') not like 'cc-anac%'
      or anac_liberado()
    )
  );
$$;

notify pgrst, 'reload schema';

select 'Avatar pronto' as status,
       (select count(*) from profiles where avatar_em is not null) as com_foto,
       (select count(*) from profiles where avatar_em is null and not is_admin) as alunos_sem_foto;
