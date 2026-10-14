# EMODESIGN UI Components

Web サイトでよく使う UI パーツと、スクロール・ホバー・3D などの「動き」を集めた **100 種類のコンポーネント集**です。
デザイナー・Web 制作者が、そのまま使ったり、AI に作らせるときのお手本にしたりできるように公開しています。

**▶ まずはデモサイトを見てください：https://ui.emodesign.jp/**

---

## はじめての方へ（GitHub に慣れていなくても大丈夫です）

このページは、カタログの「中身（プログラム）」を置いている場所です。
見た目を確かめたり、コードをコピーしたりするだけなら、**このページを読み解く必要はありません。**目的に合わせて、下のどれかから始めてください。

| やりたいこと | おすすめの方法 |
|---|---|
| どんな動きか見てみたい | [デモサイト](https://ui.emodesign.jp/)で一覧からカードを開く（右のパネルで色や速さを変えて試せます） |
| コードをコピーして使いたい | デモサイトで各コンポーネントを開き、上部の **「コード」タブ → 「コードをコピー」** |
| AI（ChatGPT・Claude など）に作らせたい | 各コンポーネントの Notion ページにある「生成用プロンプト」をコピーし、編集エリアを書き換えて AI に渡す（デモサイトの「Notion」ボタンから開けます） |
| GitHub 上でコードを読みたい | [`src/components/`](./src/components) フォルダを開く（1 コンポーネント = 1 ファイル） |

---

## どのフォルダを見ればいい？

見るべきなのは **`src/components/` だけ**です。ほかのフォルダは、デモサイトを動かすための「裏方」なので、開かなくて大丈夫です。

| フォルダ・ファイル | 中身 | 見る必要 |
|---|---|---|
| **`src/components/`** | **コンポーネント本体（100 ファイル）** | **ここだけ見れば OK** |
| `src/playgrounds/` | デモサイトの右パネル（値を動かす設定） | 不要 |
| `src/playground/`・`src/App.tsx` など | デモサイト自体の画面 | 不要 |
| `public/covers/` | 一覧のカバー画像・動画 | 不要 |
| `scripts/` | カバー画像を作るための作業用スクリプト | 不要 |
| `package.json` など直下のファイル | サイトを組み立てるための設定 | 不要 |

ファイル名は英語です。日本語名との対応は、デモサイトの一覧（日本語名・英語名・ファイル名を併記）で確認できます。

---

## 収録しているもの（100 種類）

| 分類 | 数 | 例 |
|---|---|---|
| 基本レイアウト | 8 | ヘッダー、ヒーロー、フッター、メガメニュー、会社概要・アクセス |
| リッチ・表示 | 12 | タブ、アコーディオン、モーダル、お知らせ一覧、ご利用の流れ |
| デザイン・装飾 | 9 | カード、バッジ、ガラス風パネル、スタッフ紹介、縦書きレイアウト |
| CTA・コンバージョン | 13 | 料金表、お問い合わせフォーム、予約カレンダー、スマホ固定ボタン |
| 動き・演出 | 50 | スクロール演出、カーソル演出、テキスト演出、ビフォーアフター |
| 3D・高度表現 | 8 | 3D ヒーロー、パーティクル、シェーダー背景 |

---

## 自分のサイトで使うには（React を使っている方向け）

コンポーネントは **React + TypeScript + Tailwind CSS** で書かれています。

1. 使いたいファイル（例：`src/components/MagicScroll.tsx`）を、自分のプロジェクトにコピーする
2. ファイル先頭の `import` を見て、必要なライブラリをインストールする（下の表）
3. ファイル内の `export function 〜` を自分のページで使う
   （ファイル末尾の `export default function App()` は動作確認用のデモなので、使わなくて OK）

画像はサンプル（Unsplash）を指定しているので、自分の画像に差し替えてください。会社名・人物名・ロゴはすべて架空です。

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

---

## よくある質問

**Q. React がわからなくても使えますか？**
A. コードをそのまま使うには React の環境が必要です。React を使っていない場合は、Notion の「生成用プロンプト」を AI に渡して、自分の環境（HTML / Vue / WordPress など）向けに書き換えてもらうのがおすすめです。

**Q. 商用サイト・お客様の案件に使ってもいいですか？**
A. はい、自由に使えます（下のライセンスをご覧ください）。

**Q. スマホでも動きますか？**
A. すべてスマホ表示に対応しています。PC でデモサイトを開くと、画面上部のボタンで表示幅（スマホ / タブレット / PC）を切り替えて確認できます。

---

## このカタログを手元で動かす（開発者向け）

```bash
npm install
npm run dev
```

---

## ライセンス

[MIT No Attribution](./LICENSE)（MIT-0）です。商用・非商用を問わず、改変も再配布も自由に使えます。
クレジット表記は必須ではありません。でも「EMODESIGN のを使ったよ」と書いてもらえたり、教えてもらえたりしたら、泣いて喜びます。

制作：[EMODESIGN](https://emodesign.jp/)
