-- Cabin Crew · 0048 · Gestão de alunos no admin
--   • resetar um módulo do aluno (Head Hunter ou Flight Attendant English)
--   • suspender / reativar o acesso a um curso (sem apagar nada)
--   • excluir conta pelo admin também guarda o registro em "Contas excluídas" (com quem excluiu)
-- Pode rodar mais de uma vez.

alter table contas_excluidas add column if not exists excluida_por text not null default 'aluno';
alter table contas_excluidas add column if not exists motivo text;
alter table acessos drop constraint if exists acessos_status_check;
alter table acessos add constraint acessos_status_check check (status in ('ativo', 'concluido', 'revogado', 'suspenso'));

-- Apaga o progresso de um módulo (aulas concluídas e simulados ligados às aulas do módulo)
create or replace function admin_resetar_modulo(p_user uuid, p_curso text, p_modulo integer)
returns integer language plpgsql security definer set search_path = public as $$
declare n integer := 0; m integer;
begin
  perform _exige_admin();
  if p_curso = 'english' then
    delete from ingles_progresso where user_id = p_user and split_part(aula, '.', 1) = p_modulo::text;
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

-- Exclusão pelo admin: guarda o mesmo registro legal da exclusão feita pelo aluno
drop function if exists admin_excluir_usuario(uuid);
create or replace function admin_excluir_usuario(p_user uuid, p_motivo text default null) returns void
language plpgsql security definer set search_path = public, auth as $$
declare
  v_tel text; v_completo text; v_escola text; v_cad timestamptz; v_email text;
  v_pri timestamptz; v_ult timestamptz; v_aulas int; v_treinos int; v_dias int;
begin
  perform _exige_admin();
  if p_user = auth.uid() then raise exception 'Você não pode excluir a própria conta'; end if;
  if exists (select 1 from profiles where id = p_user and is_admin) then raise exception 'Tire a permissão de administrador antes de excluir'; end if;
  select p.whatsapp, coalesce(nullif(trim(p.nome), ''), p.apelido), p.escola, p.created_at
    into v_tel, v_completo, v_escola, v_cad from profiles p where p.id = p_user;
  select u.email into v_email from auth.users u where u.id = p_user;
  with ev as (
    select pr.concluida_em as em from progresso pr where pr.user_id = p_user
    union all select coalesce(t.finalizada_em, t.iniciada_em) from tentativas t where t.user_id = p_user
    union all select ip.updated_at from ingles_progresso ip where ip.user_id = p_user
    union all select o.created_at from opq_tentativas o where o.user_id = p_user
    union all select v.created_at from video_treinos v where v.user_id = p_user
  )
  select min(em), max(em), count(distinct (em at time zone 'America/Sao_Paulo')::date) into v_pri, v_ult, v_dias from ev;
  select count(*) into v_aulas from progresso where user_id = p_user;
  select count(*) into v_treinos from tentativas where user_id = p_user and finalizada_em is not null;
  insert into contas_excluidas (user_id, nome, email, whatsapp, escola, cadastro_em, ciente_sem_reembolso,
                                primeira_atividade, ultima_atividade, aulas_concluidas, treinos_feitos, dias_de_estudo, compras,
                                excluida_por, motivo)
  values (p_user, v_completo, v_email, v_tel, v_escola, v_cad, false, v_pri, v_ult, v_aulas, v_treinos, v_dias,
          (select count(*) from compras c where c.user_id = p_user), 'admin', left(p_motivo, 500));
  delete from acessos_pendentes where email = lower(v_email);
  delete from auth.users where id = p_user;
  delete from profiles where id = p_user;
end $$;
revoke all on function admin_excluir_usuario(uuid, text) from public, anon;
grant execute on function admin_excluir_usuario(uuid, text) to authenticated;

notify pgrst, 'reload schema';
select 'gestão de alunos pronta' as status;
