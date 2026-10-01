# EMODESIGN UI Components

Web サイトでよく使う UI パーツと、スクロール・ホバー・3D などの「動き」のコンポーネントを集めたカタログです。
すべて **React + TypeScript + Tailwind CSS** の 1 ファイル完結で、コピーしてすぐに使えます。

- **デモ**：https://ui.emodesign.jp/
  各コンポーネントの右側のパネルで値を動かして試せます。「コード」タブからソースをコピーできます。
- **コード**：[`src/components/`](./src/components)（1 コンポーネント = 1 ファイル）

## 使い方

1. 使いたいコンポーネントのファイル（例：`src/components/MagicScroll.tsx`）を自分のプロジェクトにコピー
2. ファイル先頭の `import` を見て、必要なライブラリをインストール
3. ファイル内の `export function 〜` をページで使う（`export default function App()` は動作確認用のデモ）

### 使っているライブラリ

| ライブラリ | 主な用途 | インストール |
|---|---|---|
| Tailwind CSS v4 | スタイル | [公式ガイド](https://tailwindcss.com/docs/installation) |
| lucide-react | アイコン | `npm i lucide-react` |
| framer-motion | ホバー・開閉などの動き | `npm i framer-motion` |
| GSAP | スクロール演出（ScrollTrigger / SplitText / Flip など） | `npm i gsap @gsap/react` |
| Lenis | スムーススクロール | `npm i lenis` |
| three / React Three Fiber | 3D・WebGL | `npm i three @react-three/fiber @react-three/drei` |
| Spline | Spline の 3D シーン埋め込み | `npm i @splinetool/react-spline @splinetool/runtime` |

まとめて入れる場合：

```bash
npm i lucide-react framer-motion gsap @gsap/react lenis three @react-three/fiber @react-three/drei @splinetool/react-spline @splinetool/runtime
```

## このカタログを手元で動かす

```bash
npm install
npm run dev
```

## ライセンス

[MIT No Attribution](./LICENSE)（MIT-0）です。商用・非商用を問わず、改変も再配布も自由に使えます。
クレジット表記は必須ではありません。でも「EMODESIGN のを使ったよ」と書いてもらえたり、教えてもらえたりしたら、泣いて喜びます。
