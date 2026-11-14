"""Matrizes de raciocínio abstrato (estilo Raven/SHL indutivo), desenhadas em SVG a partir de regras.
Como as figuras são geradas pela regra, o gabarito é sempre coerente.
Os arquivos vão para public/img/questoes/matrizes/ e entram no site com o deploy."""
import hashlib, math, os

AQUI = os.path.dirname(os.path.abspath(__file__))
PASTA = os.path.join(AQUI, "..", "..", "public", "img", "questoes", "matrizes")
URL = "/img/questoes/matrizes"
COR = "#1f2a44"
CINZA = "#9aa3b8"

# ------------------------------------------------------------------ desenho de uma célula (100 x 100)

def forma(tipo, cx, cy, r, preenchimento, rot=0):
    fill = {"vazio": "none", "cheio": COR, "cinza": CINZA}[preenchimento]
    att = f'fill="{fill}" stroke="{COR}" stroke-width="3" stroke-linejoin="round"'
    if tipo == "circulo":
        return f'<circle cx="{cx}" cy="{cy}" r="{r}" {att}/>'
    lados = {"triangulo": 3, "quadrado": 4, "pentagono": 5, "losango": 4, "hexagono": 6}[tipo]
    inicio = {"triangulo": -90, "quadrado": -45, "pentagono": -90, "losango": -90, "hexagono": 0}[tipo] + rot
    pts = " ".join(f"{cx + r * math.cos(math.radians(inicio + i * 360 / lados)):.1f},{cy + r * math.sin(math.radians(inicio + i * 360 / lados)):.1f}" for i in range(lados))
    return f'<polygon points="{pts}" {att}/>'


def seta(cx, cy, ang):
    return (f'<g transform="rotate({ang} {cx} {cy})"><line x1="{cx}" y1="{cy + 28}" x2="{cx}" y2="{cy - 22}" stroke="{COR}" stroke-width="5" stroke-linecap="round"/>'
            f'<polygon points="{cx},{cy - 34} {cx - 13},{cy - 14} {cx + 13},{cy - 14}" fill="{COR}"/></g>')


POS = {1: [(50, 50)], 2: [(30, 50), (70, 50)], 3: [(50, 28), (28, 70), (72, 70)], 4: [(30, 30), (70, 30), (30, 70), (70, 70)]}


def celula(c):
    """c = dict(tipo, n, fill, tam, rot, seta, ponto, linhas)"""
    s = []
    if c.get("seta") is not None:
        s.append(seta(50, 50, c["seta"]))
    if c.get("tipo"):
        n = c.get("n", 1)
        r = c.get("tam", 26 if n == 1 else 15)
        for (x, y) in POS[n]:
            s.append(forma(c["tipo"], x, y, r, c.get("fill", "vazio"), c.get("rot", 0)))
    if c.get("ponto"):
        x, y = {"ne": (82, 18), "se": (82, 82), "so": (18, 82), "no": (18, 18)}[c["ponto"]]
        s.append(f'<circle cx="{x}" cy="{y}" r="7" fill="{COR}"/>')
        s.append(f'<rect x="30" y="30" width="40" height="40" fill="none" stroke="{COR}" stroke-width="3"/>')
    for l in c.get("linhas", ()):
        a, b, x, y = {"v": (50, 12, 50, 88), "h": (12, 50, 88, 50), "d": (18, 18, 82, 82), "e": (82, 18, 18, 82)}[l]
        s.append(f'<line x1="{a}" y1="{b}" x2="{x}" y2="{y}" stroke="{COR}" stroke-width="5" stroke-linecap="round"/>')
    if c.get("linhas") is not None:
        s.append(f'<rect x="8" y="8" width="84" height="84" fill="none" stroke="{CINZA}" stroke-width="2"/>')
    return "".join(s)


def svg_matriz(grade):
    w = 3 * 110 + 10
    partes = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {w}" width="{w}" height="{w}"><rect width="{w}" height="{w}" fill="#fff"/>']
    for i in range(3):
        for j in range(3):
            x, y = 10 + j * 110, 10 + i * 110
            partes.append(f'<rect x="{x}" y="{y}" width="100" height="100" rx="6" fill="#f6f7fa" stroke="#c9cedb" stroke-width="2"/>')
            if i == 2 and j == 2:
                partes.append(f'<text x="{x + 50}" y="{y + 66}" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="700" fill="#c4002b">?</text>')
            else:
                partes.append(f'<g transform="translate({x} {y})">{celula(grade[i][j])}</g>')
    partes.append("</svg>")
    return "".join(partes)


