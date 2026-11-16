-- Cabin Crew · 0068 · Simulado mais rápido com gabarito imediato
--   • grava a resposta e devolve a correção numa chamada só (antes eram duas, uma depois da outra)
-- Rode depois do 0066. Pode rodar mais de uma vez.

create or replace function responder_conferir(p_tentativa uuid, p_questao uuid, p_letra text)
returns table (ok boolean, correta text, explicacao text)
language plpgsql security definer set search_path = public as $$
declare v_ok boolean;
begin
  v_ok := responder_questao(p_tentativa, p_questao, p_letra);
  return query
    select v_ok, c.correta, c.explicacao from (select 1) x
    left join lateral (select * from conferir_questao(p_tentativa, p_questao)) c on true;
end $$;
revoke all on function responder_conferir(uuid, uuid, text) from public, anon;
grant execute on function responder_conferir(uuid, uuid, text) to authenticated;

notify pgrst, 'reload schema';
select 'resposta com correção numa chamada só' as status;
