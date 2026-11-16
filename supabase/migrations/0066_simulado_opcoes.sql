-- Cabin Crew · 0066 · Opções ao iniciar o simulado: Gabarito imediato e Próxima questão automática
--   • com gabarito imediato, o aluno vê na hora se acertou e a alternativa correta (e não pode trocar a resposta depois)
--   • próxima questão automática só muda a tela; fica guardada para manter a escolha se ele recarregar a página
-- Rode depois do 0065. Pode rodar mais de uma vez.

alter table tentativas add column if not exists gabarito_imediato boolean not null default false;
alter table tentativas add column if not exists auto_proxima boolean not null default false;

-- O aluno escolhe as opções logo depois de iniciar (antes de responder a primeira questão)
create or replace function definir_opcoes_tentativa(p_tentativa uuid, p_gabarito boolean, p_auto boolean) returns boolean
language plpgsql security definer set search_path = public as $$
declare v_ok int;
begin
  update tentativas set gabarito_imediato = coalesce(p_gabarito, false), auto_proxima = coalesce(p_auto, false)
   where id = p_tentativa and user_id = auth.uid() and finalizada_em is null and respostas = '{}'::jsonb;
  get diagnostics v_ok = row_count;
  return v_ok = 1;
end $$;
revoke all on function definir_opcoes_tentativa(uuid, boolean, boolean) from public, anon;
grant execute on function definir_opcoes_tentativa(uuid, boolean, boolean) to authenticated;

-- Com gabarito imediato (como no treino) a resposta não pode ser trocada depois de ver a correção
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
     and not ((modo = 'treino' or gabarito_imediato) and respostas ? p_questao::text);
  get diagnostics v_ok = row_count;
  return v_ok = 1;
end;
$$;

-- Correção na hora: no treino ou com gabarito imediato, e só depois de responder
create or replace function conferir_questao(p_tentativa uuid, p_questao uuid)
returns table (correta text, explicacao text)
language sql stable security definer set search_path = public as $$
  select q.correta, q.explicacao
  from tentativas t join questoes q on q.id = p_questao
  where t.id = p_tentativa and t.user_id = auth.uid() and (t.modo = 'treino' or t.gabarito_imediato)
    and p_questao = any(t.questoes) and t.respostas ? p_questao::text;
$$;
revoke all on function conferir_questao(uuid, uuid) from public, anon;
grant execute on function conferir_questao(uuid, uuid) to authenticated;

notify pgrst, 'reload schema';
select 'opções do simulado prontas' as status;
