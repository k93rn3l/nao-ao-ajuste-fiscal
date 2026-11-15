#!/usr/bin/env python3
"""Gera áudios pt-BR com Kokoro e sincroniza as cenas do site.

Uso: python3 scripts/gerar_narracoes.py --voz pf_dora
Requer: kokoro>=0.9.4, soundfile, espeakng-loader e Node.js.
Se ffmpeg estiver disponível, converte WAV para MP3.
"""

import argparse
import json
import shutil
import subprocess
from pathlib import Path


RAIZ = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--voz", choices=("pf_dora", "pm_alex", "pm_santa"), default="pf_dora")
    parser.add_argument("--velocidade", type=float, default=1.0)
    args = parser.parse_args()
    if not shutil.which("node"):
        parser.error("Node.js é necessário")
    if not 0.8 <= args.velocidade <= 1.2:
        parser.error("A velocidade deve ficar entre 0,8 e 1,2")

    import numpy as np
    import soundfile as sf
    from kokoro import KPipeline

    roteiros = json.loads(subprocess.check_output(
        ["node", str(RAIZ / "scripts" / "exportar_roteiros.js")], text=True
    ))
    pipeline = KPipeline(lang_code="p", repo_id="hexgrad/Kokoro-82M")
    saida = RAIZ / "assets" / "audio"
    saida.mkdir(parents=True, exist_ok=True)
    manifesto = {}
    amostragem = 24000

    for medida, textos in roteiros.items():
        partes = []
        marcos = [0.0]
        total_amostras = 0
        for indice, texto in enumerate(textos):
            fragmentos = [np.asarray(audio, dtype=np.float32) for _, _, audio in
                          pipeline(texto, voice=args.voz, speed=args.velocidade)]
            if not fragmentos:
                raise RuntimeError(f"Kokoro não gerou áudio para {medida}, cena {indice + 1}")
            fala = np.concatenate(fragmentos)
            partes.append(fala)
            total_amostras += len(fala)
            if indice < len(textos) - 1:
                pausa = np.zeros(round(amostragem * 0.35), dtype=np.float32)
                partes.append(pausa)
                total_amostras += len(pausa)
            marcos.append(round(total_amostras / amostragem, 3))

        wav = saida / f"{medida}.wav"
        faixa = np.concatenate(partes)
        pico = float(np.max(np.abs(faixa)))
        if pico > 0:
            faixa = faixa * (0.9 / pico)
        sf.write(wav, faixa, amostragem, subtype="PCM_16")
        arquivo = wav
        if shutil.which("ffmpeg"):
            mp3 = saida / f"{medida}.mp3"
            subprocess.run([
                "ffmpeg", "-y", "-loglevel", "error", "-i", str(wav),
                "-codec:a", "libmp3lame", "-qscale:a", "4", str(mp3)
            ], check=True)
            wav.unlink()
            arquivo = mp3
        manifesto[medida] = {"src": f"assets/audio/{arquivo.name}", "marcos": marcos}
        print(f"{medida}: {marcos[-1]:.1f}s", flush=True)

    (RAIZ / "js" / "audios.js").write_text(
        "// Áudios gerados com Kokoro. Marco inicial de cada cena e fim do áudio.\n"
        + "window.AUDIOS_MEDIDAS = " + json.dumps(manifesto, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8"
    )


if __name__ == "__main__":
    main()
