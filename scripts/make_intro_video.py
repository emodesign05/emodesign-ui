#!/usr/bin/env python3
"""
コンポーネント紹介動画（縦型 1080×1920）を量産するスクリプト（ffmpeg と Pillow が必要）

Adobe Express で作った「コンポーネント紹介動画-○○-.mp4」と同じ構成で書き出します。
  オープニング 2 秒（グラデ背景＋「Web component」＋ 区分・編名）
  → 各コンポーネント：タイトルカード 約1秒（英語名／線／日本語名）＋ 動画 約1.5秒
  → 最後に黒へフェード

使い方：
  # カテゴリ単位でまとめて作る（6件ずつに分けて 1本ずつ書き出し）
  python3 scripts/make_intro_video.py --category CTA・コンバージョン
  python3 scripts/make_intro_video.py --all              # 全カテゴリ

  # 自分で選んで 1本作る
  python3 scripts/make_intro_video.py --items ContactForm,BookingCalendar,BackToTop \\
      --group 基本 --title "CTA コンバージョン編" --name cta_extra

  オプション：
    --per 6          1本あたりの件数
    --only-new       2026/10/11 以降に追加したもの（componentMeta.ts のコメント以降）だけ
    --palette peach  オープニングの色（peach / violet / mint / sunset / ocean）
    --dry-run        何を作るかだけ表示

  素材の動画は covers-src/<名前>.mp4|.mov（高画質の画面収録）を優先し、
  無ければ public/covers/clips/<名前>.mp4 を使います。
  動画の切り出し位置と速さは --items で「名前@開始秒:倍速」と書くと変えられます
    例）ContactForm@1.2:1.5

出力：Claude outputs/component-intro-videos/component_intro_<名前>_vN.mp4（既存があれば vN を上げる）
"""
import argparse, math, re, subprocess, sys, tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ASSETS = Path(__file__).resolve().parent / 'video-assets'
FONTS = ASSETS / 'fonts'
META_TS = ROOT / 'src' / 'componentMeta.ts'
OUT_DIR = ROOT / 'Claude outputs' / 'component-intro-videos'

W, H, FPS = 1080, 1920, 60
INTRO_SEC, TITLE_SEC, CLIP_SEC, OUTRO_SEC = 2.0, 0.97, 1.47, 0.9

# カテゴリ → オープニングの文言と配色
CATEGORY_INFO = {
    '基本レイアウト': ('基本', 'レイアウト編', 'mint', 'layout'),
    'リッチ・表示': ('基本', 'リッチ表示編', 'ocean', 'rich'),
    'デザイン・装飾': ('基本', 'デザイン編', 'sunset', 'design'),
    'CTA・コンバージョン': ('基本', 'CTA コンバージョン編', 'peach', 'cta'),
    '動き・演出': ('ハイエンド', 'モーション編', 'violet', 'motion'),
    '3D・高度表現': ('ハイエンド', '3D・WebGL編', 'ocean', '3d'),
}

# オープニングのメッシュグラデ（色, 中心x, 中心y, 半径） 座標は 0〜1
PALETTES = {
    'peach': [((246, 196, 160), .5, .0, .55), ((240, 140, 120), .95, .3, .45), ((60, 200, 200), .05, .5, .5),
              ((236, 140, 175), .95, .6, .45), ((180, 190, 205), .5, .85, .45), ((245, 185, 165), .9, 1., .4)],
    'violet': [((200, 120, 230), .5, .0, .6), ((120, 150, 240), .0, .3, .45), ((230, 130, 220), 1., .35, .45),
               ((225, 230, 90), .5, .75, .55), ((240, 220, 120), .2, 1., .45), ((200, 160, 230), 1., .95, .4)],
    'mint': [((150, 230, 200), .5, .0, .6), ((90, 200, 220), .0, .4, .5), ((170, 240, 170), 1., .4, .45),
             ((120, 180, 240), .5, .8, .55), ((210, 240, 200), 1., 1., .45)],
    'sunset': [((250, 200, 120), .5, .0, .6), ((240, 120, 140), 1., .35, .5), ((250, 170, 110), .0, .45, .5),
               ((190, 120, 210), .5, .85, .55), ((250, 190, 170), 0., 1., .45)],
    'ocean': [((110, 170, 250), .5, .0, .6), ((90, 220, 230), 0., .4, .5), ((150, 120, 240), 1., .4, .5),
              ((110, 200, 230), .5, .85, .55), ((190, 170, 250), 1., 1., .45)],
}


