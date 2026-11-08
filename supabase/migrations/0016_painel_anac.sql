-- Cabin Crew · 0016 · Painel "Simulado ANAC" no admin
--   • acesso aos Simulados ANAC por aluno (ou liberado para todos)
--   • bloquear aluno e excluir aluno da plataforma
--   • estatísticas: alunos ativos, médias, 10 melhores, matérias e questões que mais erram
-- Pode rodar mais de uma vez.

-- ---------- Bloqueio de aluno ----------
alter table profiles add column if not exists bloqueado boolean not null default false;
alter table profiles add column if not exists bloqueado_em timestamptz;
-- (sem "grant update" nessa coluna: só muda pela função de administrador abaixo)

create or replace function esta_bloqueado(p_user uuid default auth.uid()) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select bloqueado from profiles where id = p_user), false);
$$;

-- ---------- Quem pode fazer os Simulados ANAC ----------
create table if not exists acessos_anac (
  user_id      uuid primary key references profiles(id) on delete cascade,
  liberado_em  timestamptz not null default now(),
  liberado_por uuid references profiles(id) on delete set null
);
alter table acessos_anac enable row level security;
drop policy if exists "ve o proprio" on acessos_anac;
create policy "ve o proprio" on acessos_anac for select using (user_id = auth.uid() or is_admin());
drop policy if exists "admin gerencia" on acessos_anac;
create policy "admin gerencia" on acessos_anac for all using (is_admin()) with check (is_admin());
grant select, insert, delete on acessos_anac to authenticated;

insert into configuracoes (chave, valor) values ('anac_para_todos', 'false') on conflict (chave) do nothing;

create or replace function anac_liberado(p_user uuid default auth.uid()) returns boolean
language sql stable security definer set search_path = public as $$
  select p_user is not null and (
    exists (select 1 from profiles where id = p_user and is_admin)
    or (
      not esta_bloqueado(p_user)
      and (
        coalesce((select valor = 'true'::jsonb from configuracoes where chave = 'anac_para_todos'), false)
        or exists (select 1 from acessos_anac where user_id = p_user)
      )
    )
  );
$$;

