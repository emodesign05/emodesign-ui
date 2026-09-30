import { Children, useRef } from 'react';
import type { ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Gauge, Layers, ShieldCheck, Sparkles, Timer, Wand2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* =========================================================
 * スクロールリビール（Scroll Reveal / Fade Up）
 * - <Reveal> で囲んだ要素が、画面に入ったタイミングで下からフェードイン
 * - direction で up / down / left / right / scale を切り替え
 * - <RevealGroup> で囲むと、子要素が順番に（stagger）現れる
 * - GSAP ScrollTrigger：once で1回だけ再生 / amount（要素が何割見えたら）で発火位置を調整
 * - prefers-reduced-motion 時は移動なしのフェードのみ
 * ========================================================= */

type Direction = 'up' | 'down' | 'left' | 'right' | 'scale';

const OFFSET = 40;
const FROM: Record<Direction, gsap.TweenVars> = {
  up: { y: OFFSET },
  down: { y: -OFFSET },
  left: { x: OFFSET },
  right: { x: -OFFSET },
  scale: { scale: 0.92 },
};

/** 動きの開始状態。reduce 時は透明度だけ */
function fromVars(direction: Direction) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return { autoAlpha: 0, ...(reduce ? {} : FROM[direction]) };
}

/** 要素の上端 + amount×高さ が画面下端に来たら発火 */
function trigger(el: Element, amount: number, once: boolean): ScrollTrigger.Vars {
  return { trigger: el, start: `top+=${Math.round(amount * 100)}% bottom`, once, toggleActions: once ? 'play none none none' : 'play none none reverse' };
}

type RevealProps = {
  children?: ReactNode;
  as?: 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'section' | 'span';
  direction?: Direction;
  delay?: number;
  duration?: number;
  /** 要素のどれだけが見えたら発火するか（0〜1） */
  amount?: number;
  once?: boolean;
  className?: string;
};

export function Reveal({ children, as = 'div', direction = 'up', delay = 0, duration = 0.8, amount = 0.3, once = true, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  // タグ名だけ差し替える（型は div として扱う）
  const Tag = as as 'div';
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      gsap.fromTo(el, fromVars(direction), { autoAlpha: 1, x: 0, y: 0, scale: 1, duration, delay, ease: 'expo.out', scrollTrigger: trigger(el, amount, once) });
    },
    { dependencies: [direction, delay, duration, amount, once], revertOnUpdate: true },
  );
  return (
    <Tag ref={ref} className={className} style={{ visibility: 'hidden' }}>
      {children}
    </Tag>
  );
}

function RevealGroup({ children, stagger = 0.1, direction = 'up', className }: { children: ReactNode; stagger?: number; direction?: Direction; className?: string }) {
  const ref = useRef<HTMLUListElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      gsap.fromTo(el.children, fromVars(direction), { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.7, stagger, ease: 'expo.out', scrollTrigger: trigger(el, 0.2, true) });
    },
    { scope: ref, dependencies: [stagger, direction] },
  );
  return (
    <ul ref={ref} className={className}>
      {Children.map(children, (child) => (
        <li style={{ visibility: 'hidden' }}>{child}</li>
      ))}
    </ul>
  );
}

const FEATURES = [
  { icon: Gauge, title: '高速', body: '初期表示を最優先に設計。' },
  { icon: ShieldCheck, title: '堅牢', body: '型とテストで壊れにくく。' },
  { icon: Layers, title: '拡張性', body: '部品単位で組み替え可能。' },
  { icon: Wand2, title: '演出', body: '動きで意図を伝える。' },
  { icon: Timer, title: '短納期', body: '再利用で素早く立ち上げ。' },
  { icon: Sparkles, title: '品質', body: '細部まで磨き込む。' },
];

export default function App() {
  return (
    <main className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <section className="flex min-h-screen flex-col justify-center px-6 sm:px-16">
        <Reveal>
          <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">SCROLL REVEAL</p>
        </Reveal>
        <Reveal as="h1" delay={0.1} className="mt-4 text-4xl font-bold leading-tight sm:text-6xl">
          見えた瞬間に、
          <br />
          ふわりと届く。
        </Reveal>
        <Reveal delay={0.2} className="mt-5 max-w-md text-sm text-slate-600 dark:text-slate-400">
          下にスクロールすると、要素が順番に現れます。
        </Reveal>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-24">
        <Reveal as="h2" className="text-3xl font-bold">Features</Reveal>
        <RevealGroup className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="h-full rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
              <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden />
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{body}</p>
            </div>
          ))}
        </RevealGroup>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 px-6 py-24 md:grid-cols-2">
        <Reveal direction="right" className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
        <Reveal direction="left" delay={0.1}>
          <h2 className="text-3xl font-bold">左右からも。</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            direction を変えるだけで、横から・拡大しながら、などの登場に切り替えられます。
          </p>
        </Reveal>
      </section>

      <section className="flex min-h-[70vh] items-center justify-center px-6">
        <Reveal direction="scale" className="rounded-3xl bg-slate-900 px-10 py-14 text-center text-white dark:bg-white dark:text-slate-900">
          <p className="text-2xl font-bold">scale で、存在感を。</p>
        </Reveal>
      </section>
    </main>
  );
}
