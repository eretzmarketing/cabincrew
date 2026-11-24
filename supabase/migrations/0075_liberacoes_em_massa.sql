-- Cabin Crew · 0075 · Liberação em massa e regras por escola
--   • admin_liberar_massa: libera um "pacote" (cursos, Questões Plus, análises da IA) para vários alunos de uma vez
--   • escola_regras: pacote liberado sozinho quando o aluno se cadastra informando aquela escola
--   • admin_aplicar_regra_escola: aplica a regra também a quem já está cadastrado na escola
-- Pode rodar mais de uma vez.

create table if not exists escola_regras (
  escola        text primary key,
  cursos        text[] not null default '{}',
  curso_dias    int,                        -- null = sem prazo
  plus          boolean not null default false,
  plus_dias     int,                        -- null = sem prazo
  ia_video      int not null default 0,
  ia_curriculo  int not null default 0,
  ativa         boolean not null default true,
  atualizado_em timestamptz not null default now()
);
alter table escola_regras enable row level security;
drop policy if exists "escola_regras: admin" on escola_regras;
create policy "escola_regras: admin" on escola_regras for all to authenticated using (is_admin()) with check (is_admin());
grant select, insert, update, delete on escola_regras to authenticated;

-- Libera um pacote para um aluno. Nunca diminui um acesso que ele já tem. Devolve true se mudou algo.
create or replace function _liberar_pacote(
  p_user uuid, p_cursos text[], p_curso_dias int, p_plus boolean, p_plus_dias int,
  p_ia_video int, p_ia_cv int, p_motivo text, p_por uuid
) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_c text; v_exp timestamptz; v_atual acessos; v_ate timestamptz; v_mudou boolean := false; v_plus plus_assinantes;
begin
  foreach v_c in array coalesce(p_cursos, '{}') loop
    continue when not exists (select 1 from produtos where slug = v_c);
    v_exp := case when p_curso_dias is null then null else now() + make_interval(days => p_curso_dias) end;
    select * into v_atual from acessos where user_id = p_user and produto = v_c;
    -- já tem acesso valendo e igual ou maior: não mexe
    continue when found and v_atual.status = 'ativo'
      and (v_atual.expira_em is null or (v_exp is not null and v_atual.expira_em >= v_exp));
    insert into acessos (user_id, produto, status, liberado_em, encerrado_em, concluido_em, expira_em, motivo)
    values (p_user, v_c, 'ativo', now(), null, null, v_exp, p_motivo)
    on conflict (user_id, produto) do update
      set status = 'ativo', liberado_em = now(), encerrado_em = null, concluido_em = null,
          expira_em = excluded.expira_em, motivo = excluded.motivo;
    v_mudou := true;
  end loop;

  if p_plus then
    select * into v_plus from plus_assinantes where user_id = p_user;
    if not (found and v_plus.ate is null) then          -- quem já tem "sem prazo" fica como está
      if p_plus_dias is null then v_ate := null;
      else v_ate := greatest(now(), coalesce(v_plus.ate, now())) + make_interval(days => p_plus_dias);  -- soma ao prazo atual
      end if;
      insert into plus_assinantes (user_id, ate, origem, observacao, liberado_por, updated_at)
      values (p_user, v_ate, 'manual', left(p_motivo, 200), p_por, now())
      on conflict (user_id) do update
        set ate = excluded.ate, observacao = excluded.observacao, liberado_por = excluded.liberado_por, updated_at = now();
      v_mudou := true;
    end if;
  end if;

  if coalesce(p_ia_video, 0) between 1 and 20 then
    insert into video_ia_liberacoes (user_id, qtd, liberado_por, recurso) values (p_user, p_ia_video, p_por, 'video');
    v_mudou := true;
  end if;
  if coalesce(p_ia_cv, 0) between 1 and 20 then
    insert into video_ia_liberacoes (user_id, qtd, liberado_por, recurso) values (p_user, p_ia_cv, p_por, 'curriculo');
    v_mudou := true;
  end if;
  return v_mudou;
end $$;
revoke all on function _liberar_pacote(uuid, text[], int, boolean, int, int, int, text, uuid) from public, anon, authenticated;

-- Admin: libera o pacote para uma lista de alunos. Devolve quantos receberam algo.
create or replace function admin_liberar_massa(
  p_ids uuid[], p_cursos text[], p_curso_dias int, p_plus boolean, p_plus_dias int,
  p_ia_video int default 0, p_ia_cv int default 0, p_motivo text default 'Liberação em massa'
) returns int
language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_n int := 0;
begin
  perform _exige_admin();
  if coalesce(array_length(p_ids, 1), 0) > 5000 then raise exception 'no máximo 5000 alunos por vez' using errcode = 'P0001'; end if;
  foreach v_id in array coalesce(p_ids, '{}') loop
    continue when not exists (select 1 from profiles where id = v_id);
    if _liberar_pacote(v_id, p_cursos, p_curso_dias, p_plus, p_plus_dias, p_ia_video, p_ia_cv,
                       coalesce(nullif(btrim(p_motivo), ''), 'Liberação em massa'), auth.uid()) then
      v_n := v_n + 1;
    end if;
  end loop;
  return v_n;
end $$;
revoke all on function admin_liberar_massa(uuid[], text[], int, boolean, int, int, int, text) from public, anon;
grant execute on function admin_liberar_massa(uuid[], text[], int, boolean, int, int, int, text) to authenticated;

-- Admin: aplica a regra da escola a quem já está cadastrado nela.
create or replace function admin_aplicar_regra_escola(p_escola text) returns int
language plpgsql security definer set search_path = public as $$
declare r escola_regras; v_id uuid; v_n int := 0;
begin
  perform _exige_admin();
  select * into r from escola_regras where escola = p_escola;
  if not found then raise exception 'regra não encontrada' using errcode = 'P0001'; end if;
  for v_id in select id from profiles where lower(btrim(escola)) = lower(btrim(p_escola)) and not coalesce(is_admin, false) loop
    if _liberar_pacote(v_id, r.cursos, r.curso_dias, r.plus, r.plus_dias, r.ia_video, r.ia_curriculo,
                       'Regra da escola: ' || r.escola, auth.uid()) then
      v_n := v_n + 1;
    end if;
  end loop;
  return v_n;
end $$;
revoke all on function admin_aplicar_regra_escola(text) from public, anon;
grant execute on function admin_aplicar_regra_escola(text) to authenticated;

-- No cadastro (ou quando a escola é preenchida pela primeira vez): aplica a regra da escola, se houver.
create or replace function _regra_escola_no_cadastro() returns trigger
language plpgsql security definer set search_path = public as $$
declare r escola_regras;
begin
  if coalesce(btrim(new.escola), '') = '' then return new; end if;
  if tg_op = 'UPDATE' and coalesce(btrim(old.escola), '') <> '' then return new; end if;  -- trocar de escola não libera nada
  select * into r from escola_regras where lower(btrim(escola)) = lower(btrim(new.escola)) and ativa;
  if found then
    begin
      perform _liberar_pacote(new.id, r.cursos, r.curso_dias, r.plus, r.plus_dias, r.ia_video, r.ia_curriculo,
                              'Regra da escola: ' || r.escola, null);
    exception when others then
      raise warning 'regra da escola não aplicada: %', sqlerrm;  -- nunca impede o cadastro
    end;
  end if;
  return new;
end $$;
drop trigger if exists profiles_regra_escola on profiles;
create trigger profiles_regra_escola after insert or update of escola on profiles
  for each row execute function _regra_escola_no_cadastro();

notify pgrst, 'reload schema';