def svg_opcao(c):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 110" width="110" height="110"><rect width="110" height="110" fill="#fff"/><rect x="5" y="5" width="100" height="100" rx="6" fill="#f6f7fa" stroke="#c9cedb" stroke-width="2"/><g transform="translate(5 5)">{celula(c)}</g></svg>'


# ------------------------------------------------------------------ as 10 matrizes (grade 3x3, resposta = grade[2][2])

def m(tipo, n=1, fill="vazio", **k):
    return dict(tipo=tipo, n=n, fill=fill, **k)


MATRIZES = []

# 1) forma por linha, quantidade 1-2-3 por coluna
g = [[m(t, n) for n in (1, 2, 3)] for t in ("circulo", "quadrado", "triangulo")]
MATRIZES.append((g, [m("triangulo", 2), m("quadrado", 3), m("triangulo", 3, "cheio")],
                 "Em cada linha a forma é a mesma e a quantidade aumenta: 1, 2, 3. Na última linha (triângulos) falta o grupo de 3 triângulos vazios."))

# 2) quadrado latino de formas, preenchimento por linha
lat = [("circulo", "quadrado", "triangulo"), ("quadrado", "triangulo", "circulo"), ("triangulo", "circulo", "quadrado")]
fills = ("vazio", "cinza", "cheio")
g = [[m(lat[i][j], 1, fills[i]) for j in range(3)] for i in range(3)]
MATRIZES.append((g, [m("quadrado", 1, "cinza"), m("circulo", 1, "cheio"), m("triangulo", 1, "cheio")],
                 "Cada linha tem um círculo, um quadrado e um triângulo, e cada linha tem um preenchimento (vazio, cinza, preto). Na 3ª linha falta o quadrado, preto."))

# 3) quantidade pela coluna, preenchimento pela linha (losangos)
g = [[m("losango", n, f) for n in (1, 2, 3)] for f in ("vazio", "cinza", "cheio")]
MATRIZES.append((g, [m("losango", 3, "cinza"), m("losango", 2, "cheio"), m("quadrado", 3, "cheio")],
                 "A quantidade aumenta nas colunas (1, 2, 3) e o preenchimento muda nas linhas (vazio, cinza, preto). Resposta: 3 losangos pretos."))

# 4) seta girando 45° a cada coluna, linhas começam em 0°, 90°, 180°
g = [[dict(seta=b + 45 * j) for j in range(3)] for b in (0, 90, 180)]
MATRIZES.append((g, [dict(seta=180), dict(seta=315), dict(seta=90)],
                 "A seta gira 45° no sentido horário a cada coluna. A 3ª linha começa em 180° (para baixo): 180°, 225°, 270°. A resposta aponta para a esquerda."))

# 5) tamanho cresce na coluna, forma por linha
tams = (12, 20, 30)
g = [[m(t, 1, "vazio", tam=tams[j]) for j in range(3)] for t in ("hexagono", "circulo", "pentagono")]
MATRIZES.append((g, [m("pentagono", 1, "vazio", tam=12), m("hexagono", 1, "vazio", tam=30), m("pentagono", 1, "cheio", tam=30)],
                 "Em cada linha a forma se repete e cresce: pequena, média, grande. Na 3ª linha falta o pentágono grande e vazio."))

# 6) ponto anda pelos cantos no sentido horário
cantos = ("no", "ne", "se", "so")
g = [[dict(ponto=cantos[(i + j) % 4]) for j in range(3)] for i in range(3)]
MATRIZES.append((g, [dict(ponto="se"), dict(ponto="ne"), dict(ponto="so")],
                 "O ponto anda um canto no sentido horário a cada coluna, e cada linha começa um canto adiante. 3ª linha: sudeste, sudoeste, noroeste (canto superior esquerdo)."))
# conferindo a resposta da 6: linha 3 = (2+0)%4=se, (2+1)%4=so, (2+2)%4=no -> "no"

