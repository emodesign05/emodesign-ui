#!/usr/bin/env python3
"""
一覧カード用カバーを作るスクリプト（ffmpeg が必要）

使い方：
  1. covers-src/ に画面収録を「コンポーネントのファイル名」で置く
     例）covers-src/TiltCard3D.mov ／ covers-src/BentoGrid.gif（.mov .mp4 .webm .gif に対応）
  2. python3 scripts/make_covers.py
     → public/covers/thumbs/<名前>.webp（静止画）と public/covers/clips/<名前>.mp4（短い動画）を作成
     → src/coverManifest.ts（カバーがあるコンポーネントの一覧）を更新
  - 長い動画は 5 秒に収まるよう早送りします（--max 秒数 で変更）
  - 静止画は動画の途中（55% の位置）から取ります。名前の後に @0.8 のように書くと位置を変えられます
    例）covers-src/FlipFilterGrid@0.95.mov
  - すでに作成済みのものは、元ファイルが新しい時だけ作り直します（--force で全部作り直し）
"""
import argparse, json, os, re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'covers-src'
OUT = ROOT / 'public' / 'covers'
THUMBS, CLIPS = OUT / 'thumbs', OUT / 'clips'
MANIFEST = ROOT / 'src' / 'coverManifest.ts'
EXTS = {'.mov', '.mp4', '.webm', '.gif', '.m4v'}


def duration(p: Path) -> float:
    out = subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(p)])
    try:
        return float(out.strip())
    except ValueError:
        return 0.0


def build(src: Path, name: str, pos: float, max_len: float):
    THUMBS.mkdir(parents=True, exist_ok=True)
    CLIPS.mkdir(parents=True, exist_ok=True)
    clip, thumb = CLIPS / f'{name}.mp4', THUMBS / f'{name}.webp'
    d = duration(src) or max_len
    speed = max(1.0, d / max_len)
    # 16:10 に中央で切り抜いてから 640x400 に縮小
    vf = (f'setpts=PTS/{speed:.3f},fps=24,'
          "crop='min(iw,ih*16/10)':'min(ih,iw*10/16)',scale=640:400:flags=lanczos")
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(src), '-vf', vf, '-an',
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p',
                    '-movflags', '+faststart', str(clip)], check=True)
    cd = duration(clip)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{cd * pos:.2f}', '-i', str(clip),
                    '-frames:v', '1', '-c:v', 'libwebp', '-quality', '78', str(thumb)], check=True)
    print(f'  {name}: {d:.1f}s → {cd:.1f}s（x{speed:.2f}）  {clip.stat().st_size // 1024}KB / {thumb.stat().st_size // 1024}KB')


def write_manifest():
    names = sorted(p.stem for p in THUMBS.glob('*.webp') if (CLIPS / f'{p.stem}.mp4').exists()) if THUMBS.exists() else []
    body = ',\n'.join(f'  {json.dumps(n)}' for n in names)
    MANIFEST.write_text(
        '// scripts/make_covers.py が自動生成（手で編集しない）\n'
        '// public/covers/thumbs と public/covers/clips の両方が揃っているコンポーネント名\n'
        f'export const COVER_NAMES = new Set<string>([\n{body}{"," if names else ""}\n]);\n',
        encoding='utf-8')
    print(f'src/coverManifest.ts を更新（{len(names)} 件）')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--force', action='store_true')
    ap.add_argument('--max', type=float, default=5.0)
    a = ap.parse_args()
    if SRC.exists():
        comps = {p.stem for p in (ROOT / 'src' / 'components').glob('*.tsx')}
        for src in sorted(SRC.iterdir()):
            if src.suffix.lower() not in EXTS:
                continue
            m = re.match(r'^(.+?)(?:@([0-9.]+))?$', src.stem)
            name, pos = m.group(1), float(m.group(2) or 0.55)
            if name not in comps:
                print(f'  ! {src.name}：src/components/{name}.tsx が無いのでスキップ', file=sys.stderr)
                continue
            clip = CLIPS / f'{name}.mp4'
            if not a.force and clip.exists() and clip.stat().st_mtime >= src.stat().st_mtime:
                continue
            build(src, name, pos, a.max)
    write_manifest()


if __name__ == '__main__':
    main()
