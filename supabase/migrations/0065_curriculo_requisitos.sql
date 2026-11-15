-- Cabin Crew · 0065 · Requisitos e palavras-chave da análise de currículo (editáveis no admin)
--   • exigido: o que as companhias pedem (ex.: CMA com validade mínima)
--   • diferencial: conta a favor (ex.: passaporte)
--   • palavra-chave: termos que o robô de triagem (ATS) procura
-- Rode depois do 0064. Pode rodar mais de uma vez (não apaga o que você editou).

create table if not exists cv_requisitos (
  id             bigserial primary key,
  nome           text not null unique check (char_length(nome) between 2 and 80),
  tipo           text not null default 'palavra' check (tipo in ('exigido', 'diferencial', 'palavra')),
  termos         text[] not null default '{}',
  validade_meses smallint check (validade_meses between 1 and 120),
  instrucao      text check (char_length(instrucao) <= 500),
  ativo          boolean not null default true,
  ordem          integer not null default 100,
  atualizado_em  timestamptz not null default now()
);
alter table cv_requisitos enable row level security;
drop policy if exists "cv_requisitos: ler" on cv_requisitos;
create policy "cv_requisitos: ler" on cv_requisitos for select to authenticated using (true);
drop policy if exists "cv_requisitos: admin" on cv_requisitos;
create policy "cv_requisitos: admin" on cv_requisitos for all to authenticated using (is_admin()) with check (is_admin());
grant select, insert, update, delete on cv_requisitos to authenticated;
grant usage, select on sequence cv_requisitos_id_seq to authenticated;

insert into cv_requisitos (nome, tipo, termos, validade_meses, instrucao, ordem) values
  ('CMA válido', 'exigido', array['CMA', 'Certificado Médico Aeronáutico', 'Certificado Medico Aeronautico'], 12,
   'Todas as companhias exigem o CMA (Certificado Médico Aeronáutico) com pelo menos 1 ano de validade. Se não estiver no currículo ou sem a data de validade, peça para incluir (ex.: "CMA 2ª classe válido até 03/2028").', 10),
  ('Experiência com atendimento', 'exigido', array['atendimento', 'atendimento ao cliente', 'atendente', 'recepção', 'recepcionista', 'hospitalidade', 'hotelaria', 'vendas', 'vendedor', 'vendedora', 'caixa', 'garçom', 'garçonete', 'call center', 'SAC'], null,
   'As companhias buscam muito experiência com atendimento ao público. Valorize essa experiência com exemplos e resultados.', 20),
  ('Passaporte válido', 'diferencial', array['passaporte'], null,
   'Passaporte é opcional, mas é um grande diferencial: se o candidato tiver, deve aparecer no currículo com a validade.', 30),
  ('Curso de comissário / CHT ANAC', 'diferencial', array['comissário de voo', 'comissaria de voo', 'comissário', 'CHT', 'CCT', 'habilitação técnica'], null, null, 40),
  ('Inglês', 'diferencial', array['inglês', 'ingles', 'english'], null, 'Informe o idioma com o nível (básico, intermediário, avançado, fluente).', 50),
  ('Espanhol', 'diferencial', array['espanhol', 'spanish', 'español'], null, null, 60),
  ('Segurança', 'palavra', array['segurança', 'seguranca'], null, null, 100),
  ('Trabalho em equipe', 'palavra', array['trabalho em equipe', 'equipe'], null, null, 110),
  ('Comunicação', 'palavra', array['comunicação', 'comunicacao', 'comunicativo', 'comunicativa'], null, null, 120),
  ('Resolução de problemas', 'palavra', array['resolução de problemas', 'resolver problemas', 'solução de problemas'], null, null, 130),
  ('Primeiros socorros', 'palavra', array['primeiros socorros'], null, null, 140),
  ('Natação', 'palavra', array['natação', 'natacao', 'nadar'], null, null, 150),
  ('Disponibilidade para mudança', 'palavra', array['disponibilidade para mudança', 'disponibilidade para mudar', 'disponibilidade para residir', 'disponibilidade de horário', 'escalas'], null, null, 160)
on conflict (nome) do nothing;

notify pgrst, 'reload schema';
select 'requisitos do currículo prontos' as status;
