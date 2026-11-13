-- Cabin Crew · 0049 · Certificados
--   • um modelo por curso: imagem de fundo + campos (nome, curso, data, nota, código) com posição, tamanho, cor e fonte
--   • o aluno emite o certificado quando conclui o curso; cada certificado tem um código público de verificação
--   • o admin pode emitir manualmente e revogar
-- Pode rodar mais de uma vez.

create table if not exists certificado_modelos (
  curso      text primary key check (curso in ('head-hunter', 'english')),
  imagem     text,                                -- imagens/certificados/<id>.jpg
  largura    integer not null default 3508,
  altura     integer not null default 2480,
  campos     jsonb not null default '[]'::jsonb,
  ativo      boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table certificado_modelos enable row level security;
drop policy if exists "modelos de certificado: todos veem" on certificado_modelos;
create policy "modelos de certificado: todos veem" on certificado_modelos for select using (true);
drop policy if exists "modelos de certificado: admin" on certificado_modelos;
create policy "modelos de certificado: admin" on certificado_modelos for all to authenticated using (is_admin()) with check (is_admin());
grant select on certificado_modelos to anon, authenticated;
grant insert, update on certificado_modelos to authenticated;

create table if not exists certificados (
  codigo       text primary key check (codigo ~ '^[A-Z0-9]{8}$'),
  user_id      uuid references profiles(id) on delete set null,
  curso        text not null check (curso in ('head-hunter', 'english')),
  nome         text not null,                    -- nome do aluno na emissão
  concluido_em timestamptz not null,
  nota         numeric(5,1),
  emitido_em   timestamptz not null default now(),
  emitido_por  text not null default 'aluno',
  revogado     boolean not null default false
);
create unique index if not exists certificados_um_por_curso on certificados (user_id, curso) where not revogado;
alter table certificados enable row level security;
drop policy if exists "certificados: o proprio ou admin" on certificados;
create policy "certificados: o proprio ou admin" on certificados for select to authenticated using (user_id = auth.uid() or is_admin());
drop policy if exists "certificados: admin altera" on certificados;
create policy "certificados: admin altera" on certificados for update to authenticated using (is_admin()) with check (is_admin());
grant select, update on certificados to authenticated;

create or replace function _codigo_certificado() returns text language plpgsql as $$
declare c text; letras text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
begin
  loop
    c := '';
    for i in 1..8 loop c := c || substr(letras, 1 + floor(random() * length(letras))::int, 1); end loop;
    exit when not exists (select 1 from certificados where codigo = c);
  end loop;
  return c;
end $$;

-- nota do curso: média dos simulados/treinos finalizados (Head Hunter) ou dos quizzes (English)
create or replace function _nota_curso(p_user uuid, p_curso text) returns numeric
language sql stable security definer set search_path = public as $$
  select round(avg(n)::numeric, 1) from (
    select t.nota::numeric as n from tentativas t where p_curso = 'head-hunter' and t.user_id = p_user and t.finalizada_em is not null and t.nota is not null
    union all
    select ip.nota::numeric from ingles_progresso ip where p_curso = 'english' and ip.user_id = p_user and ip.concluida
  ) x;
$$;

create or replace function _emitir_certificado(p_user uuid, p_curso text, p_concluido timestamptz, p_por text) returns text
language plpgsql security definer set search_path = public as $$
declare v_cod text; v_nome text;
begin
  select codigo into v_cod from certificados where user_id = p_user and curso = p_curso and not revogado;
  if v_cod is not null then return v_cod; end if;
  select coalesce(nullif(trim(nome), ''), apelido) into v_nome from profiles where id = p_user;
  v_cod := _codigo_certificado();
  insert into certificados (codigo, user_id, curso, nome, concluido_em, nota, emitido_por)
  values (v_cod, p_user, p_curso, coalesce(v_nome, 'Aluno'), p_concluido, _nota_curso(p_user, p_curso), p_por);
  return v_cod;
end $$;
revoke all on function _emitir_certificado(uuid, text, timestamptz, text) from public, anon, authenticated;

-- O aluno emite o próprio certificado (só depois de concluir o curso)
create or replace function certificado_emitir(p_curso text) returns text
language plpgsql security definer set search_path = public as $$
declare v_fim timestamptz;
begin
  if auth.uid() is null then raise exception 'Entre na sua conta.'; end if;
  if esta_bloqueado() then raise exception 'Conta bloqueada.'; end if;
  select concluido_em into v_fim from acessos where user_id = auth.uid() and produto = p_curso and concluido_em is not null;
  if v_fim is null then
    select emitido_em into v_fim from certificados where user_id = auth.uid() and curso = p_curso and not revogado;
    if v_fim is null then raise exception 'Conclua o curso para emitir o certificado.'; end if;
  end if;
  return _emitir_certificado(auth.uid(), p_curso, v_fim, 'aluno');
end $$;
revoke all on function certificado_emitir(text) from public, anon;
grant execute on function certificado_emitir(text) to authenticated;

-- O admin emite manualmente (ex.: aluno do curso presencial)
create or replace function certificado_emitir_admin(p_user uuid, p_curso text, p_concluido timestamptz default now()) returns text
language plpgsql security definer set search_path = public as $$
begin
  perform _exige_admin();
  return _emitir_certificado(p_user, p_curso, coalesce(p_concluido, now()), 'admin');
end $$;
revoke all on function certificado_emitir_admin(uuid, text, timestamptz) from public, anon;
grant execute on function certificado_emitir_admin(uuid, text, timestamptz) to authenticated;

-- Verificação pública pelo código
create or replace function certificado_publico(p_codigo text)
returns table (codigo text, curso text, nome text, concluido_em timestamptz, nota numeric, emitido_em timestamptz, revogado boolean)
language sql stable security definer set search_path = public as $$
  select c.codigo, c.curso, c.nome, c.concluido_em, c.nota, c.emitido_em, c.revogado
  from certificados c where c.codigo = upper(trim(p_codigo));
$$;
revoke all on function certificado_publico(text) from public;
grant execute on function certificado_publico(text) to anon, authenticated;

notify pgrst, 'reload schema';
select 'certificados prontos' as status;