# ---------------------------------------------------------------- メタ情報
def load_meta():
    meta, new_from = {}, None
    for i, line in enumerate(META_TS.read_text(encoding='utf-8').splitlines()):
        if '2026/10/11 追加' in line and new_from is None:
            new_from = i
        m = re.match(r"\s*(\w+):\s*\{\s*ja:\s*'([^']*)',\s*en:\s*'([^']*)',\s*category:\s*'([^']*)'(.*)\}", line)
        if m:
            meta[m.group(1)] = dict(ja=m.group(2), en=m.group(3), category=m.group(4),
                                    legacy='legacy: true' in m.group(5), line=i)
    return meta, new_from


def find_clip(name):
    for d, exts in ((ROOT / 'covers-src', ('.mp4', '.mov', '.webm', '.m4v')), (ROOT / 'public' / 'covers' / 'clips', ('.mp4',))):
        for e in exts:
            p = d / f'{name}{e}'
            if p.exists():
                return p
    return None


def duration(p):
    out = subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(p)])
    try:
        return float(out.strip())
    except ValueError:
        return 0.0


# ---------------------------------------------------------------- 文字・画像
def font(file, size, weight=None):
    f = ImageFont.truetype(str(FONTS / file), size)
    if weight:
        try:
            f.set_variation_by_axes([weight])
        except Exception:
            pass
    return f


def jp(size, weight=400):
    return font('NotoSansJP-VariableFont_wght.ttf', size, weight)


def text_center(draw, cx, cy, s, f, fill):
    """テキストを (cx, cy) を中心に描く（見た目の上下中央）"""
    l, t, r, b = draw.textbbox((0, 0), s, font=f)
    draw.text((cx - (l + r) / 2, cy - (t + b) / 2), s, font=f, fill=fill)
    return r - l


def fit_font(file, size, s, max_w, weight=None):
    while size > 10:
        f = font(file, size, weight)
        l, _, r, _ = f.getbbox(s)
        if r - l <= max_w:
            return f
        size -= 2
    return font(file, size, weight)


def title_card(en, ja):
    im = Image.open(ASSETS / 'title_bg.png').convert('RGB')
    d = ImageDraw.Draw(im)
    f_en = fit_font('PathwayGothicOne-Regular.ttf', 76, en, 620)
    d.text((W / 2, 905), en, font=f_en, fill=(12, 12, 12), anchor='ms')  # ベースライン基準
    d.rectangle([220, 938, 859, 939], fill=(10, 10, 10))
    f_ja = jp(46, 400)
    while f_ja.getlength(ja) > 640 and f_ja.size > 24:
        f_ja = jp(f_ja.size - 2, 400)
    d.text((W / 2, 1018), ja, font=f_ja, fill=(12, 12, 12), anchor='ms')
    return im


def mesh(palette, t):
    """低解像度でぼかしたグラデを作って拡大（t: 秒。ゆっくり揺らす）"""
    sw, sh = 54, 96
    im = Image.new('RGB', (sw, sh), palette[0][0])
    px = im.load()
    for y in range(sh):
        for x in range(sw):
            acc, wsum = [0.0, 0.0, 0.0], 0.0
            for i, (c, cx, cy, r) in enumerate(palette):
                cx2 = cx + 0.04 * math.sin(t * 0.9 + i * 1.7)
                cy2 = cy + 0.03 * math.cos(t * 0.7 + i * 2.3)
                dx, dy = x / sw - cx2, (y / sh - cy2) * (sh / sw) * 0.6
                w = math.exp(-(dx * dx + dy * dy) / (r * r * 0.35))
                acc = [acc[k] + c[k] * w for k in range(3)]
                wsum += w
            px[x, y] = tuple(int(a / (wsum + 1e-6)) for a in acc)
    return im.filter(ImageFilter.GaussianBlur(3)).resize((W, H), Image.BICUBIC)


def ease_out(x):
    x = min(max(x, 0.0), 1.0)
    return 1 - (1 - x) ** 3


