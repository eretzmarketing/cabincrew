-- Cabin Crew · 0046 · Planos editáveis no admin (nome, ordem, cursos incluídos, criar e excluir)
-- Excluir um plano só o esconde (excluido = true): compras e pagamentos em andamento continuam funcionando.
-- Head Hunter e Flight Attendant English são os cursos em si e não podem ser excluídos (só desativados).
-- Pode rodar mais de uma vez.

alter table produtos add column if not exists excluido boolean not null default false;
alter table produtos add column if not exists created_at timestamptz not null default now();

-- todo plano precisa liberar pelo menos um curso válido
create or replace function produtos_confere_inclui() returns trigger language plpgsql as $$
begin
  if new.inclui is null or cardinality(new.inclui) = 0 or not (new.inclui <@ array['head-hunter', 'english']) then
    raise exception 'O plano precisa incluir o Head Hunter, o Flight Attendant English ou os dois.';
  end if;
  if new.slug in ('head-hunter', 'english') and new.excluido then
    raise exception 'Os cursos Head Hunter e Flight Attendant English não podem ser excluídos, só desativados.';
  end if;
  return new;
end $$;
drop trigger if exists produtos_confere_inclui_trg on produtos;
create trigger produtos_confere_inclui_trg before insert or update on produtos for each row execute function produtos_confere_inclui();

-- o cartão mostra o nome do plano como título: o combo passa a se chamar "Combo" (se você ainda não mudou)
update produtos set nome = 'Combo',
       descricao = 'Head Hunter + Flight Attendant English: os dois cursos juntos, a preparação completa para a seleção e o inglês de aviação.'
 where slug = 'combo' and nome = 'Head Hunter + Flight Attendant English';

notify pgrst, 'reload schema';
select 'planos editáveis prontos' as status;
