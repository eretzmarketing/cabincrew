-- Cabin Crew · 0053 · Áudio narrado das aulas de texto do Head Hunter
-- O gerador de áudio (rodado no servidor) lê o texto das aulas com a "chave do site", sem precisar de login.
-- Pode rodar mais de uma vez.

create or replace function aulas_para_audio(p_chave text, p_modulo integer default null)
returns table (id uuid, modulo integer, modulo_titulo text, ordem integer, titulo text, conteudo text)
language plpgsql stable security definer set search_path = public as $$
begin
  perform _confere_chave(p_chave);
  return query
    select a.id, m.ordem::integer, m.titulo, a.ordem::integer, a.titulo, a.conteudo
      from aulas a join modulos m on m.id = a.modulo_id
     where a.publicado and a.tipo = 'texto' and coalesce(a.conteudo, '') <> ''
       and (p_modulo is null or m.ordem = p_modulo)
     order by m.ordem, a.ordem;
end $$;
revoke all on function aulas_para_audio(text, integer) from public;
grant execute on function aulas_para_audio(text, integer) to anon, authenticated;

notify pgrst, 'reload schema';
select 'áudio das aulas pronto' as status;
