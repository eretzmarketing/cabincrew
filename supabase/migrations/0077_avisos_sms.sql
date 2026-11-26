-- Cabin Crew · 0077 · Avisos automáticos por WhatsApp, SMS ou os dois
--   • cada aviso (whatsapp_modelos) ganha o canal e um texto próprio para SMS
--   • sms_envios: histórico dos SMS enviados
-- Pode rodar mais de uma vez.

alter table whatsapp_modelos add column if not exists canal text not null default 'whatsapp';
alter table whatsapp_modelos add column if not exists texto_sms text;
alter table whatsapp_modelos drop constraint if exists whatsapp_modelos_canal_check;
alter table whatsapp_modelos add constraint whatsapp_modelos_canal_check check (canal in ('whatsapp', 'sms', 'ambos', 'reserva'));

create table if not exists sms_envios (
  id         bigserial primary key,
  user_id    uuid references profiles(id) on delete set null,
  evento     text not null,
  telefone   text not null,
  texto      text not null,
  status     text not null check (status in ('enviada', 'erro')),
  erro       text,
  created_at timestamptz not null default now()
);
create index if not exists sms_envios_data on sms_envios (created_at desc);
alter table sms_envios enable row level security;
drop policy if exists "sms_envios: admin lê" on sms_envios;
create policy "sms_envios: admin lê" on sms_envios for select to authenticated using (is_admin());
grant select on sms_envios to authenticated;

-- Canal e texto de SMS de um aviso ativo (o servidor do site consulta antes de enviar).
create or replace function aviso_canal(p_evento text) returns table (canal text, texto_sms text)
language sql stable security definer set search_path = public as $$
  select m.canal, m.texto_sms from whatsapp_modelos m where m.evento = p_evento and m.ativo;
$$;
revoke all on function aviso_canal(text) from public;
grant execute on function aviso_canal(text) to anon, authenticated;

-- Registra um SMS enviado. Aceito do admin, do próprio aluno, do servidor (chave de pagamentos)
-- ou logo depois de um aviso reservado para o mesmo telefone (lista Em breve, conta excluída).
create or replace function sms_registrar(p_evento text, p_telefone text, p_texto text, p_status text, p_erro text default null, p_chave text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_ok boolean := false;
begin
  if p_status not in ('enviada', 'erro') then return; end if;
  if auth.uid() is not null then v_ok := true;
  elsif p_chave is not null then
    begin perform _confere_chave(p_chave); v_ok := true; exception when others then v_ok := false; end;
  end if;
  if not v_ok then
    v_ok := exists (select 1 from whatsapp_envios w where w.created_at > now() - interval '10 minutes'
                    and regexp_replace(coalesce(w.telefone, ''), '\D', '', 'g') like '%' || right(regexp_replace(p_telefone, '\D', '', 'g'), 10));
  end if;
  if not v_ok then return; end if;
  insert into sms_envios (user_id, evento, telefone, texto, status, erro)
  values (case when auth.uid() is not null and not is_admin() then auth.uid() end,
          left(coalesce(p_evento, 'manual'), 60), left(p_telefone, 30), left(p_texto, 1000), p_status, left(p_erro, 300));
end $$;
revoke all on function sms_registrar(text, text, text, text, text, text) from public;
grant execute on function sms_registrar(text, text, text, text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';
