#!/usr/bin/env python3
"""
Gera o SQL das questões novas da Cabin Crew (lote cc2611) a partir dos arquivos de dados desta pasta.

Cada questão é escrita com a resposta certa primeiro; o gerador embaralha as alternativas de forma fixa
(a mesma ordem sempre) e distribui a letra certa entre A, B, C e D.
As questões entram FORA dos simulados (ativo = false) para revisão; no admin dá para ativar o lote inteiro.

Uso:  python3 scripts/questoes-cc/gerar.py   ->  supabase/migrations/0054_questoes_novas.sql
"""
import hashlib, json, os, random, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)

from dados_logica import QUESTOES as LOGICA          # noqa: E402
from dados_atencao import QUESTOES as ATENCAO        # noqa: E402
from dados_portugues import QUESTOES as PORTUGUES    # noqa: E402
from dados_ingles import QUESTOES as INGLES          # noqa: E402
from matrizes import QUESTOES as MATRIZES            # noqa: E402

LOTE = "cc2611"
LETRAS = "ABCDE"


def sql(s):
    return "null" if s is None else "'" + str(s).replace("'", "''") + "'"


def linha(banco, q, n):
    """q = dict(cat, enunciado, certa, erradas, explicacao, contexto?, imagem?, imagens_alt?)"""
    alts = [(q["certa"], True, (q.get("imagens_alt") or [None])[0])]
    for i, e in enumerate(q["erradas"]):
        img = (q.get("imagens_alt") or [None] * 10)[i + 1] if q.get("imagens_alt") else None
        alts.append((e, False, img))
    textos = [a[0] for a in alts]
    if len(set(textos)) != len(textos) and not q.get("imagens_alt"):
        raise SystemExit(f"alternativas repetidas: {q['enunciado'][:60]}")
    rnd = random.Random(hashlib.sha256((banco + q["enunciado"] + str(q.get("imagem") or "") + str(q.get("contexto") or "")).encode()).hexdigest())
    if not q.get("fixa"):
        rnd.shuffle(alts)
    correta = LETRAS[[a[1] for a in alts].index(True)]
    alternativas = [{"letra": LETRAS[i], "texto": LETRAS[i] if a[2] else a[0], "imagem_url": a[2]} for i, a in enumerate(alts)]
    origem = f"{LOTE}-{banco}-{n:03d}"
    return (
        f"({sql(banco)}, {sql(origem)}, {sql(q['cat'])}, {sql(q.get('contexto'))}, {sql(q['enunciado'])}, "
        f"{sql(q.get('imagem'))}, {sql(json.dumps(alternativas, ensure_ascii=False))}::jsonb, {sql(correta)}, "
        f"{sql(q['explicacao'])}, false)"
    ), correta


def main():
    grupos = [("logico", LOGICA + ATENCAO + MATRIZES), ("portugues", PORTUGUES), ("ingles", INGLES)]
    linhas, resumo, letras = [], [], {c: 0 for c in LETRAS}
    for banco, qs in grupos:
        cats = {}
        for n, q in enumerate(qs, 1):
            l, c = linha(banco, q, n)
            linhas.append(l)
            letras[c] += 1
            cats[q["cat"]] = cats.get(q["cat"], 0) + 1
        resumo.append(f"--   {banco}: " + ", ".join(f"{k} ({v})" for k, v in cats.items()))
    total = len(linhas)
    corpo = ",\n".join(linhas)
    out = f"""-- Cabin Crew · 0054 · Questões novas (lote {LOTE}): {total} questões originais com gabarito comentado
{chr(10).join(resumo)}
-- Entram FORA dos simulados (ativo = false). Revise no Admin › Banco de questões e use
-- "Colocar todas desta lista nos simulados" (filtro Situação: Fora dos simulados).
-- Pode rodar mais de uma vez (não duplica: banco + origem_id).

insert into questoes (banco, origem_id, categoria, contexto, enunciado, imagem_url, alternativas, correta, explicacao, ativo) values
{corpo}
on conflict (banco, origem_id) do nothing;

select banco, categoria, count(*) as novas from questoes where origem_id like '{LOTE}-%' group by 1, 2 order by 1, 2;
"""
    destino = os.path.join(AQUI, "..", "..", "supabase", "migrations", "0054_questoes_novas.sql")
    open(destino, "w").write(out)
    print(f"{total} questões -> {os.path.normpath(destino)}")
    print("letras certas:", letras)
    print("\n".join(resumo))


if __name__ == "__main__":
    main()