def intro_frames(palette, group, title):
    f_web = font('FiraSansExtraCondensed-MediumItalic.ttf', 214)
    f_grp, f_ttl = jp(80, 600), jp(78, 600)
    # 「Web component」を一度だけ描いておき、拡大縮小＋透明度で動かす
    logo = Image.new('RGBA', (1000, 560), (0, 0, 0, 0))
    ld = ImageDraw.Draw(logo)
    ld.text((500, 200), 'Web', font=f_web, fill=(255, 255, 255, 255), anchor='ms')
    ld.text((500, 436), 'component', font=f_web, fill=(255, 255, 255, 255), anchor='ms')
    n = int(INTRO_SEC * FPS)
    for i in range(n):
        t = i / FPS
        frame = mesh(palette, t).convert('RGBA')
        p = ease_out(t / 0.8)
        s = 0.62 + 0.38 * p
        lg = logo.resize((int(1000 * s), int(560 * s)), Image.BICUBIC)
        a = lg.getchannel('A').point(lambda v: int(v * (0.35 + 0.65 * p) * 0.97))
        lg.putalpha(a)
        cy = 806 - 40 * (1 - p)
        frame.alpha_composite(lg, (int(W / 2 - lg.width / 2), int(cy - lg.height * 0.62)))
        q = ease_out((t - 0.75) / 0.45)
        if q > 0:
            layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            d = ImageDraw.Draw(layer)
            alpha = int(255 * q)
            gw = d.textlength(group, font=f_grp)
            gap = gw / 2 + 130
            ln = (W / 2 - gap) * q
            d.rectangle([0, 1124, ln, 1125], fill=(255, 255, 255, alpha))
            d.rectangle([W - ln, 1124, W, 1125], fill=(255, 255, 255, alpha))
            dy = 20 * (1 - q)
            d.text((W / 2, 1125 + dy), group, font=f_grp, fill=(255, 255, 255, alpha), anchor='mm')
            ft = f_ttl
            while ft.getlength(title) > 980:
                ft = jp(ft.size - 2, 600)
            d.text((W / 2, 1240 + dy), title, font=ft, fill=(255, 255, 255, alpha), anchor='mm')
            frame.alpha_composite(layer)
        yield frame.convert('RGB')


# ---------------------------------------------------------------- ffmpeg
ENC = ['-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', str(FPS),
       '-video_track_timescale', '15360', '-an']


def write_frames(frames, out):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
                          '-r', str(FPS), '-i', '-', *ENC, str(out)], stdin=subprocess.PIPE)
    for f in frames:
        p.stdin.write(f.tobytes())
    p.stdin.close()
    if p.wait():
        sys.exit(f'ffmpeg failed: {out}')


def still(img, sec, out, tmp):
    png = tmp / (out.stem + '.png')
    img.save(png)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-i', str(png), '-t', f'{sec}', *ENC, str(out)], check=True)


def clip_segment(src, start, speed, sec, out, fade_out=0.0):
    d = duration(src)
    if speed is None:  # 長い動画は早送りして 1.5 秒前後に収める（最大 2.5 倍）
        speed = min(max((d - start) / sec, 1.0), 2.5)
    vf = (f"trim=start={start},setpts=(PTS-STARTPTS)/{speed},fps={FPS},"
          f"scale={W}:-2:flags=lanczos,pad={W}:{H}:0:(oh-ih)/2:white,"
          f"tpad=stop_mode=clone:stop_duration={sec},trim=duration={sec},setsar=1")
    if fade_out:
        vf += f",fade=t=out:st={sec - fade_out}:d={fade_out}"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src), '-vf', vf, *ENC, str(out)], check=True)


def black(sec, out):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', f'color=black:s={W}x{H}:r={FPS}', '-t', f'{sec}',
                    *ENC, str(out)], check=True)


def next_version(stem):
    v = 1
    while (OUT_DIR / f'{stem}_v{v}.mp4').exists():
        v += 1
    return OUT_DIR / f'{stem}_v{v}.mp4'


