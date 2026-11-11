-- Cabin Crew · 0025 · Jornada da seleção
-- 1) Companhia(s)-alvo e data da meta do aluno (check-in).
-- 2) Treino rápido: 10 questões por banco, priorizando as que o aluno nunca viu e as que errou,
--    com correção na hora (modo "treino").
-- 3) Prova real: conta quantas vezes o aluno saiu da aba durante um simulado cronometrado.
-- Pode rodar mais de uma vez.

alter table profiles add column if not exists alvo_companhias text[] not null default '{}';
alter table profiles add column if not exists data_meta date;

alter table tentativas add column if not exists modo text not null default 'prova';
alter table tentativas drop constraint if exists tentativas_modo_check;
alter table tentativas add constraint tentativas_modo_check check (modo in ('prova', 'treino'));
alter table tentativas add column if not exists saidas_aba smallint not null default 0;

-- O aluno grava o próprio check-in (só estas duas colunas, via função)
create or replace function salvar_checkin(p_companhias text[], p_data date) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'login necessário'; end if;
  update profiles
     set alvo_companhias = (select coalesce(array_agg(c order by o), '{}') from unnest(p_companhias) with ordinality u(c, o)
                             where c in ('latam', 'gol', 'azul')),
         data_meta = case when p_data between current_date and current_date + 730 then p_data else null end
   where id = auth.uid();
end;
$$;
revoke all on function salvar_checkin(text[], date) from public, anon;
grant execute on function salvar_checkin(text[], date) to authenticated;

-- Um simulado "de treino" por banco (10 questões, sem tempo, com gabarito)
insert into simulados (titulo, descricao, bancos, categorias, qtd_questoes, tempo_min, nota_minima, mostrar_gabarito, origem)
select v.titulo, 'Treino rápido com correção na hora.', array[v.banco], null, 10, null, 80, true, 'cc-treino-' || v.banco
from (values
  ('portugues', 'Treino rápido · Português'),
  ('ingles', 'Treino rápido · Inglês'),
  ('logico', 'Treino rápido · Raciocínio lógico'),
  ('numerico', 'Treino rápido · Raciocínio numérico'),
  ('verbal', 'Treino rápido · Raciocínio verbal'),
  ('sjt', 'Treino rápido · Julgamento situacional'),
  ('anac', 'Treino rápido · Banca ANAC'),
  ('tecnico', 'Treino rápido · Técnicas')
) v(banco, titulo)
where not exists (select 1 from simulados s where s.origem = 'cc-treino-' || v.banco);

-- Começa um treino rápido: primeiro questões nunca vistas, depois as que errou, depois o resto
create or replace function iniciar_treino(p_banco text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_sim smallint;
  v_id uuid;
  v_ids uuid[];
begin
  if v_user is null then raise exception 'Faça login para continuar'; end if;
  if esta_bloqueado() then raise exception 'Acesso bloqueado'; end if;
  if p_banco = 'anac' and not anac_liberado() then raise exception 'Simulados ANAC não liberados'; end if;
  select id into v_sim from simulados where origem = 'cc-treino-' || p_banco;
  if v_sim is null then raise exception 'Treino indisponível'; end if;

  -- treino aberto do mesmo banco: continua
  select id into v_id from tentativas
  where user_id = v_user and simulado_id = v_sim and finalizada_em is null
  order by iniciada_em desc limit 1;
  if v_id is not null then return v_id; end if;

  with vistas as (
    select qid, bool_or(upper(t.respostas ->> qid::text) is distinct from q.correta) as errou
    from tentativas t cross join lateral unnest(t.questoes) qid
    join questoes q on q.id = qid
    where t.user_id = v_user and t.finalizada_em is not null
    group by qid
  )
  select array_agg(id) into v_ids from (
    select q.id from questoes q left join vistas v on v.qid = q.id
    where q.ativo and q.banco = p_banco
    order by case when v.qid is null then 0 when v.errou then 1 else 2 end, random()
    limit 10
  ) x;
  if v_ids is null then raise exception 'Este banco ainda não tem questões'; end if;

  insert into tentativas (user_id, simulado_id, questoes, total, prazo, modo)
  values (v_user, v_sim, v_ids, array_length(v_ids, 1), null, 'treino')
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function iniciar_treino(text) from public, anon;
grant execute on function iniciar_treino(text) to authenticated;

-- No treino a resposta não pode ser trocada depois de ver a correção
create or replace function responder_questao(p_tentativa uuid, p_questao uuid, p_letra text) returns boolean
language plpgsql security definer set search_path = public as $$
declare v_ok int;
begin
  if upper(coalesce(p_letra, '')) not in ('A','B','C','D','E') then return false; end if;
  update tentativas
     set respostas = respostas || jsonb_build_object(p_questao::text, upper(p_letra))
   where id = p_tentativa and user_id = auth.uid() and finalizada_em is null
     and p_questao = any(questoes)
     and (prazo is null or prazo + interval '1 minute' > now())
     and not (modo = 'treino' and respostas ? p_questao::text);
  get diagnostics v_ok = row_count;
  return v_ok = 1;
end;
$$;

-- Correção na hora (só no treino e só depois de responder)
create or replace function conferir_questao(p_tentativa uuid, p_questao uuid)
returns table (correta text, explicacao text)
language sql stable security definer set search_path = public as $$
  select q.correta, q.explicacao
  from tentativas t join questoes q on q.id = p_questao
  where t.id = p_tentativa and t.user_id = auth.uid() and t.modo = 'treino'
    and p_questao = any(t.questoes) and t.respostas ? p_questao::text;
$$;
revoke all on function conferir_questao(uuid, uuid) from public, anon;
grant execute on function conferir_questao(uuid, uuid) to authenticated;

-- Prova real: registra que o aluno saiu da aba
create or replace function registrar_saida_aba(p_tentativa uuid) returns smallint
language sql volatile security definer set search_path = public as $$
  update tentativas set saidas_aba = least(saidas_aba + 1, 999)
  where id = p_tentativa and user_id = auth.uid() and finalizada_em is null and modo = 'prova'
  returning saidas_aba;
$$;
revoke all on function registrar_saida_aba(uuid) from public, anon;
grant execute on function registrar_saida_aba(uuid) to authenticated;

notify pgrst, 'reload schema';

select 'Jornada pronta' as status;
