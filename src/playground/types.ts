import type { ReactNode } from 'react';

/* =========================================================
 * プレイグラウンド（パラメータ切り替えデモ）の型定義
 * - コントロール定義（スライダー / セレクト / トグル / テキスト / カラー）
 * - src/playgrounds/<コンポーネントのファイル名>.tsx が default export で PlaygroundDef を返す
 * ========================================================= */

export type Value = string | number | boolean;
export type Values = Record<string, Value>;

type Base = {
  /** props 名（Notion のパラメータ表と揃える。URL のクエリ名にもなる） */
  key: string;
  /** パネルに表示するラベル（日本語） */
  label: string;
  /** ラベル下の補足 */
  hint?: string;
};

export type RangeControl = Base & { type: 'range'; min: number; max: number; step: number; default: number; unit?: string };
export type SelectControl = Base & {
  type: 'select';
  options: { value: string; label: string }[];
  default: string;
};
export type ToggleControl = Base & { type: 'toggle'; default: boolean };
export type TextControl = Base & { type: 'text'; default: string; multiline?: boolean };
export type ColorControl = Base & { type: 'color'; default: string };

export type Control = RangeControl | SelectControl | ToggleControl | TextControl | ColorControl;

export type PlaygroundDef<T extends Values = Values> = {
  controls: Control[];
  /** プレビュー（iframe 内）に表示する内容。values をそのまま props に渡す */
  render: (values: T) => ReactNode;
  /**
   * true なら値が変わるたびに再マウントする。
   * 「表示された時に1回だけ再生」系（whileInView / 初期化時にだけ読む値）のアニメーション向け
   */
  remountOnChange?: boolean;
  /** パネル上部に出す一言メモ */
  note?: string;
};

/** 型付きで書くためのヘルパー：definePlayground<{ speed: number }>({ ... }) */
export function definePlayground<T extends Values>(def: PlaygroundDef<T>): PlaygroundDef {
  return def as unknown as PlaygroundDef;
}
