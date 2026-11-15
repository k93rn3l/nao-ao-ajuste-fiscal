#!/usr/bin/env python3
"""Gera uma narração Chatterbox por medida e os tempos de cada cena.

Os WAVs intermediários ficam em build/video-audio; o site publica só os MP4s.
Requer chatterbox-tts, numpy e soundfile. Execute antes de render_videos.py.
"""

import argparse
import json
from pathlib import Path

import numpy as np
import soundfile as sf
import torch
from chatterbox.mtl_tts import ChatterboxMultilingualTTS


RAIZ = Path(__file__).resolve().parents[1]
DESTINO = RAIZ / "build" / "video-audio"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--only", nargs="*", help="IDs das medidas a gerar")
    args = parser.parse_args()
    medidas = json.loads((RAIZ / "scripts" / "storyboard.json").read_text(encoding="utf-8"))["measures"]
    DESTINO.mkdir(parents=True, exist_ok=True)
    manifesto = DESTINO / "timings.json"
    tempos = json.loads(manifesto.read_text(encoding="utf-8")) if manifesto.exists() else {}

    torch.set_num_threads(4)
    print("Carregando Chatterbox Multilingual com voz padrão...", flush=True)
    modelo = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
    sr = modelo.sr
    silencio = np.zeros(round(.45 * sr), dtype=np.float32)
    prefixo = np.zeros(round(.18 * sr), dtype=np.float32)
    for id_medida, medida in medidas.items():
        if args.only and id_medida not in args.only:
            continue
        partes = [prefixo]
        marcos = [0.0]
        total_amostras = len(prefixo)
        for i, cena in enumerate(medida["scenes"]):
            print(f"{id_medida}: voz {i + 1}/{len(medida['scenes'])}", flush=True)
            fala = modelo.generate(cena["fala"], language_id="pt")
            pcm = fala.squeeze().detach().cpu().numpy().astype(np.float32)
            if pcm.ndim != 1 or len(pcm) < sr // 2:
                raise RuntimeError(f"Áudio inválido na cena {i + 1} de {id_medida}")
            partes.extend([pcm, silencio])
            total_amostras += len(pcm) + len(silencio)
            marcos.append(total_amostras / sr)
        audio = np.concatenate(partes)
        pico = float(np.max(np.abs(audio)))
        if pico > 0:
            audio = audio * (min(.96 / pico, 2.0))
        wav = DESTINO / f"{id_medida}.wav"
        sf.write(wav, audio, sr, subtype="PCM_16")
        tempos[id_medida] = {"src": str(wav.relative_to(RAIZ)), "marcos": marcos}
        manifesto.write_text(json.dumps(tempos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{id_medida}: {marcos[-1]:.1f}s gravados", flush=True)


if __name__ == "__main__":
    main()
