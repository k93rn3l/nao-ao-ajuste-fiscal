#!/usr/bin/env python3
"""Renderiza vídeos verticais com legendas e narração embutida.

Uso: python3 scripts/render_videos.py --timings assets/videos/timings.json
Requer Pillow, CairoSVG e ffmpeg no PATH (ou FFMPEG_BIN).
"""

import argparse
import io
import json
import math
import os
import shutil
import subprocess
from pathlib import Path

import cairosvg
from PIL import Image, ImageDraw, ImageFont


RAIZ = Path(__file__).resolve().parents[1]
W, H = 720, 1280
FONTE_REGULAR = "/mnt/c/Windows/Fonts/arial.ttf"
FONTE_NEGRITO = "/mnt/c/Windows/Fonts/arialbd.ttf"
if not Path(FONTE_REGULAR).exists():
    FONTE_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    FONTE_NEGRITO = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
CORES = {
    "branco": (244, 248, 255), "medio": (174, 190, 211), "fundo": (13, 20, 34),
    "painel": (26, 40, 60), "borda": (62, 84, 111), "amarelo": (255, 209, 102),
    "azul": (98, 178, 249), "verde": (81, 219, 150), "vermelho": (239, 106, 115),
}


def fonte(tamanho, negrito=False):
    return ImageFont.truetype(FONTE_NEGRITO if negrito else FONTE_REGULAR, tamanho)


def ajustar_linhas(draw, texto, largura, tamanho=48, minimo=26, max_linhas=None, negrito=True):
    while tamanho >= minimo:
        f = fonte(tamanho, negrito)
        linhas, atual = [], ""
        for palavra in texto.split():
            candidato = (atual + " " + palavra).strip()
            if draw.textlength(candidato, font=f) <= largura:
                atual = candidato
            else:
                if atual:
                    linhas.append(atual)
                atual = palavra
        if atual:
            linhas.append(atual)
        if max_linhas is None or len(linhas) <= max_linhas:
            return linhas, f
        tamanho -= 2
    return linhas, f


def base():
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    for y in range(H):
        p = y / H
        d.line((0, y, W, y), fill=(int(13 + 9 * p), int(22 + 9 * p), int(38 + 10 * p)))
    for y in range(80, H - 70, 46):
        for x in range(34, W, 46):
            d.ellipse((x, y, x + 2, y + 2), fill=(45, 61, 80))
    d.rounded_rectangle((25, 32, W - 25, H - 28), radius=36, outline=(48, 68, 93), width=2)
    return img


def carregar_icone(nome):
    arquivo = RAIZ / "assets" / "video-icons" / f"{nome}.svg"
    dados = cairosvg.svg2png(url=str(arquivo), output_width=116, output_height=116)
    return Image.open(io.BytesIO(dados)).convert("RGBA")


def cor(nome):
    return CORES.get(nome, CORES["azul"])


def ease(p):
    p = max(0, min(1, p))
    return 1 - (1 - p) ** 3


