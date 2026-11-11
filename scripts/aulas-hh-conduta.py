#!/usr/bin/env python3
"""Gera o SQL das aulas de texto dos cursos Head Hunter e Conduta Profissional (exportados da Horsky).

Uso: python3 -I scripts/aulas-hh-conduta.py <pasta do head hunter> <pasta do conduta>
- Head Hunter: aulas de texto vão para os módulos 1, 6, 4, 10 e 11 (as provas já estão no banco de questões).
- Conduta Profissional: as 25 aulas vão para o módulo 12 ("Aprovado, e agora?").
- Imagens do Conduta: convertidas para JPG em public/img/aulas/conduta/.
- Imagens do Head Hunter: continuam no site da Horsky (horsky.com.br), que é do mesmo dono.
"""
import html
import json
import re
import sys
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
HH_MODULO = [1, 6, 6, 6, 6, 6, 4, 10, 11]   # módulo do Head Hunter (posição) -> ordem do módulo no Crew Select
CONDUTA_MODULO = 12


def q(s):
    return "null" if s is None else "'" + str(s).replace("'", "''") + "'"


def texto_puro(h, limite=400):
    t = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", h or ""))).strip()
    return t[:limite] or None


def limpar(conteudo, titulo, imagens):
    h = conteudo or ""
    h = re.sub(r'\s(style|class)="[^"]*"', "", h)
    h = re.sub(r"<p>\s*<br\s*/?>", "<p>", h)
    h = re.sub(r"<p>\s*</p>", "", h)
    # o título já aparece no topo da aula
    h = re.sub(r"^\s*<h2>\s*" + re.escape(titulo.strip()) + r"\s*</h2>", "", h, flags=re.I)
    for antigo, novo in imagens.items():
        h = h.replace(antigo, novo)
    # imagem solta no começo vira uma figura com espaço
    h = re.sub(r'<img ([^>]*?)/?>', lambda m: "<img " + m.group(1).strip() + ' loading="lazy" />', h)
    return h.strip()


def minutos(d):
    m = re.match(r"(\d+)", d or "")
    return int(m.group(1)) if m else None


def main(hh_dir, conduta_dir):
    hh = json.loads((Path(hh_dir) / "course.json").read_text(encoding="utf-8"))["course"]
    co = json.loads((Path(conduta_dir) / "course.json").read_text(encoding="utf-8"))["course"]

    # imagens do Conduta -> public/img/aulas/conduta
    destino = RAIZ / "public/img/aulas/conduta"
    destino.mkdir(parents=True, exist_ok=True)
    mapa = {}
    for item in json.loads((Path(conduta_dir) / "media-manifest.json").read_text(encoding="utf-8")):
        if "file" not in item or "lesson-content" not in item["url"]:
            continue
        origem = Path(conduta_dir) / item["file"]
        nome = Path(item["file"]).stem + ".jpg"
        im = Image.open(origem).convert("RGB")
        im.thumbnail((1400, 1400))
        im.save(destino / nome, quality=82, optimize=True, progressive=True)
        mapa[item["url"]] = f"/img/aulas/conduta/{nome}"

    linhas = []
    for mi, m in enumerate(hh["modules"]):
        for li, l in enumerate(m["lessons"], 1):
            if l.get("type") != "text" or not (l.get("textContent") or "").strip():
                continue
            linhas.append((HH_MODULO[mi], (mi + 1) * 10 + li, l["title"].strip(), texto_puro(l.get("description")),
                           limpar(l["textContent"], l["title"], {}), minutos(l.get("duration")), "horsky-hh-" + l["id"]))
    for mi, m in enumerate(co["modules"]):
        for li, l in enumerate(m["lessons"], 1):
            linhas.append((CONDUTA_MODULO, (mi + 1) * 10 + li, l["title"].strip(), texto_puro(l.get("description")),
                           limpar(l["textContent"], l["title"], mapa), minutos(l.get("duration")), "horsky-conduta-" + l["id"]))

    valores = ",\n".join(
        f"  ({mod}, {ordem}, {q(titulo)}, {q(resumo)}, {q(conteudo)}, {dur if dur else 'null'}, {q(origem)})"
        for mod, ordem, titulo, resumo, conteudo, dur, origem in linhas
    )
    sql = f"""-- Cabin Crew · Aulas de texto dos cursos Head Hunter ({sum(o.startswith('horsky-hh') for *_, o in linhas)}) e Conduta Profissional ({sum(o.startswith('horsky-conduta') for *_, o in linhas)})
-- Gerado por scripts/aulas-hh-conduta.py. Pode rodar mais de uma vez (atualiza, não duplica).
-- As aulas entram como RASCUNHO. Revise em Admin → Crew Select e publique, ou rode 0027_publicar_aulas_importadas.sql.
-- Aulas que você já publicou continuam publicadas (o publicado não é alterado na atualização).

insert into aulas (modulo_id, ordem, titulo, resumo, conteudo, duracao_min, origem, tipo, publicado)
select m.id, v.ordem, v.titulo, v.resumo, v.conteudo, v.dur, v.origem, 'texto', false
from (values
{valores}
) v(modulo, ordem, titulo, resumo, conteudo, dur, origem)
join modulos m on m.ordem = v.modulo
on conflict (origem) do update set modulo_id = excluded.modulo_id, ordem = excluded.ordem, titulo = excluded.titulo,
  resumo = excluded.resumo, conteudo = excluded.conteudo, duracao_min = excluded.duracao_min, updated_at = now();

select m.ordem as modulo, m.titulo, count(*) as aulas_importadas
from aulas a join modulos m on m.id = a.modulo_id
where a.origem like 'horsky-hh-%' or a.origem like 'horsky-conduta-%'
group by 1, 2 order by 1;
"""
    (RAIZ / "supabase/importacao/0026_aulas_head_hunter_conduta.sql").write_text(sql, encoding="utf-8")
    (RAIZ / "supabase/importacao/0027_publicar_aulas_importadas.sql").write_text(
        "-- Publica as aulas importadas do Head Hunter e do Conduta Profissional (e os módulos delas).\n"
        "update aulas set publicado = true where origem like 'horsky-hh-%' or origem like 'horsky-conduta-%';\n"
        "update modulos set publicado = true where ordem in (1, 4, 6, 10, 11, 12);\n"
        "select count(*) as aulas_publicadas from aulas where publicado and (origem like 'horsky-hh-%' or origem like 'horsky-conduta-%');\n",
        encoding="utf-8")
    print(len(linhas), "aulas;", len(mapa), "imagens")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
