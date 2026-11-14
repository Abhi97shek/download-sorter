import { useEffect, useRef } from "react";
import { isPaused, onPauseChange } from "@/lib/motion-pause";

/**
 * The hero’s ground: a file grid where tiles in the three folder colours start
 * scattered, then glide into three tidy stacks: what the app does, as a backdrop.
 * Tiles near the cursor drift aside. One 2D canvas, a few dozen rectangles a frame.
 *
 *   mode "live"    loops: mess, sort, hold, mess again. Pauses off screen and in hidden tabs.
 *   mode "sorted"  draws the finished, tidy state once (also what reduced motion gets).
 */

const COLOURS = ["#ff9a62", "#5eead4", "#fcd34d"]; // media, documents, everything else
const GRID_LINE = "rgba(255, 240, 228, 0.07)";

type Tile = { g: number; x: number; y: number; fx: number; fy: number; tx: number; ty: number; ox: number; oy: number; delay: number; nx?: number; ny?: number };

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Phase lengths in ms: the mess, the sort, the tidy hold, the return to mess
const MESS = 2200, SORT = 2000, HOLD = 2800, UNSORT = 1300;
const CYCLE = MESS + SORT + HOLD + UNSORT;

export function SortField({ mode = "live", className = "", style }: { mode?: "live" | "sorted"; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const still = mode === "sorted" || reduced;
    let W = 0, H = 0, cell = 28, cols = 0, rows = 0;
    let tiles: Tile[] = [];
    let gridLayer: HTMLCanvasElement | null = null;
    let raf = 0, start = performance.now(), lastCycle = -1;
    let visible = true;
    let userPaused = isPaused();
    let pausedAt = 0;
    let rect = canvas.getBoundingClientRect(); // cached: read on resize and scroll, not on every pointer move
    let rectStale = false;
    const pointer = { x: -9999, y: -9999 };
    let seed = 11;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

    // Three blocks of three columns: two on the left, one on the right, clear of the centred text.
    const targetsFor = (count: number) => {
      const per = Math.ceil(count / 3);
      const blockRows = Math.ceil(per / 3);
      const bottomRow = Math.max(blockRows + 1, Math.floor(rows * 0.7));
      const lefts = [1, 5, cols - 4];
      const out: { x: number; y: number }[][] = [[], [], []];
      for (let g = 0; g < 3; g++) {
        for (let i = 0; i < per; i++) {
          const c = lefts[g] + (i % 3), r = bottomRow - Math.floor(i / 3);
          out[g].push({ x: c * cell + cell / 2, y: r * cell + cell / 2 });
        }
      }
      return out;
    };
    const randomCell = () => ({ x: Math.floor(rnd() * cols) * cell + cell / 2, y: Math.floor(rnd() * rows) * cell + cell / 2 });

    const layout = () => {
      rect = canvas.getBoundingClientRect(); rectStale = false;
      W = rect.width; H = rect.height;
      if (!W || !H) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = W < 640 ? 24 : 28;
      cols = Math.floor(W / cell); rows = Math.floor(H / cell);
      const count = W < 640 ? 27 : 72;
      const targets = targetsFor(count);
      tiles = Array.from({ length: count }, (_, i) => {
        const g = i % 3, t = targets[g][Math.floor(i / 3)];
        const from = randomCell();
        return { g, x: from.x, y: from.y, fx: from.x, fy: from.y, tx: t.x, ty: t.y, ox: 0, oy: 0, delay: rnd() };
      });
      // Grid drawn once into its own layer
      gridLayer = document.createElement("canvas");
      gridLayer.width = canvas.width; gridLayer.height = canvas.height;
      const g = gridLayer.getContext("2d")!;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.strokeStyle = GRID_LINE; g.lineWidth = 1;
      g.beginPath();
      for (let x = 0; x <= W; x += cell) { g.moveTo(Math.round(x) + 0.5, 0); g.lineTo(Math.round(x) + 0.5, H); }
      for (let y = 0; y <= H; y += cell) { g.moveTo(0, Math.round(y) + 0.5); g.lineTo(W, Math.round(y) + 0.5); }
      g.stroke();
      if (still) tiles.forEach((t) => { t.x = t.tx; t.y = t.ty; });
      lastCycle = -1;
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      if (gridLayer) ctx.drawImage(gridLayer, 0, 0, W, H);
      const s = cell - 8;
      for (const t of tiles) {
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = COLOURS[t.g];
        const x = t.x + t.ox - s / 2, y = t.y + t.oy - s / 2;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, s, s, 3);
        else ctx.rect(x, y, s, s);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      raf = 0;
      if (!visible || userPaused) return;
      const elapsed = now - start, cycle = Math.floor(elapsed / CYCLE), t = elapsed % CYCLE;
      if (cycle !== lastCycle) {
        // New loop: the mess starts from wherever the last unsort left the tiles
        lastCycle = cycle;
        tiles.forEach((tile) => { tile.fx = tile.x; tile.fy = tile.y; tile.nx = tile.ny = undefined; });
      }
      for (const tile of tiles) {
        if (t < MESS) {
          // idle in the mess
        } else if (t < MESS + SORT) {
          const local = Math.min(1, Math.max(0, (t - MESS - tile.delay * 700) / (SORT - 700)));
          const e = easeOutExpo(local);
          tile.x = tile.fx + (tile.tx - tile.fx) * e;
          tile.y = tile.fy + (tile.ty - tile.fy) * e;
        } else if (t < MESS + SORT + HOLD) {
          tile.x = tile.tx; tile.y = tile.ty;
          // pick where this tile will scatter to next
          if (tile.nx === undefined) {
            const n = randomCell(); tile.nx = n.x; tile.ny = n.y;
          }
        } else {
          if (tile.nx === undefined) { const n = randomCell(); tile.nx = n.x; tile.ny = n.y; }
          const e = easeInOutCubic(Math.min(1, (t - MESS - SORT - HOLD) / UNSORT));
          tile.x = tile.tx + (tile.nx - tile.tx) * e;
          tile.y = tile.ty + (tile.ny! - tile.ty) * e;
        }
        // Drift away from the cursor, and ease back
        const dx = tile.x - pointer.x, dy = tile.y - pointer.y, d = Math.hypot(dx, dy);
        const push = d < 90 ? (1 - d / 90) * 16 : 0;
        const goalX = d ? (dx / d) * push : 0, goalY = d ? (dy / d) * push : 0;
        tile.ox += (goalX - tile.ox) * 0.15; tile.oy += (goalY - tile.oy) * 0.15;
      }
      draw();
      raf = requestAnimationFrame(frame);
    };
    const play = () => { if (!still && visible && !userPaused && !raf) raf = requestAnimationFrame(frame); };

    layout();
    const ro = new ResizeObserver(() => layout());
    ro.observe(canvas);

    if (still) return () => ro.disconnect();

    // Pause when off screen or in a hidden tab
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting && !document.hidden; if (visible) play(); });
    io.observe(canvas);
    const onVis = () => { visible = !document.hidden; if (visible) play(); };
    document.addEventListener("visibilitychange", onVis);
    const onMove = (e: PointerEvent) => {
      if (rectStale) { rect = canvas.getBoundingClientRect(); rectStale = false; }
      pointer.x = e.clientX - rect.left; pointer.y = e.clientY - rect.top;
    };
    const onScroll = () => { rectStale = true; };
    window.addEventListener("scroll", onScroll, { passive: true });
    // The page's pause switch: stop the loop, keep the picture, and resume where it left off
    const offPause = onPauseChange(() => {
      const now = performance.now();
      if (isPaused()) { userPaused = true; pausedAt = now; cancelAnimationFrame(raf); raf = 0; }
      else { userPaused = false; start += now - pausedAt; play(); }
    });
    const onLeave = () => { pointer.x = pointer.y = -9999; };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    play();

    return () => {
      cancelAnimationFrame(raf);
      offPause(); window.removeEventListener("scroll", onScroll);
      ro.disconnect(); io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [mode]);

  return <canvas ref={ref} aria-hidden="true" data-field={mode} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} style={style} />;
}
