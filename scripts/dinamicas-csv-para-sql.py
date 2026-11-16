import csv, sys
src = sys.argv[1]  # CSV exportado da tabela group_dynamics da Horsky
CATS = {
  "af975c9b-771b-4286-ba3b-ebcd0513a167": ("quebra-gelo", "Quebra-gelo e apresentação", "Para o grupo se conhecer no começo da dinâmica: é aqui que a primeira impressão acontece.", 1),
  "2c756703-043a-49f8-9e12-71619efd8e48": ("trabalho-em-equipe", "Trabalho em equipe", "Desafios em grupo que mostram como você colabora, se comunica e ajuda os colegas.", 2),
  "a3706f1e-5337-4427-81b9-8bfbce499d36": ("comunicacao", "Comunicação e expressão", "Atividades de fala, argumentação e improviso, inclusive sob pressão.", 3),
  "5fddae1e-ad6f-4832-b204-32e56ce05e9e": ("resolucao-de-problemas", "Resolução de problemas e decisão", "Casos e situações em que o grupo precisa analisar, priorizar e decidir.", 4),
  "7aa987a9-5dc9-4062-bb14-e87c24e4e6e5": ("lideranca", "Liderança", "Situações para conduzir o grupo, delegar, mediar conflitos e decidir na emergência.", 5),
  "60a07995-5f3d-410b-b5a1-7d4914136b9f": ("autoconhecimento", "Autoconhecimento", "Reflexões sobre valores, qualidades, emoções e objetivos, muito usadas para conhecer o perfil do candidato.", 6),
  "9ef902e5-e28b-49d3-92b9-3109792901cd": ("inovacao", "Criatividade e inovação", "Técnicas para gerar ideias e propor soluções diferentes.", 7),
  "3a09c2d1-bf8f-436e-8309-57860330e68e": ("planejamento", "Planejamento e feedback", "Organizar ações, dar e receber feedback e avaliar o trabalho do grupo.", 8),
  "b4dc88e8-f95f-4fd3-b007-32f1e0a8c140": ("energizadores", "Energizadores", "Atividades rápidas para animar o grupo e observar disposição e espírito de equipe.", 9),
  "ffba1757-4b37-4edf-9cbb-4b3d1f0f7131": ("encerramento", "Encerramento e integração", "Fechamento da dinâmica com reconhecimento, gratidão e compromissos do grupo.", 10),
}
lit = lambda v: "null" if v is None or str(v).strip() == "" else "'" + str(v).strip().replace("'", "''") + "'"
rows = list(csv.DictReader(open(src, encoding="utf-8-sig")))
faltam = {r["category_id"] for r in rows} - set(CATS)
assert not faltam, faltam
out = ["""-- Cabin Crew · Dinâmicas de grupo (biblioteca do Head Hunter), importadas da Horsky
--   • %d dinâmicas em %d categorias: objetivo, materiais, como é realizada e como se destacar
--   • pode rodar mais de uma vez: atualiza o que já existe, não duplica
--   • entram visíveis para os alunos; para esconder alguma: Admin › Head Hunter › Dinâmicas
""" % (len(rows), len(CATS)), "begin;", ""]
out.append("insert into dinamicas_categorias (slug, titulo, descricao, ordem, ativo) values")
out.append(",\n".join(f"  ({lit(s)}, {lit(t)}, {lit(d)}, {o}, true)" for s, t, d, o in CATS.values()))
out.append("on conflict (slug) do update set titulo = excluded.titulo, descricao = excluded.descricao, ordem = excluded.ordem, ativo = true;\n")
out.append("insert into dinamicas (origem_id, categoria_id, titulo, objetivo, materiais, como_realizada, como_se_destacar, ordem, ativo)")
out.append("select v.origem, c.id, v.titulo, v.objetivo, v.materiais, v.como, v.destaque, v.ordem, v.ativo from (values")
vals = []
for r in sorted(rows, key=lambda r: (CATS[r["category_id"]][3], int(r["display_order"] or 0))):
    vals.append(f"  ({lit(r['id'])}, {lit(CATS[r['category_id']][0])}, {lit(r['titulo'])}, {lit(r['objetivo'])}, {lit(r['materiais'])}, {lit(r['como_realizada'])}, {lit(r['como_se_destacar'])}, {int(r['display_order'] or 0)}, {'true' if r['is_active'].lower()=='true' else 'false'})")
out.append(",\n".join(vals))
out.append(""") as v(origem, slug, titulo, objetivo, materiais, como, destaque, ordem, ativo)
join dinamicas_categorias c on c.slug = v.slug
on conflict (origem_id) do update set categoria_id = excluded.categoria_id, titulo = excluded.titulo, objetivo = excluded.objetivo,
  materiais = excluded.materiais, como_realizada = excluded.como_realizada, como_se_destacar = excluded.como_se_destacar,
  ordem = excluded.ordem, ativo = excluded.ativo;

-- a biblioteca aparece no módulo de Dinâmicas de Grupo
update modulos set recurso = 'dinamicas' where curso = 'head-hunter' and recurso is null and titulo ilike '%din_mica%';

commit;

select c.titulo as categoria, count(d.id) as dinamicas from dinamicas_categorias c left join dinamicas d on d.categoria_id = c.id group by c.titulo, c.ordem order by c.ordem;""")
open("/home/claude/cabincrew/supabase/importacao/0067_dinamicas_de_grupo.sql", "w").write("\n".join(out) + "\n")
print(len(rows))