# 7) número de lados aumenta na coluna (3, 4, 5), preenchimento em quadrado latino
fl = [("vazio", "cinza", "cheio"), ("cinza", "cheio", "vazio"), ("cheio", "vazio", "cinza")]
tipos = ("triangulo", "quadrado", "pentagono")
g = [[m(tipos[j], 1, fl[i][j]) for j in range(3)] for i in range(3)]
MATRIZES.append((g, [m("pentagono", 1, "vazio"), m("hexagono", 1, "cinza"), m("quadrado", 1, "cinza")],
                 "Os lados aumentam nas colunas (triângulo, quadrado, pentágono) e cada linha usa os três preenchimentos uma vez. Na 3ª linha falta o cinza: pentágono cinza."))

# 8) soma: 3ª coluna = linhas da 1ª + linhas da 2ª
pares = [(("v",), ("h",)), (("d",), ("e",)), (("v",), ("d",))]
g = [[dict(linhas=a), dict(linhas=b), dict(linhas=tuple(a) + tuple(b))] for a, b in pares]
MATRIZES.append((g, [dict(linhas=("v",)), dict(linhas=("v", "h")), dict(linhas=("v", "d", "e"))],
                 "Em cada linha, a 3ª figura junta as linhas da 1ª e da 2ª. Na 3ª linha: vertical + diagonal."))

# 9) diferença: 3ª coluna = linhas que aparecem em só uma das duas primeiras
trios = [(("v", "h"), ("h", "d")), (("d", "e"), ("e", "v")), (("v", "h", "d"), ("h", "e"))]
def xor(a, b):
    return tuple(sorted(set(a) ^ set(b), key="vhde".index))
g = [[dict(linhas=a), dict(linhas=b), dict(linhas=xor(a, b))] for a, b in trios]
MATRIZES.append((g, [dict(linhas=("v", "h", "d", "e")), dict(linhas=("h",)), dict(linhas=("v", "d"))],
                 "A 3ª figura mostra só as linhas que aparecem em uma das duas primeiras; as que se repetem somem. 3ª linha: V, H, D com H, E → sobram V, D e E."))

# 10) quantidade = soma das duas primeiras, forma da 1ª
g = [[m("circulo", 1, "cheio"), m("circulo", 1, "cheio"), m("circulo", 2, "cheio")],
     [m("quadrado", 1, "cinza"), m("quadrado", 2, "cinza"), m("quadrado", 3, "cinza")],
     [m("triangulo", 2), m("triangulo", 2), m("triangulo", 4)]]
MATRIZES.append((g, [m("triangulo", 3), m("triangulo", 4, "cheio"), m("quadrado", 4)],
                 "Em cada linha, a quantidade da 3ª figura é a soma das duas primeiras, com a mesma forma e o mesmo preenchimento: 2 + 2 = 4 triângulos vazios."))


# ------------------------------------------------------------------ segundo lote (11 a 25)

# 11) forma por coluna, quantidade 3-2-1 por linha
tp = ("circulo", "losango", "hexagono")
g = [[m(tp[j], n) for j in range(3)] for n in (3, 2, 1)]
MATRIZES.append((g, [m("hexagono", 2), m("circulo", 1), m("hexagono", 1, "cheio")],
                 "Cada coluna tem sempre a mesma forma e cada linha a mesma quantidade (3, 2, 1). Na 3ª linha, 3ª coluna: 1 hexágono vazio."))

# 12) seta gira 90° por coluna; linhas começam em 45°, 135°, 225°
g = [[dict(seta=(b + 90 * j) % 360) for j in range(3)] for b in (45, 135, 225)]
MATRIZES.append((g, [dict(seta=225), dict(seta=135), dict(seta=315)],
                 "A seta gira 90° no sentido horário a cada coluna. 3ª linha: 225°, 315° e 45° (diagonal para cima e para a direita)."))

# 13) quantidade em quadrado latino, forma por coluna, preenchimento por linha
cnt = [(1, 2, 3), (2, 3, 1), (3, 1, 2)]
tp = ("quadrado", "circulo", "triangulo")
fl3 = ("vazio", "cinza", "cheio")
g = [[m(tp[j], cnt[i][j], fl3[i]) for j in range(3)] for i in range(3)]
MATRIZES.append((g, [m("triangulo", 3, "cheio"), m("triangulo", 2, "cinza"), m("circulo", 2, "cheio")],
                 "Cada linha usa as quantidades 1, 2 e 3 uma vez; a forma é a da coluna e o preenchimento é o da linha. Falta 2 triângulos pretos."))

