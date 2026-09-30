import type { Control, Values } from './types';

export function defaultsOf(controls: Control[]): Values {
  return Object.fromEntries(controls.map((c) => [c.key, c.default]));
}

/** "?a=1&b=x" 形式のクエリを、コントロール定義に沿って型変換して既定値に上書き */
export function parseSearch(controls: Control[], search: string): Values {
  const out = defaultsOf(controls);
  const params = new URLSearchParams(search);
  for (const c of controls) {
    const raw = params.get(c.key);
    if (raw === null) continue;
    if (c.type === 'range') {
      const n = Number(raw);
      if (Number.isFinite(n)) out[c.key] = Math.min(c.max, Math.max(c.min, n));
    } else if (c.type === 'toggle') {
      out[c.key] = raw === '1' || raw === 'true';
    } else if (c.type === 'select') {
      if (c.options.some((o) => o.value === raw)) out[c.key] = raw;
    } else {
      out[c.key] = raw;
    }
  }
  return out;
}

/** 既定値と違うものだけをクエリにする（共有リンク用） */
export function toSearch(controls: Control[], values: Values): string {
  const params = new URLSearchParams();
  for (const c of controls) {
    const v = values[c.key];
    if (v === c.default) continue;
    params.set(c.key, typeof v === 'boolean' ? (v ? '1' : '0') : String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : '';
}

/** props としてコピーしやすい文字列（例: strength={0.35} variant="solid"） */
export function toPropsString(controls: Control[], values: Values): string {
  return controls
    .map((c) => {
      const v = values[c.key];
      return typeof v === 'string' ? `${c.key}="${v}"` : `${c.key}={${String(v)}}`;
    })
    .join('\n');
}
