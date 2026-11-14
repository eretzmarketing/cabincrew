-- Cabin Crew · 0061 · Feedback da IA no vídeo de apresentação
--   • o aluno pode enviar a gravação para análise (OpenAI): transcrição + avaliação com nota e dicas
--   • o vídeo é analisado e descartado na hora; aqui fica só o resultado (nota, feedback e transcrição)
-- Rode depois do 0060. Pode rodar mais de uma vez.

alter table video_treinos add column if not exists nota_ia smallint check (nota_ia between 0 and 100);
alter table video_treinos add column if not exists ia jsonb;
alter table video_treinos add column if not exists transcricao text;

-- Grava a análise (só o servidor do site, com a chave): o aluno não consegue inventar a nota da IA
create or replace function video_ia_registrar(p_chave text, p_user uuid, p_duracao integer, p_meta integer, p_nota integer, p_ia jsonb, p_transcricao text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  perform _confere_chave(p_chave);
  insert into video_treinos (user_id, duracao_seg, meta_seg, checklist, nota, nota_ia, ia, transcricao)
  values (p_user, greatest(1, least(600, p_duracao)), case when p_meta in (60, 90, 120) then p_meta else 90 end, '[]'::jsonb,
          greatest(0, least(100, p_nota)), greatest(0, least(100, p_nota)), p_ia, left(p_transcricao, 8000))
  returning id into v_id;
  return v_id;
end $$;
revoke all on function video_ia_registrar(text, uuid, integer, integer, integer, jsonb, text) from public;
grant execute on function video_ia_registrar(text, uuid, integer, integer, integer, jsonb, text) to anon, authenticated;

-- Quantas análises o aluno já fez hoje (limite diário, para controlar o custo)
create or replace function video_ia_hoje(p_chave text, p_user uuid) returns integer
language plpgsql stable security definer set search_path = public as $$
begin
  perform _confere_chave(p_chave);
  return (select count(*) from video_treinos where user_id = p_user and nota_ia is not null
           and created_at >= date_trunc('day', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo');
end $$;
revoke all on function video_ia_hoje(text, uuid) from public;
grant execute on function video_ia_hoje(text, uuid) to anon, authenticated;

notify pgrst, 'reload schema';
select 'feedback da IA pronto' as status;
