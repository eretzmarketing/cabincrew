-- Cabin Crew · 0050 · Autenticação pública de certificados
--   • carga horária e descrição do curso no modelo do certificado
--   • a verificação pública mostra também a foto do aluno
-- Pode rodar mais de uma vez.

alter table certificado_modelos add column if not exists carga_horaria text;
alter table certificado_modelos add column if not exists descricao text;

drop function if exists certificado_publico(text);
create or replace function certificado_publico(p_codigo text)
returns table (codigo text, curso text, nome text, concluido_em timestamptz, nota numeric, emitido_em timestamptz, revogado boolean,
               user_id uuid, avatar_em timestamptz, carga_horaria text, descricao text)
language sql stable security definer set search_path = public as $$
  select c.codigo, c.curso, c.nome, c.concluido_em, c.nota, c.emitido_em, c.revogado,
         c.user_id, p.avatar_em, m.carga_horaria, m.descricao
  from certificados c
  left join profiles p on p.id = c.user_id
  left join certificado_modelos m on m.curso = c.curso
  where c.codigo = upper(trim(p_codigo));
$$;
revoke all on function certificado_publico(text) from public;
grant execute on function certificado_publico(text) to anon, authenticated;

notify pgrst, 'reload schema';
select 'autenticação de certificados pronta' as status;
