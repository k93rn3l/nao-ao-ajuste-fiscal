# -*- coding: utf-8 -*-
"""
Gera js/data.js com a lista atualizada de senadores e deputados
(e-mails públicos oficiais) a partir das APIs de dados abertos.

Uso:  python scripts/gerar_dados.py
Requer conexão com a internet.
"""
import json
import re
import unicodedata
import urllib.request
from datetime import date
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ARQ_SAIDA = RAIZ / "js" / "data.js"

URL_CAMARA = "https://dadosabertos.camara.leg.br/api/v2/deputados?itens=600&ordem=ASC&ordenarPor=nome"
URL_SENADO = "https://legis.senado.leg.br/dadosabertos/senador/lista/atual.json"

HEADERS = {"Accept": "application/json", "User-Agent": "nao-ao-ajuste-fiscal/1.0"}


def baixar(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))


def deputados():
    doc = baixar(URL_CAMARA)
    saida = []
    for d in doc["dados"]:
        email = (d.get("email") or "").strip()
        if not email:
            continue
        saida.append(
            {
                "id": str(d["id"]),
                "nome": d["nome"].strip(),
                "partido": (d.get("siglaPartido") or "S/Partido").strip(),
                "uf": (d.get("siglaUf") or "").strip(),
                "email": email,
                "foto": d.get("urlFoto", ""),
                "casa": "camara",
            }
        )
    return saida


def email_padrao(nome_parlamentar):
    """Gera o e-mail pelo padrão do Senado: sen.<nome sem espaços/acentos>@senado.leg.br"""
    sem_acento = unicodedata.normalize("NFKD", nome_parlamentar)
    sem_acento = "".join(c for c in sem_acento if not unicodedata.combining(c))
    limpo = re.sub(r"[^a-zA-Z0-9]", "", sem_acento).lower()
    return f"sen.{limpo}@senado.leg.br"


def senadores():
    doc = baixar(URL_SENADO)["ListaParlamentarEmExercicio"]["Parlamentares"]["Parlamentar"]
    saida = []
    for p in doc:
        ident = p["IdentificacaoParlamentar"]
        email = (ident.get("EmailParlamentar") or "").strip()
        # Senadores empossados há pouco às vezes ainda não têm e-mail publicado
        # na API; usa o padrão oficial do Senado como fallback.
        if not email:
            email = email_padrao(ident["NomeParlamentar"].strip())
        foto = ident.get("UrlFotoParlamentar", "").replace("http://", "https://")
        saida.append(
            {
                "id": ident["CodigoParlamentar"],
                "nome": ident["NomeParlamentar"].strip(),
                "partido": (ident.get("SiglaPartidoParlamentar") or "S/Partido").strip(),
                "uf": (ident.get("UfParlamentar") or "").strip(),
                "email": email,
                "foto": foto,
                "casa": "senado",
            }
        )
    return saida


def main():
    cam = deputados()
    sen = senadores()
    ARQ_SAIDA.parent.mkdir(parents=True, exist_ok=True)
    dados = {
        "geradoEm": date.today().isoformat(),
        "fontes": [
            "https://dadosabertos.camara.leg.br/api/v2/deputados",
            "https://legis.senado.leg.br/dadosabertos/senador/lista/atual.json",
        ],
        "camara": cam,
        "senado": sen,
    }
    corpo = json.dumps(dados, ensure_ascii=False, separators=(",", ":"))
    ARQ_SAIDA.write_text(
        "// Gerado automaticamente por scripts/gerar_dados.py (não editar à mão).\n"
        "// Fontes: APIs de dados abertos da Câmara dos Deputados e do Senado Federal.\n"
        "window.DADOS = " + corpo + ";\n",
        encoding="utf-8",
    )
    print(f"OK: {len(sen)} senadores e {len(cam)} deputados -> {ARQ_SAIDA}")


if __name__ == "__main__":
    main()
