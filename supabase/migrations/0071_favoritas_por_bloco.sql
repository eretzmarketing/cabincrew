-- Cabin Crew · 0071 · Simulado de favoritas no padrão da prova
--   • o aluno escolhe o bloco; o simulado sorteia 20 das favoritas daquele bloco, com 30 minutos
--   • libera quando o bloco tem pelo menos 20 favoritas (dá para favoritar quantas quiser)
-- Rode depois do 0070. Pode rodar mais de uma vez.

update simulados set qtd_questoes = 20, tempo_min = 30,
       descricao = 'Simulado exclusivo: 20 questões sorteadas das suas favoritas de um bloco, em 30 minutos.'
 where origem = 'cc-favoritas';

drop function if exists iniciar_favoritas(boolean, boolean);

create or replace function iniciar_favoritas(p_bloco text, p_gabarito boolean default false, p_auto boolean default false) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_sim smallint; v_tempo smallint; v_qtd smallint; v_id uuid; v_ids uuid[];
begin
  if v_user is null then raise exception 'Entre na sua conta para continuar.'; end if;
  if esta_bloqueado() then raise exception 'Conta bloqueada.'; end if;
  if not tem_plus() then raise exception 'plus'; end if;
  select id, tempo_min, qtd_questoes into v_sim, v_tempo, v_qtd from simulados where origem = 'cc-favoritas';
  if (select count(*) from questao_favoritas f join questoes q on q.id = f.questao_id
       where f.user_id = v_user and q.ativo and coalesce(nullif(q.categoria, ''), 'Outras questões') = p_bloco) < 20 then
    raise exception 'Favorite pelo menos 20 questões deste bloco para liberar o simulado.';
  end if;
  select array_agg(questao_id) into v_ids from (
    select f.questao_id from questao_favoritas f join questoes q on q.id = f.questao_id
     where f.user_id = v_user and q.ativo and coalesce(nullif(q.categoria, ''), 'Outras questões') = p_bloco
     order by random() limit coalesce(v_qtd, 20)
  ) x;
  -- simulado de favoritas que ficou aberto: descarta e começa um novo
  delete from tentativas where user_id = v_user and simulado_id = v_sim and finalizada_em is null;
  insert into tentativas (user_id, simulado_id, questoes, total, prazo, modo, gabarito_imediato, auto_proxima)
  values (v_user, v_sim, v_ids, array_length(v_ids, 1),
          case when v_tempo is null then null else now() + make_interval(mins => v_tempo) end,
          'prova', coalesce(p_gabarito, false), coalesce(p_auto, false))
  returning id into v_id;
  return v_id;
end $$;
revoke all on function iniciar_favoritas(text, boolean, boolean) from public, anon;
grant execute on function iniciar_favoritas(text, boolean, boolean) to authenticated;

notify pgrst, 'reload schema';
select 'simulado de favoritas por bloco pronto' as status;
