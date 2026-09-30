# playgrounds（パラメータ切り替えデモの定義）

`src/playgrounds/<コンポーネントのファイル名>.tsx` を置くと、一覧の該当カードに「調整可」が付き、
プレビュー画面が「左：プレビュー / 右：コントロールパネル」になります（ファイルが無いコンポーネントは従来の全画面プレビュー）。

## 追加のしかた（3ステップ）

1. コンポーネント側で、調整したい部品を `export` する（例: `export function MagneticButton(...)`）。
   調整したい値は props で受け取れる形にしておく（文字列・数値・真偽値・選択肢）。
2. `src/playgrounds/<ファイル名>.tsx` を作り、`definePlayground` でコントロールと表示内容を書く。
3. ブラウザで `#/<ファイル名>` を開いて確認する。

```tsx
import { MagneticButton } from '../components/MagneticHoverButton';
import { definePlayground } from '../playground/types';

type V = { strength: number; variant: 'solid' | 'outline' };

export default definePlayground<V>({
  controls: [
    // key は props 名。Notion のパラメータ表と同じ名前にしておく
    { key: 'strength', label: '吸着量', type: 'range', min: 0, max: 1, step: 0.05, default: 0.35 },
    { key: 'variant', label: '形', type: 'select', default: 'solid', options: [
      { value: 'solid', label: '塗り' }, { value: 'outline', label: '枠線' },
    ] },
  ],
  render: (v) => <MagneticButton strength={v.strength} variant={v.variant}>Button</MagneticButton>,
});
```

コントロールの種類: `range`（スライダー）/ `select`（選択肢。4つ以下はボタン、5つ以上はプルダウン）/ `toggle` / `text`（`multiline` で複数行）/ `color`

## オプション

- `remountOnChange: true` … 値を変えるたびに最初から再生し直す（「表示された時に1回だけ動く」系のアニメーション向け）
- `note: '...'` … パネル上部の一言メモ

## URLでパラメータを指定する

`#/MagneticHoverButton?strength=0.8&variant=outline` のように、既定値と違う値だけがURLに入ります。
Notionのパラメータ表の各行から、この設定済みリンクを貼れます。
`#/embed/<ファイル名>?...` はプレビューだけ（パネルなし）の表示です。

## Tailwind の注意

クラス名は文字列として書かれていないと生成されません。`aspect-[4/5]` のようなクラスを値から組み立てず、
`{ portrait: 'aspect-[4/5]', square: 'aspect-square' }` のように対応表にして書いてください。
