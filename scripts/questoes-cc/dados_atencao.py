"""Atenção e checagem de dados (comparar códigos, contar, conferir documentos). Conteúdo original Cabin Crew.
As contagens são calculadas aqui no código, para o gabarito nunca errar."""

CAT = "Atenção e checagem"


def Q(enunciado, certa, erradas, explicacao, contexto=None):
    return {"cat": CAT, "enunciado": enunciado, "certa": str(certa), "erradas": [str(e) for e in erradas], "explicacao": explicacao, "contexto": contexto}


def contar(texto, alvo):
    return texto.count(alvo)


def vizinhos(n):
    """três números errados perto do certo, sem repetir"""
    out = []
    for d in (1, -1, 2, -2, 3):
        v = n + d
        if v >= 0 and v != n and v not in out:
            out.append(v)
        if len(out) == 3:
            break
    return out


QUESTOES = []

# ---------------------------------------------------------------- 1) qual par é idêntico
PARES = [
    (("XK7-29QL", "XK7-29QL"), [("XK7-29QL", "XK7-92QL"), ("XK7-29QL", "XK1-29QL"), ("XK7-29QL", "XK7-29OL")]),
    (("PR-GTB 4471", "PR-GTB 4471"), [("PR-GTB 4471", "PR-GBT 4471"), ("PR-GTB 4471", "PR-GTB 4417"), ("PR-GTB 4471", "PR-CTB 4471")]),
    (("LOC 8H2J5P", "LOC 8H2J5P"), [("LOC 8H2J5P", "LOC 8H2J5R"), ("LOC 8H2J5P", "LOC 8N2J5P"), ("LOC 8H2J5P", "LOC 8H2I5P")]),
    (("GRU-SCL 0715", "GRU-SCL 0715"), [("GRU-SCL 0715", "GRU-SLC 0715"), ("GRU-SCL 0715", "GRU-SCL 0751"), ("GRU-SCL 0715", "GUR-SCL 0715")]),
    (("BR 3390 6612 07", "BR 3390 6612 07"), [("BR 3390 6612 07", "BR 3390 6621 07"), ("BR 3390 6612 07", "BR 3930 6612 07"), ("BR 3390 6612 07", "BR 3390 6612 01")]),
    (("Mariana S. Albuquerque", "Mariana S. Albuquerque"), [("Mariana S. Albuquerque", "Mariana S. Albuquerqe"), ("Mariana S. Albuquerque", "Marianna S. Albuquerque"), ("Mariana S. Albuquerque", "Mariana Z. Albuquerque")]),
]
for (certo, errados) in PARES:
    QUESTOES.append(Q(
        "Qual dos pares abaixo tem os dois itens EXATAMENTE iguais?",
        f"{certo[0]}  |  {certo[1]}", [f"{a}  |  {b}" for a, b in errados],
        "Compare caractere por caractere. Nos outros pares há uma troca de posição, um número ou uma letra diferente.",
    ))

# ---------------------------------------------------------------- 2) quantas vezes aparece
CONTAGENS = [
    ("7", "4 7 1 7 9 2 7 0 7 3 8 7 1 4 7 6"),
    ("A", "B A R A T A P A L A V R A A V I A Ç Ã O"),
    ("3", "13 30 83 33 43 03 31 38 93 23"),
    ("Q", "Q O O Q C Q O D Q O Q C O Q Q O"),
    ("9", "6 9 6 9 9 6 0 9 6 6 9 9 6 0 6 9"),
    ("e", "Senhoras e senhores, bem-vindos a bordo deste voo"),
]
for alvo, seq in CONTAGENS:
    n = contar(seq, alvo)
    QUESTOES.append(Q(
        f"Quantas vezes o caractere \"{alvo}\" aparece no trecho abaixo?",
        n, vizinhos(n),
        f"Contando um por um, o \"{alvo}\" aparece {n} vezes. Dica: risque mentalmente cada um à medida que contar.",
        contexto=seq,
    ))