# 14) tamanho diminui na coluna, preenchimento por linha
tams2 = (30, 20, 12)
g = [[m("quadrado", 1, f, tam=tams2[j]) for j in range(3)] for f in ("vazio", "cinza", "cheio")]
MATRIZES.append((g, [m("quadrado", 1, "cheio", tam=30), m("quadrado", 1, "cinza", tam=12), m("circulo", 1, "cheio", tam=12)],
                 "Nas colunas o quadrado diminui (grande, médio, pequeno) e cada linha tem um preenchimento. Resposta: quadrado pequeno e preto."))

# 15) ponto anda pelos cantos no sentido ANTI-horário
anti = ("no", "so", "se", "ne")
g = [[dict(ponto=anti[(i + 1 + j) % 4]) for j in range(3)] for i in range(3)]
MATRIZES.append((g, [dict(ponto="se"), dict(ponto="ne"), dict(ponto="no")],
                 "O ponto anda um canto no sentido anti-horário a cada coluna. 3ª linha: nordeste, noroeste e sudoeste (canto inferior esquerdo)."))

# 16) subtração: 3ª = linhas da 1ª menos as da 2ª
sub = [(("v", "h", "d"), ("h",)), (("v", "h", "d", "e"), ("d", "e")), (("h", "d", "e"), ("e",))]
def menos(a, b):
    return tuple(x for x in a if x not in b)
g = [[dict(linhas=a), dict(linhas=b), dict(linhas=menos(a, b))] for a, b in sub]
MATRIZES.append((g, [dict(linhas=("h", "d", "e")), dict(linhas=("e",)), dict(linhas=("h",))],
                 "A 3ª figura é a 1ª sem as linhas da 2ª. 3ª linha: (horizontal, diagonal \\, diagonal /) menos a diagonal / = horizontal e diagonal \\."))

# 17) interseção: 3ª = linhas que aparecem nas duas
inter = [(("v", "h"), ("h", "d")), (("v", "d", "e"), ("v", "e")), (("h", "d", "e"), ("v", "d", "e"))]
def comum(a, b):
    return tuple(x for x in a if x in b)
g = [[dict(linhas=a), dict(linhas=b), dict(linhas=comum(a, b))] for a, b in inter]
MATRIZES.append((g, [dict(linhas=("v", "h")), dict(linhas=("d",)), dict(linhas=("v", "h", "d", "e"))],
                 "A 3ª figura mantém só as linhas que aparecem nas duas primeiras. 3ª linha: as duas diagonais."))

# 18) quantidade da 3ª = 1ª − 2ª
g = [[m("circulo", 3, "cheio"), m("circulo", 1, "cheio"), m("circulo", 2, "cheio")],
     [m("quadrado", 4, "cinza"), m("quadrado", 2, "cinza"), m("quadrado", 2, "cinza")],
     [m("triangulo", 4), m("triangulo", 1), m("triangulo", 3)]]
MATRIZES.append((g, [m("triangulo", 2), m("triangulo", 4), m("triangulo", 3, "cinza")],
                 "Em cada linha, a quantidade da 3ª figura é a da 1ª menos a da 2ª: 4 − 1 = 3 triângulos vazios."))

# 19) forma e preenchimento em quadrado latino
sh = [("hexagono", "losango", "circulo"), ("losango", "circulo", "hexagono"), ("circulo", "hexagono", "losango")]
fi = [("cheio", "vazio", "cinza"), ("vazio", "cinza", "cheio"), ("cinza", "cheio", "vazio")]
g = [[m(sh[i][j], 1, fi[i][j]) for j in range(3)] for i in range(3)]
MATRIZES.append((g, [m("losango", 1, "cheio"), m("hexagono", 1, "vazio"), m("circulo", 1, "vazio")],
                 "Cada linha e cada coluna têm as três formas e os três preenchimentos, sem repetir. Falta o losango vazio."))

# 20) triângulo gira 90° por coluna
g = [[m("triangulo", 1, "cheio", rot=(b + 90 * j) % 360) for j in range(3)] for b in (0, 90, 180)]
MATRIZES.append((g, [m("triangulo", 1, "cheio", rot=180), m("triangulo", 1, "cheio", rot=90), m("triangulo", 1, "cheio", rot=270)],
                 "O triângulo gira 90° no sentido horário a cada coluna. 3ª linha: para baixo, para a esquerda e, por fim, para cima."))

