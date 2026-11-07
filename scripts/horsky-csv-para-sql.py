"""Gera os SQLs de importação das questões a partir dos CSVs exportados da Horsky."""
import csv, hashlib, json, random, re, sys, unicodedata
from pathlib import Path

csv.field_size_limit(10**9)
SRC = Path(sys.argv[1])
OUT = Path(sys.argv[2])
HORSKY = "https://horsky.com.br"


def ler(nome):
    f = next(SRC.glob(f"*{nome}"))
    return list(csv.DictReader(open(f, encoding="utf-8-sig")))


def lit(v):
    if v is None:
        return "null"
    return "'" + str(v).replace("'", "''") + "'"


def limpo(v):
    v = (v or "").strip()
    return v or None


def img(v):
    v = limpo(v)
    if not v:
        return None
    return v if v.startswith("http") else HORSKY + ("" if v.startswith("/") else "/") + v


def tema_logico(v):
    t = (v or "").strip().lower()
    for chave, nome in (("sequ", "Sequências"), ("silogismo", "Silogismos"), ("analogia", "Analogias"), ("problema", "Problemas lógicos"),
                        ("raven", "Matrizes"), ("matriz", "Matrizes"), ("padr", "Padrões")):
        if t.startswith(chave):
            return nome
    return (v or "").strip() or "Raciocínio lógico"


def letra(v):
    v = (v or "").strip().upper()
    return v if v in "ABCDE" and v else None


# Não embaralhar quando a ordem importa
FIXAS = re.compile(r"\b(todas|nenhuma|ambas|anteriores|acima|all of the|none of the|both)\b|^(verdadeiro|falso|v|f|true|false|sim|não|nao|impossível|não é possível)\b", re.I)


def montar(banco, origem, enunciado, alts, correta, categoria=None, contexto=None, imagem=None, explicacao=None, embaralhar=True):
    alts = [(l, limpo(t), img(i) if i else None) for l, t, i in alts]
    alts = [a for a in alts if a[1] or a[2]]
    correta = letra(correta)
    textos = [a[1] or "" for a in alts]
    pode = (
        embaralhar
        and correta
        and len(alts) >= 3
        and not any(a[2] for a in alts)
        and not imagem  # a figura costuma rotular as opções (A, B, C…)
        and not any(t.strip().upper().rstrip(").") in ("A", "B", "C", "D", "E") for t in textos)
        and not any(FIXAS.search(t) for t in textos)
        and not re.search(r"alternativa\s+[a-e]\b|\bletra\s+[a-e]\b|\(\s*[a-e]\s*\)", enunciado or "", re.I)
    )
    if pode:
        rnd = random.Random(int(hashlib.sha1(origem.encode()).hexdigest(), 16))
        orig = [a[0] for a in alts]
        ordem = alts[:]
        rnd.shuffle(ordem)
        nova = None
        alts2 = []
        for i, a in enumerate(ordem):
            l = orig[i]
            if a[0] == correta:
                nova = l
            alts2.append((l, a[1], a[2]))
        alts, correta = alts2, nova
    js = [{"letra": l, "texto": t, "imagem_url": i} for l, t, i in alts]
    return dict(banco=banco, origem_id=origem, categoria=categoria, contexto=limpo(contexto), enunciado=limpo(enunciado),
                imagem_url=img(imagem), alternativas=json.dumps(js, ensure_ascii=False), correta=correta, explicacao=limpo(explicacao))


def abcd(r, sufixo="", letras="ABCD", imgs=None):
    return [(L, r.get(f"option_{L.lower()}{sufixo}"), (r.get(f"option_{L.lower()}_image") if imgs else None)) for L in letras]


lotes = {}

lotes["anac"] = [montar("anac", r["id"], r["question_text"], abcd(r), r["correct_answer"], categoria=limpo(r["block_name"])) for r in ler("anac_questions_rows.csv")]

outros = []
outros += [montar("portugues", r["id"], r["question_text"], abcd(r), r["correct_answer"], "Português") for r in ler("portuguese_questions_export.csv")]
outros += [montar("ingles", r["id"], r["question_text"], abcd(r), r["correct_answer"], "Inglês") for r in ler("english_questions_export.csv")]
outros += [montar("tecnico", r["id"], r["question_text"], abcd(r), r["correct_answer"], limpo(r["subject"]) or "Conhecimentos técnicos") for r in ler("technical_questions_export.csv")]
for r in ler("logical_reasoning_questions_export.csv"):
    outros.append(montar("logico", r["id"], r["question_text"], abcd(r, letras="ABCDE", imgs=True), r["correct_answer"],
                         tema_logico(r["category"]), imagem=r.get("matrix_image_url") or r.get("image_url"),
                         explicacao=r.get("explanation")))
outros += [montar("numerico", r["id"], r["question_text"], abcd(r), r["correct_answer"], "Raciocínio numérico",
                  contexto=r.get("data_description"), imagem=r.get("data_image_url")) for r in ler("numerical_reasoning_questions_export.csv")]
outros += [montar("verbal", r["id"], limpo(r.get("statement_to_evaluate")) or r["question_text"], abcd(r), r["correct_answer"], "Raciocínio verbal",
                  contexto=r.get("context_text")) for r in ler("verbal_reasoning_questions_export.csv")]
outros += [montar("sjt", r["id"], r["scenario"], abcd(r, "_text"), r["best_answer"], "Julgamento situacional") for r in ler("sjt_questions_export.csv")]
lotes["outros"] = outros

COLS = ["banco", "origem_id", "categoria", "contexto", "enunciado", "imagem_url", "alternativas", "correta", "explicacao"]


def sql_questoes(rows, titulo):
    rows = [r for r in rows if r["enunciado"]]
    out = [f"-- Cabin Crew · {titulo}", "-- Gerado a partir dos CSVs exportados da Horsky. Pode rodar mais de uma vez (atualiza, não duplica).", ""]
    for i in range(0, len(rows), 200):
        out.append(f"insert into questoes ({', '.join(COLS)}) values")
        vals = []
        for r in rows[i:i + 200]:
            v = [lit(r[c]) for c in COLS]
            v[6] += "::jsonb"
            vals.append("(" + ", ".join(v) + ")")
        out.append(",\n".join(vals))
        out.append("on conflict (banco, origem_id) do update set categoria = excluded.categoria, contexto = excluded.contexto, enunciado = excluded.enunciado,\n"
                   "  imagem_url = excluded.imagem_url, alternativas = excluded.alternativas, correta = excluded.correta, explicacao = excluded.explicacao;\n")
    out.append("update questoes set ativo = (correta is not null and jsonb_array_length(alternativas) >= 2) where origem_id is not null;\n")
    out.append("select banco, count(*) filter (where ativo) as ativas, count(*) as total from questoes group by banco order by banco;")
    return "\n".join(out) + "\n", len(rows)


n1 = 0
anac = lotes["anac"]
partes = [anac[i:i + 1000] for i in range(0, len(anac), 1000)]
for k, parte in enumerate(partes):
    s, n = sql_questoes(parte, f"Questões da banca ANAC · parte {k + 1} de {len(partes)}")
    (OUT / f"0009{'abcdefgh'[k]}_questoes_anac.sql").write_text(s)
    n1 += n
s, n2 = sql_questoes(lotes["outros"], "Questões de Português, Inglês, Técnicas, Lógico, Numérico, Verbal e SJT")
(OUT / "0010_questoes_testes.sql").write_text(s)
print("anac", n1, "outros", n2)
import collections
print(collections.Counter(r["correta"] for r in lotes["outros"] if r["banco"] in ("logico", "verbal", "sjt", "portugues")))