# ---------------------------------------------------------------- 3) conferir lista de passageiros
LISTA = "Lista de embarque (assento · nome · documento)\n12A · Paula Ribeiro · 418.553.209-11\n12B · Marcos Teles · 302.771.845-60\n12C · Vânia Couto · 559.208.113-47\n14A · Hélio Barros · 210.664.397-02\n14B · Iara Lemos · 733.019.582-36"
CONFERIR = [
    ("Na porta, a passageira apresenta: \"Vânia Couto, documento 559.208.113-47, assento 12C\". O que você conclui?",
     "Todos os dados conferem.", ["O documento não confere.", "O assento não confere.", "O nome não confere."],
     "Nome, documento e assento são iguais aos da lista."),
    ("O passageiro apresenta: \"Marcos Teles, documento 302.771.854-60, assento 12B\". O que você conclui?",
     "O documento não confere.", ["Todos os dados conferem.", "O assento não confere.", "O nome não confere."],
     "Na lista o documento é 302.771.845-60. O apresentado tem 854 no lugar de 845."),
    ("O passageiro apresenta: \"Hélio Barros, documento 210.664.397-02, assento 14B\". O que você conclui?",
     "O assento não confere.", ["Todos os dados conferem.", "O documento não confere.", "O nome não confere."],
     "Hélio Barros está no 14A. O 14B é da Iara Lemos."),
    ("A passageira apresenta: \"Paula Ribeiro, documento 418.553.209-11, assento 12A\". O que você conclui?",
     "Todos os dados conferem.", ["O documento não confere.", "O assento não confere.", "O nome não confere."],
     "Nome, documento e assento batem com a lista."),
    ("A passageira apresenta: \"Iara Leme, documento 733.019.582-36, assento 14B\". O que você conclui?",
     "O nome não confere.", ["Todos os dados conferem.", "O documento não confere.", "O assento não confere."],
     "Na lista o sobrenome é Lemos, não Leme."),
    ("Quantos passageiros da lista têm o número 5 no primeiro grupo de três dígitos do documento?",
     "1", ["0", "2", "3"],
     "Primeiros grupos: 418, 302, 559, 210, 733. Só o 559 tem o número 5."),
]
for enunciado, certa, erradas, exp in CONFERIR:
    QUESTOES.append(Q(enunciado, certa, erradas, exp, contexto=LISTA))

# ---------------------------------------------------------------- 4) qual é o diferente
DIFERENTES = [
    (["MN8840", "MN8840", "MN8840", "MN8480"], "MN8480", "Três itens são MN8840. O MN8480 tem os dígitos 4 e 8 trocados."),
    (["Gate 27B", "Gate 27B", "Gate 72B", "Gate 27B"], "Gate 72B", "Os outros são 27B; no diferente o 2 e o 7 estão invertidos."),
    (["ABX-0310", "ABX-0310", "ABX-0310", "ABX-0301"], "ABX-0301", "Os três iguais terminam em 0310; o diferente termina em 0301."),
    (["Rodrigues", "Rodrigues", "Rodriguez", "Rodrigues"], "Rodriguez", "Um deles termina em \"z\" e os outros em \"s\"."),
    (["14:35", "14:35", "14:53", "14:35"], "14:53", "Os minutos foram invertidos: 53 em vez de 35."),
    (["CGH ✈ POA", "CGH ✈ POA", "CGH ✈ POA", "CHG ✈ POA"], "CHG ✈ POA", "No diferente o código do aeroporto está escrito CHG em vez de CGH."),
]
for itens, certo, exp in DIFERENTES:
    erradas = []
    for x in itens:
        if x != certo and x not in erradas:
            erradas.append(x)
    # alternativas: o diferente + o repetido + duas variações plausíveis já apresentadas
    alt_erradas = [erradas[0], "Todos são iguais", "Há dois diferentes"]
    QUESTOES.append(Q(
        "Na relação abaixo, qual item é diferente dos demais?",
        certo, alt_erradas, exp, contexto="   ·   ".join(itens),
    ))

# ---------------------------------------------------------------- 5) tabela de voos
QUADRO = "Painel de partidas\nVoo 2210 · Recife · 07:40 · Portão 12 · Embarcando\nVoo 3045 · Curitiba · 08:15 · Portão 7 · Atrasado\nVoo 1188 · Recife · 09:05 · Portão 15 · No horário\nVoo 4502 · Salvador · 08:15 · Portão 9 · No horário\nVoo 2876 · Curitiba · 10:30 · Portão 7 · Cancelado"
PAINEL = [
    ("Quantos voos do painel vão para Recife?", "2", ["1", "3", "4"], "Os voos 2210 e 1188 vão para Recife."),
    ("Qual voo sai do mesmo portão que o voo 3045?", "2876", ["4502", "1188", "2210"], "O 3045 e o 2876 usam o Portão 7."),
    ("Quantos voos saem no mesmo horário que o voo para Salvador?", "1", ["0", "2", "3"], "O voo para Salvador sai às 08:15, mesmo horário do voo 3045 para Curitiba. Só 1 outro voo."),
    ("Um passageiro do voo para Curitiba das 10:30 pergunta se o voo dele está confirmado. O que o painel informa?", "O voo foi cancelado.", ["O voo está atrasado.", "O voo está no horário.", "O voo está embarcando."], "O voo 2876 (Curitiba, 10:30) aparece como Cancelado. Não confunda com o 3045, que está atrasado."),
    ("Qual é o primeiro voo do painel que está no horário?", "4502", ["1188", "2210", "3045"], "Em ordem de horário, o primeiro com status No horário é o 4502, às 08:15. O 2210 está embarcando e o 3045 está atrasado."),
    ("Quantos voos NÃO estão no horário (embarcando, atrasados ou cancelados)?", "3", ["2", "4", "1"], "2210 (embarcando), 3045 (atrasado) e 2876 (cancelado)."),
]
for enunciado, certa, erradas, exp in PAINEL:
    QUESTOES.append(Q(enunciado, certa, erradas, exp, contexto=QUADRO))