# 21) quantidade pela linha, forma em quadrado latino, preenchimento pela coluna
sh = [("quadrado", "triangulo", "circulo"), ("triangulo", "circulo", "quadrado"), ("circulo", "quadrado", "triangulo")]
fc = ("vazio", "cinza", "cheio")
g = [[m(sh[i][j], i + 1, fc[j]) for j in range(3)] for i in range(3)]
MATRIZES.append((g, [m("triangulo", 2, "cheio"), m("quadrado", 3, "cheio"), m("triangulo", 3)],
                 "A quantidade é a da linha (1, 2, 3), o preenchimento é o da coluna (vazio, cinza, preto) e as formas não se repetem na linha. Resposta: 3 triângulos pretos."))

# 22) seta gira 45° no sentido ANTI-horário
g = [[dict(seta=(b - 45 * j) % 360) for j in range(3)] for b in (0, 90, 180)]
MATRIZES.append((g, [dict(seta=270), dict(seta=225), dict(seta=0)],
                 "A seta gira 45° no sentido anti-horário a cada coluna. 3ª linha: 180°, 135° e 90° (para a direita)."))

# 23) quantidade da 3ª = 1ª × 2ª (cuidado com a soma)
g = [[m("circulo", 1, "cheio"), m("circulo", 2, "cheio"), m("circulo", 2, "cheio")],
     [m("circulo", 2, "cheio"), m("circulo", 2, "cheio"), m("circulo", 4, "cheio")],
     [m("circulo", 1, "cheio"), m("circulo", 3, "cheio"), m("circulo", 3, "cheio")]]
g[2][2] = m("circulo", 3, "cheio")
MATRIZES.append((g, [m("circulo", 4, "cheio"), m("circulo", 2, "cheio"), m("circulo", 3)],
                 "A 3ª figura tem a quantidade da 1ª vezes a da 2ª: 1×2=2, 2×2=4, 1×3=3. Quem somou (1+3=4) caiu na pegadinha: a 1ª linha (1 e 2 dando 2) mostra que não é soma."))

# 24) forma por coluna, tamanho por linha
tp = ("triangulo", "hexagono", "quadrado")
g = [[m(tp[j], 1, "cinza", tam=t) for j in range(3)] for t in (12, 20, 30)]
MATRIZES.append((g, [m("quadrado", 1, "cinza", tam=20), m("hexagono", 1, "cinza", tam=30), m("quadrado", 1, "vazio", tam=30)],
                 "A forma é a da coluna e o tamanho é o da linha (pequeno, médio, grande). Resposta: quadrado grande e cinza."))

# 25) seta alterna entre um sentido e o oposto
g = [[dict(seta=(b + 180 * j) % 360) for j in range(3)] for b in (0, 90, 45)]
MATRIZES.append((g, [dict(seta=225), dict(seta=135), dict(seta=315)],
                 "Em cada linha a seta inverte o sentido a cada coluna (gira 180°) e volta à posição inicial na 3ª. 3ª linha: 45°, 225°, 45°."))


def gerar():
    os.makedirs(PASTA, exist_ok=True)
    qs = []
    for k, (grade, erradas, exp) in enumerate(MATRIZES, 1):
        nome = f"cc-m{k:02d}"
        resposta = grade[2][2]
        assert all(e != resposta for e in erradas), nome
        open(os.path.join(PASTA, f"{nome}.svg"), "w").write(svg_matriz(grade))
        imgs = []
        for i, c in enumerate([resposta] + erradas):
            # nome do arquivo sem pista de qual é a certa
            arq = f"{nome}-" + hashlib.sha256(f"{nome}{i}{c}".encode()).hexdigest()[:8] + ".svg"
            open(os.path.join(PASTA, arq), "w").write(svg_opcao(c))
            imgs.append(f"{URL}/{arq}")
        qs.append({
            "cat": "Matrizes", "enunciado": "Qual figura completa a matriz?", "imagem": f"{URL}/{nome}.svg",
            "certa": "certa", "erradas": ["e1", "e2", "e3"], "imagens_alt": imgs, "explicacao": exp,
        })
    return qs


QUESTOES = gerar()