def build(items, group, title, palette, stem, meta):
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = next_version(stem)
    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        segs = [tmp / '00_intro.mp4']
        print(f'▶ {out.name}  [{group} / {title}]')
        write_frames(intro_frames(PALETTES[palette], group, title), segs[0])
        for i, (name, start, speed) in enumerate(items):
            m, src = meta[name], find_clip(name)
            print(f'   {i + 1}. {m["en"]} / {m["ja"]}  ← {src.relative_to(ROOT)}')
            a, b = tmp / f'{i + 1:02d}a.mp4', tmp / f'{i + 1:02d}b.mp4'
            still(title_card(m['en'], m['ja']), TITLE_SEC, a, tmp)
            last = i == len(items) - 1
            clip_segment(src, start, speed, CLIP_SEC + (0.5 if last else 0), b, fade_out=0.5 if last else 0)
            segs += [a, b]
        segs.append(tmp / '99_black.mp4')
        black(OUTRO_SEC - 0.5, segs[-1])
        lst = tmp / 'list.txt'
        lst.write_text(''.join(f"file '{s}'\n" for s in segs))
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(lst), '-c', 'copy',
                        '-movflags', '+faststart', str(out)], check=True)
    print(f'   → {out.relative_to(ROOT)}  ({duration(out):.1f}s)')
    return out


def parse_item(s):
    m = re.match(r'([^@]+)(?:@([\d.]+)(?::([\d.]+))?)?$', s.strip())
    return m.group(1), float(m.group(2) or 0), (float(m.group(3)) if m.group(3) else None)


def main():
    ap = argparse.ArgumentParser(description='コンポーネント紹介動画を量産する')
    ap.add_argument('--category', action='append', help='componentMeta.ts のカテゴリ名（複数可）')
    ap.add_argument('--all', action='store_true')
    ap.add_argument('--items', help='カンマ区切りのファイル名（名前@開始秒:倍速 も可）')
    ap.add_argument('--group', help='オープニング上段（基本 / ハイエンド）')
    ap.add_argument('--title', help='オープニング下段（例：CTA コンバージョン編）')
    ap.add_argument('--name', help='出力ファイル名に使う英字')
    ap.add_argument('--palette', choices=PALETTES.keys())
    ap.add_argument('--per', type=int, default=6)
    ap.add_argument('--only-new', action='store_true')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    meta, new_from = load_meta()

    jobs = []
    if a.items:
        items = [parse_item(s) for s in a.items.split(',') if s.strip()]
        for n, _, _ in items:
            if n not in meta:
                sys.exit(f'componentMeta.ts に無い名前です: {n}')
            if not find_clip(n):
                sys.exit(f'動画がありません: {n}（covers-src か public/covers/clips に置いてください）')
        cat = meta[items[0][0]]['category']
        g, t, pal, slug = CATEGORY_INFO.get(cat, ('基本', 'コンポーネント編', 'peach', 'custom'))
        jobs.append((items, a.group or g, a.title or t, a.palette or pal, f'component_intro_{a.name or slug}'))
    else:
        cats = list(CATEGORY_INFO) if a.all else (a.category or [])
        if not cats:
            ap.error('--category / --all / --items のどれかを指定してください')
        for cat in cats:
            if cat not in CATEGORY_INFO:
                sys.exit(f'カテゴリ名が違います: {cat}（{", ".join(CATEGORY_INFO)}）')
            names = [n for n, m in meta.items() if m['category'] == cat and not m['legacy']
                     and (not a.only_new or (new_from is not None and m['line'] > new_from))]
            missing = [n for n in names if not find_clip(n)]
            if missing:
                print(f'⚠ 動画が無いのでスキップ: {", ".join(missing)}')
            names = [n for n in names if n not in missing]
            chunks = [names[i:i + a.per] for i in range(0, len(names), a.per)]
            g, t, pal, slug = CATEGORY_INFO[cat]
            for ci, ch in enumerate(chunks):
                tt = a.title or t
                if len(chunks) > 1:
                    tt = tt.replace('編', f'{"１２３４５６７８９"[ci]}編') if ci < 9 else f'{tt}{ci + 1}'
                jobs.append(([(n, 0.0, None) for n in ch], a.group or g, tt, a.palette or pal,
                             f'component_intro_{a.name or slug}{"_new" if a.only_new else ""}_{ci + 1}'))

    for items, g, t, pal, stem in jobs:
        if a.dry_run:
            print(f'{stem}: [{g} / {t}] ' + ', '.join(n for n, _, _ in items))
        else:
            build(items, g, t, pal, stem, meta)


if __name__ == '__main__':
    main()
