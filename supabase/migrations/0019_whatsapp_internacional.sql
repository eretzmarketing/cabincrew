-- Cabin Crew · 0019 · WhatsApp internacional (qualquer país) e exportação completa de usuários
-- Rode depois do 0018. Pode rodar mais de uma vez.

-- ---------- WhatsApp de qualquer país: +<DDI><número>, de 8 a 15 dígitos ----------
alter table profiles drop constraint if exists profiles_whatsapp_formato;
alter table profiles add constraint profiles_whatsapp_formato check (whatsapp is null or whatsapp ~ '^\+[1-9][0-9]{7,14}$');

-- O perfil nasce com os dados enviados no cadastro (agora aceitando outros países)
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_nome text := nullif(left(btrim(m->>'nome'), 80), '');
  v_zap  text := nullif(m->>'whatsapp', '');
  v_esc  text := nullif(left(btrim(m->>'escola'), 120), '');
begin
  if v_zap is not null and v_zap !~ '^\+[1-9][0-9]{7,14}$' then v_zap := null; end if;
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

-- ---------- Exportar todos os usuários (CSV no painel) ----------
create or replace function admin_exportar_usuarios()
returns table (
  nome text, email text, whatsapp text, escola text, cadastro timestamptz, ultimo_acesso timestamptz,
  administrador boolean, bloqueado boolean, tem_foto boolean, acesso_anac boolean,
  aulas_concluidas bigint, simulados_entregues bigint, media_simulados numeric, simulados_anac bigint, media_anac numeric, melhor_anac smallint
)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  perform _exige_admin();
  return query
  with st as (
    select t.user_id,
           count(*) as n, round(avg(t.nota)) as m,
           count(*) filter (where s.origem like 'cc-anac%') as na,
           round(avg(t.nota) filter (where s.origem like 'cc-anac%')) as ma,
           max(t.nota) filter (where s.origem like 'cc-anac%') as best
    from tentativas t join simulados s on s.id = t.simulado_id
    where t.finalizada_em is not null
    group by t.user_id
  ),
  au as (select user_id, count(*) as n from progresso group by user_id)
  select p.nome, u.email::text, p.whatsapp, p.escola, p.created_at, u.last_sign_in_at,
         p.is_admin, p.bloqueado, (p.avatar_em is not null),
         (p.is_admin or exists (select 1 from acessos_anac a where a.user_id = p.id)
           or coalesce((select valor = 'true'::jsonb from configuracoes where chave = 'anac_para_todos'), false)),
         coalesce(au.n, 0), coalesce(st.n, 0), st.m, coalesce(st.na, 0), st.ma, st.best
  from profiles p
  left join auth.users u on u.id = p.id
  left join st on st.user_id = p.id
  left join au on au.user_id = p.id
  order by p.created_at;
end;
$$;
revoke all on function admin_exportar_usuarios() from public, anon;
grant execute on function admin_exportar_usuarios() to authenticated;

notify pgrst, 'reload schema';

select 'WhatsApp internacional e exportação prontos' as status, count(*) as usuarios from profiles;
