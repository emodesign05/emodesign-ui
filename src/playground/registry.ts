import { useEffect, useState } from 'react';
import type { PlaygroundDef } from './types';

/* src/playgrounds/*.tsx を自動で列挙（ファイルを置くだけでパラメータ調整UIが有効になる） */
const loaders = import.meta.glob<{ default: PlaygroundDef }>('../playgrounds/*.tsx');

export const PLAYGROUND_NAMES = new Set(
  Object.keys(loaders).map((p) => p.replace('../playgrounds/', '').replace(/\.tsx$/, '')),
);

export function loadPlayground(name: string): Promise<PlaygroundDef> {
  const loader = loaders[`../playgrounds/${name}.tsx`];
  if (!loader) return Promise.reject(new Error(`playground not found: ${name}`));
  return loader().then((m) => m.default);
}

export function usePlaygroundDef(name: string): { def: PlaygroundDef | null; error: Error | null } {
  const [state, setState] = useState<{ name: string; def: PlaygroundDef | null; error: Error | null }>({
    name,
    def: null,
    error: null,
  });
  useEffect(() => {
    let alive = true;
    loadPlayground(name)
      .then((def) => alive && setState({ name, def, error: null }))
      .catch((error: Error) => alive && setState({ name, def: null, error }));
    return () => {
      alive = false;
    };
  }, [name]);
  return state.name === name ? { def: state.def, error: state.error } : { def: null, error: null };
}
