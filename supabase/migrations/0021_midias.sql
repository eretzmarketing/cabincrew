-- Cabin Crew · 0021 · Biblioteca de mídia (fotos, vídeos e áudios) do painel
-- Os arquivos ficam no servidor (VPS), na pasta /home/cabincrew/midia. Aqui guardamos só o cadastro.
-- Pode rodar mais de uma vez.

create table if not exists midias (
  id          uuid primary key default gen_random_uuid(),
  tipo        text not null check (tipo in ('imagem', 'video', 'audio')),
  arquivo     text not null unique,          -- caminho dentro da pasta de mídia, ex.: imagens/2026-11/abc123.webp
  miniatura   text,                          -- só imagens: versão pequena para a grade
  nome        text not null,                 -- nome original do arquivo
  titulo      text,
  descricao   text,                          -- texto alternativo / legenda
  pasta       text,                          -- organização livre: "Entrevista", "Dinâmicas"...
  mime        text not null,
  tamanho     bigint not null default 0,     -- bytes
  largura     int,
  altura      int,
  criado_por  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists midias_tipo_data on midias (tipo, created_at desc);

alter table midias enable row level security;
drop policy if exists "admin gerencia midias" on midias;
create policy "admin gerencia midias" on midias for all to authenticated using (is_admin()) with check (is_admin());
grant select, insert, update, delete on midias to authenticated;

notify pgrst, 'reload schema';

select 'Biblioteca de mídia pronta' as status, count(*) as arquivos from midias;