def desenhar_visual(d, visual, progresso):
    tipo = visual["tipo"]
    p = ease(progresso)
    if tipo in ("fluxo", "cartoes"):
        itens = visual["itens"]
        altura = 112 if len(itens) == 3 else 142
        espaco = 20
        inicio = 410 if len(itens) == 3 else 455
        for i, (rotulo, valor) in enumerate(itens):
            entrada = ease(min(1, max(0, p * len(itens) - i)))
            y = inicio + i * (altura + espaco) + int((1 - entrada) * 16)
            painel = tuple(int(CORES["fundo"][j] * (1 - entrada) + CORES["painel"][j] * entrada) for j in range(3))
            d.rounded_rectangle((58, y, 662, y + altura), radius=22, fill=painel, outline=CORES["borda"], width=2)
            if rotulo and all(ord(c) < 10000 for c in rotulo):
                d.text((84, y + 18), rotulo, font=fonte(27), fill=CORES["medio"])
                d.text((84, y + 54), valor, font=fonte(38, True), fill=CORES["branco"])
            else:
                d.text((84, y + 32), f"{i + 1:02d}", font=fonte(30, True), fill=CORES["amarelo"])
                d.text((150, y + 32), valor, font=fonte(35, True), fill=CORES["branco"])
            if tipo == "fluxo" and i < len(itens) - 1:
                d.polygon([(341, y + altura + 4), (363, y + altura + 4), (352, y + altura + 17)], fill=CORES["amarelo"])
    elif tipo == "barras":
        for i, (rotulo, valor, largura, cor_nome) in enumerate(visual["itens"]):
            y = 435 + i * 166
            d.text((65, y), rotulo, font=fonte(31, True), fill=CORES["branco"])
            vb = d.textbbox((0, 0), valor, font=fonte(31, True))
            d.text((655 - (vb[2] - vb[0]), y), valor, font=fonte(31, True), fill=cor(cor_nome))
            d.rounded_rectangle((65, y + 59, 655, y + 113), radius=27, fill=(38, 54, 73))
            tamanho = max(4, int(590 * largura / 100 * p))
            d.rounded_rectangle((65, y + 59, 65 + tamanho, y + 113), radius=min(27, tamanho // 2), fill=cor(cor_nome))
    elif tipo == "numero":
        texto = visual["valor"]
        linhas, f = ajustar_linhas(d, texto, 610, 88, 56, 2)
        h_linha = f.size + 4
        y = 510 - len(linhas) * h_linha // 2
        for linha in linhas:
            largura = d.textlength(linha, font=f)
            d.text(((W - largura) / 2, y), linha, font=f, fill=CORES["amarelo"])
            y += h_linha
        linhas2, f2 = ajustar_linhas(d, visual["rotulo"], 620, 36, 28, 3)
        y = max(610, y + 30)
        for linha in linhas2:
            largura = d.textlength(linha, font=f2)
            d.text(((W - largura) / 2, y), linha, font=f2, fill=CORES["branco"])
            y += f2.size + 7
        if visual.get("nota"):
            linhas3, f3 = ajustar_linhas(d, visual["nota"], 600, 28, 23, 2, False)
            y = 795 - len(linhas3) * 34
            for linha in linhas3:
                largura = d.textlength(linha, font=f3)
                d.text(((W - largura) / 2, y), linha, font=f3, fill=CORES["medio"])
                y += 34
    elif tipo == "moedas":
        for i in range(10):
            x = 80 + (i % 5) * 120
            y = 440 + (i // 5) * 140
            retirado = i >= 10 - visual["retiradas"] and p > 0.45
            fill = CORES["vermelho"] if retirado else CORES["amarelo"]
            d.ellipse((x, y, x + 91, y + 91), fill=fill, outline=(255, 235, 176), width=3)
            d.text((x + 25, y + 27), "R$", font=fonte(31, True), fill=(54, 39, 16))
            if retirado:
                d.line((x + 15, y + 72, x + 77, y + 20), fill=CORES["fundo"], width=6)
        label = visual["rotulo"]
        largura = d.textlength(label, font=fonte(35, True))
        d.text(((W - largura) / 2, 750), label, font=fonte(35, True), fill=CORES["amarelo"])
    elif tipo == "regua":
        d.rounded_rectangle((73, 520, 647, 570), radius=25, fill=(44, 66, 90))
        d.rounded_rectangle((73, 520, 647, 570), radius=25, outline=CORES["verde"], width=3)
        for i, (valor, nome) in enumerate(visual["itens"]):
            x = 76 + i * 282
            d.line((x, 510, x, 580), fill=CORES["medio"], width=3)
            d.text((x - 28 if i else x, 603), valor, font=fonte(28, True), fill=CORES["branco"])
            d.text((x - 26 if i else x, 641), nome, font=fonte(24), fill=CORES["medio"])
        x = 83 + int(visual["marcador"] / 100 * 554 * p)
        d.polygon([(x - 19, 491), (x + 19, 491), (x, 519)], fill=CORES["amarelo"])
        texto = visual.get("marcadorTexto", "")
        largura = d.textlength(texto, font=fonte(33, True))
        d.text((max(72, min(648 - largura, x - largura / 2)), 443), texto, font=fonte(33, True), fill=CORES["amarelo"])


def quadro(base_img, icon, medida, cena, etapa, total, progresso, tempo_atual, duracao):
    img = base_img.copy()
    d = ImageDraw.Draw(img)
    for i in range(total):
        x1 = 48 + i * (624 / total)
        x2 = 40 + (i + 1) * (624 / total)
        d.rounded_rectangle((x1, 56, x2, 64), radius=4, fill=(46, 65, 87))
        if i < etapa:
            d.rounded_rectangle((x1, 56, x2, 64), radius=4, fill=CORES["amarelo"])
        elif i == etapa and progresso > 0:
            d.rounded_rectangle((x1, 56, x1 + (x2 - x1) * progresso, 64), radius=4, fill=CORES["amarelo"])
    img.paste(icon, (56, 110), icon)
    d.text((195, 112), "PLP 299/2026  •  TEXTO-BASE DO SENADO", font=fonte(22, True), fill=CORES["amarelo"])
    linhas, f = ajustar_linhas(d, medida["title"], 460, 39, 27, 2)
    y = 147
    for linha in linhas:
        d.text((195, y), linha, font=f, fill=CORES["medio"])
        y += f.size + 3
    d.text((56, 260), f"{etapa + 1:02d} / {total:02d}", font=fonte(25, True), fill=CORES["amarelo"])
    linhas, f = ajustar_linhas(d, cena["titulo"], 620, 54, 38, 2)
    y = 300
    for linha in linhas:
        d.text((56, y), linha, font=f, fill=CORES["branco"])
        y += f.size + 6
    desenhar_visual(d, cena["visual"], progresso)
    d.rounded_rectangle((39, 884, 681, 1183), radius=26, fill=(19, 34, 54), outline=CORES["borda"], width=2)
    d.text((66, 905), "EXPLICAÇÃO", font=fonte(21, True), fill=CORES["amarelo"])
    linhas, f = ajustar_linhas(d, cena["fala"], 583, 31, 23, 6, False)
    y = 949
    for linha in linhas:
        d.text((66, y), linha, font=f, fill=CORES["branco"])
        y += f.size + 9
    d.text((53, 1211), "Fonte e texto completo disponíveis no site", font=fonte(22), fill=CORES["medio"])
    tempo = f"{int(tempo_atual // 60):01d}:{int(tempo_atual % 60):02d} / {int(duracao // 60):01d}:{int(duracao % 60):02d}"
    largura = d.textlength(tempo, font=fonte(22))
    d.text((667 - largura, 1211), tempo, font=fonte(22), fill=CORES["medio"])
    return img


def ffmpeg_path(caminho, binario):
    if binario.lower().endswith(".exe") and os.name != "nt":
        return subprocess.check_output(["wslpath", "-w", str(caminho.resolve())], text=True).strip()
    return str(caminho.resolve())


def timecode(segundos):
    ms = round(segundos * 1000)
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d}.{ms % 1000:03d}"


def renderizar(id_medida, medida, tempos, fps, ffmpeg):
    marcas = tempos["marcos"]
    cenas = medida["scenes"]
    if len(marcas) != len(cenas) + 1:
        raise ValueError(f"Marcos inválidos para {id_medida}")
    audio = RAIZ / tempos["src"]
    if not audio.is_file():
        raise FileNotFoundError(audio)
    saida = RAIZ / "assets" / "videos"
    saida.mkdir(parents=True, exist_ok=True)
    video = saida / f"{id_medida}.mp4"
    poster = saida / f"{id_medida}.jpg"
    legenda = saida / f"{id_medida}.vtt"
    icon = carregar_icone(medida["icon"])
    fundo = base()
    duracao = marcas[-1]

    poster_img = quadro(fundo, icon, medida, cenas[0], 0, len(cenas), .8, 1, duracao)
    poster_img.save(poster, quality=88, optimize=True)
    with legenda.open("w", encoding="utf-8") as arq:
        arq.write("WEBVTT\n\n")
        for i, cena in enumerate(cenas):
            arq.write(f"{timecode(marcas[i])} --> {timecode(marcas[i + 1])}\n{cena['fala']}\n\n")

    comando = [ffmpeg, "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
               "-s", f"{W}x{H}", "-r", str(fps), "-i", "pipe:0", "-i", ffmpeg_path(audio, ffmpeg),
               "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p",
               "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", "-shortest",
               ffmpeg_path(video, ffmpeg)]
    total_quadros = math.ceil(duracao * fps)
    processo = subprocess.Popen(comando, stdin=subprocess.PIPE)
    try:
        for n in range(total_quadros):
            t = min(duracao - .001, n / fps)
            etapa = max(0, min(len(cenas) - 1, next((i for i in range(len(cenas)) if t < marcas[i + 1]), len(cenas) - 1)))
            progresso = (t - marcas[etapa]) / max(.01, marcas[etapa + 1] - marcas[etapa])
            img = quadro(fundo, icon, medida, cenas[etapa], etapa, len(cenas), progresso, t, duracao)
            processo.stdin.write(img.tobytes())
        processo.stdin.close()
        if processo.wait() != 0:
            raise RuntimeError(f"ffmpeg falhou ao gerar {video}")
    except Exception:
        processo.kill()
        processo.wait()
        raise
    print(f"{id_medida}: {duracao:.1f}s, {video.stat().st_size / 1048576:.1f} MiB", flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--timings", type=Path, required=True)
    parser.add_argument("--fps", type=int, default=20)
    parser.add_argument("--only", nargs="*", help="IDs das medidas a renderizar")
    args = parser.parse_args()
    if not 10 <= args.fps <= 30:
        parser.error("FPS precisa ficar entre 10 e 30")
    storyboard = json.loads((RAIZ / "scripts" / "storyboard.json").read_text(encoding="utf-8"))["measures"]
    timings = json.loads(args.timings.read_text(encoding="utf-8"))
    ffmpeg = os.environ.get("FFMPEG_BIN") or shutil.which("ffmpeg") or shutil.which("ffmpeg.exe")
    if not ffmpeg:
        candidato = Path("/mnt/c/Users/Angelo/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe")
        ffmpeg = str(candidato) if candidato.exists() else None
    if not ffmpeg:
        parser.error("ffmpeg não encontrado; defina FFMPEG_BIN")
    for id_medida, medida in storyboard.items():
        if args.only and id_medida not in args.only:
            continue
        renderizar(id_medida, medida, timings[id_medida], args.fps, ffmpeg)


if __name__ == "__main__":
    main()
