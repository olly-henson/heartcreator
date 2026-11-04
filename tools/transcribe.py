"""Transcribe Reel videos locally (free, nothing uploaded).

Usage: python tools/transcribe.py "marketing/reel-stats/videos"
Writes <video>.txt next to each video and skips ones already done.
"""
import sys, pathlib, subprocess
import numpy as np
from faster_whisper import WhisperModel

folder = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "marketing/reel-stats/videos")
videos = [p for p in sorted(folder.iterdir()) if p.suffix.lower() in (".mp4", ".mov", ".m4v", ".webm", ".m4a", ".mp3")]
model = WhisperModel("small.en", device="cpu", compute_type="int8")
for v in videos:
    out = v.with_suffix(".txt")
    if out.exists():
        continue
    # decode with ffmpeg (faster-whisper's own decoder breaks on newer PyAV)
    pcm = subprocess.run(["ffmpeg", "-nostdin", "-i", str(v), "-f", "s16le", "-ac", "1", "-ar", "16000", "-"],
                         capture_output=True, check=True).stdout
    audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0
    segments, _ = model.transcribe(audio, vad_filter=True)
    text = " ".join(s.text.strip() for s in segments)
    out.write_text(text, encoding="utf-8")
    print("done:", v.name, len(text.split()), "words")