-- O simulado só começa se: a aula está publicada, o aluno não está bloqueado
-- e, nos simulados da ANAC, o aluno tem acesso.
create or replace function simulado_liberado(p_simulado smallint) returns boolean
language sql stable security definer set search_path = public as $$
  select is_admin() or (
    not esta_bloqueado()
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

-- ---------- Funções do administrador ----------
create or replace function _exige_admin() returns void
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Somente administradores'; end if;
end;
$$;

-- Números gerais, 10 melhores, desempenho por matéria e questões que mais erram
create or replace function admin_anac_painel() returns jsonb
language plpgsql stable security definer set search_path = public, auth as $$
declare r jsonb;
begin
  perform _exige_admin();
  with sims as (select id, nota_minima from simulados where origem like 'cc-anac%'),
  t as (
    select t.*, s.nota_minima from tentativas t join sims s on s.id = t.simulado_id
    where t.finalizada_em is not null
  ),
  resp as (  -- cada questão respondida nas tentativas finalizadas
    select t.user_id, q.id as questao_id, coalesce(q.categoria, 'Sem matéria') as materia,
           (upper(t.respostas ->> qid::text) = q.correta) as certa
    from t, unnest(t.questoes) qid join questoes q on q.id = qid
  )
  select jsonb_build_object(
    'com_acesso', (select count(*) from acessos_anac a join profiles p on p.id = a.user_id where not p.bloqueado),
    'para_todos', coalesce((select valor = 'true'::jsonb from configuracoes where chave = 'anac_para_todos'), false),
    'fizeram',    (select count(distinct user_id) from t),
    'ativos_7d',  (select count(distinct user_id) from tentativas where simulado_id in (select id from sims) and iniciada_em > now() - interval '7 days'),
    'em_andamento', (select count(*) from tentativas where simulado_id in (select id from sims) and finalizada_em is null and (prazo is null or prazo > now())),
    'tentativas', (select count(*) from t),
    'media',      (select round(avg(nota)) from t),
    'aprovacao',  (select round(100.0 * count(*) filter (where nota >= nota_minima) / nullif(count(*), 0)) from t),
    'top10', coalesce((
      select jsonb_agg(x order by x.media desc, x.tentativas desc) from (
        select t.user_id as id, coalesce(p.nome, p.apelido) as nome, u.email,
               count(*) as tentativas, round(avg(t.nota)) as media, max(t.nota) as melhor, max(t.finalizada_em) as ultima
        from t join profiles p on p.id = t.user_id left join auth.users u on u.id = t.user_id
        where not p.is_admin
        group by t.user_id, p.nome, p.apelido, u.email
        order by round(avg(t.nota)) desc, count(*) desc
        limit 10
      ) x), '[]'::jsonb),
    'materias', coalesce((
      select jsonb_agg(x order by x.pct desc) from (
        select materia, count(*) as respondidas, count(*) filter (where certa) as acertos,
               round(100.0 * count(*) filter (where certa) / count(*)) as pct
        from resp group by materia
      ) x), '[]'::jsonb),
    'dificeis', coalesce((
      select jsonb_agg(x order by x.pct, x.respondidas desc) from (
        select r.questao_id as id, q.enunciado, r.materia, count(*) as respondidas,
               round(100.0 * count(*) filter (where r.certa) / count(*)) as pct
        from resp r join questoes q on q.id = r.questao_id
        group by r.questao_id, q.enunciado, r.materia
        having count(*) >= 3
        order by round(100.0 * count(*) filter (where r.certa) / count(*)), count(*) desc
        limit 10
      ) x), '[]'::jsonb)
  ) into r;
  return r;
end;
$$;

-- Lista de alunos: com acesso, bloqueados, os que fizeram simulados, ou busca por nome/e-mail/WhatsApp
create or replace function admin_anac_alunos(p_filtro text default 'acesso', p_busca text default '')
returns table (
  id uuid, nome text, email text, whatsapp text, escola text, is_admin boolean,
  tem_acesso boolean, bloqueado boolean, tentativas bigint, media numeric, ultima timestamptz, cadastro timestamptz
)
language plpgsql stable security definer set search_path = public, auth as $$
declare b text := '%' || lower(trim(coalesce(p_busca, ''))) || '%';
begin
  perform _exige_admin();
  return query
  with st as (
    select t.user_id, count(*) as n, round(avg(t.nota)) as m, max(t.iniciada_em) as u
    from tentativas t join simulados s on s.id = t.simulado_id
    where s.origem like 'cc-anac%' and t.finalizada_em is not null
    group by t.user_id
  )
  select p.id, coalesce(p.nome, p.apelido), u.email::text, p.whatsapp, p.escola, p.is_admin,
         (a.user_id is not null), p.bloqueado, coalesce(st.n, 0), st.m, st.u, p.created_at
  from profiles p
  left join auth.users u on u.id = p.id
  left join acessos_anac a on a.user_id = p.id
  left join st on st.user_id = p.id
  where
    case p_filtro
      when 'acesso'     then a.user_id is not null
      when 'bloqueados' then p.bloqueado
      when 'fizeram'    then st.user_id is not null
      else true
    end
    and (coalesce(trim(p_busca), '') = '' or lower(coalesce(p.nome, '') || ' ' || coalesce(p.apelido, '') || ' ' || coalesce(u.email, '') || ' ' || coalesce(p.whatsapp, '')) like b)
  order by st.u desc nulls last, p.created_at desc
  limit 300;
end;
$$;

create or replace function admin_liberar_anac(p_user uuid, p_liberar boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform _exige_admin();
  if p_liberar then
    insert into acessos_anac (user_id, liberado_por) values (p_user, auth.uid()) on conflict (user_id) do nothing;
  else
    delete from acessos_anac where user_id = p_user;
  end if;
end;
$$;

create or replace function admin_bloquear_usuario(p_user uuid, p_bloquear boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform _exige_admin();
  if p_user = auth.uid() then raise exception 'Você não pode bloquear a própria conta'; end if;
  if exists (select 1 from profiles where id = p_user and is_admin) then raise exception 'Tire a permissão de administrador antes de bloquear'; end if;
  update profiles set bloqueado = p_bloquear, bloqueado_em = case when p_bloquear then now() end where id = p_user;
  -- encerra simulados em andamento de quem foi bloqueado
  if p_bloquear then
    update tentativas set prazo = now() where user_id = p_user and finalizada_em is null;
  end if;
end;
$$;

-- Exclui a conta de vez (login, perfil, progresso e tentativas). Não dá para desfazer.
create or replace function admin_excluir_usuario(p_user uuid) returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  perform _exige_admin();
  if p_user = auth.uid() then raise exception 'Você não pode excluir a própria conta'; end if;
  if exists (select 1 from profiles where id = p_user and is_admin) then raise exception 'Tire a permissão de administrador antes de excluir'; end if;
  delete from auth.users where id = p_user;   -- o perfil e os dados ligados a ele saem junto (on delete cascade)
  delete from profiles where id = p_user;     -- garantia, caso o perfil não esteja ligado em cascata
end;
$$;

revoke all on function esta_bloqueado(uuid), anac_liberado(uuid), _exige_admin(), admin_anac_painel(),
  admin_anac_alunos(text, text), admin_liberar_anac(uuid, boolean), admin_bloquear_usuario(uuid, boolean),
  admin_excluir_usuario(uuid) from public, anon;
grant execute on function esta_bloqueado(uuid), anac_liberado(uuid), admin_anac_painel(),
  admin_anac_alunos(text, text), admin_liberar_anac(uuid, boolean), admin_bloquear_usuario(uuid, boolean),
  admin_excluir_usuario(uuid) to authenticated;
grant execute on function _exige_admin() to authenticated;

notify pgrst, 'reload schema';

select 'Painel ANAC pronto' as status,
       (select count(*) from acessos_anac) as alunos_com_acesso,
       (select valor from configuracoes where chave = 'anac_para_todos') as liberado_para_todos;
