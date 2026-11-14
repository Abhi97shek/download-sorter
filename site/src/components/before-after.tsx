import { useEffect, useRef, useState, type ComponentType } from "react";
import { gsap } from "gsap";
import {
  Archive, ChevronsLeftRight, FileCode, FileText, Film, FolderClosed, Image as ImageIcon,
  Music, Package, Presentation, Table, Type,
} from "lucide-react";
import { FOLDER_GROUPS, type Tone } from "@/lib/folders";

/**
 * Before and after: one example Downloads folder, shown loose on the left and
 * sorted on the right. The divider is a native range input (drag, click, arrow
 * keys, Home and End, screen readers) laid over the picture, so there is no
 * custom gesture code. The two counts are computed from the same list that draws
 * the picture, so the numbers on the labels always match what is shown.
 */

type Icon = ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean | "true" }>;

const ICONS: Record<string, Icon> = {
  Images: ImageIcon, Videos: Film, Music, PDFs: FileText, Documents: FileText, Spreadsheets: Table,
  Presentations: Presentation, Archives: Archive, Installers: Package, Code: FileCode, Fonts: Type,
};
const FOLDERS: [name: string, tone: Tone, Icon: Icon][] = FOLDER_GROUPS.flatMap((g) =>
  g.folders.map(([name]): [string, Tone, Icon] => [name, g.tone, ICONS[name]]),
);
const folderOf = (name: string) => FOLDERS.find(([n]) => n === name)!;

// An example folder, in the order a real one piles up
const FILES: [file: string, folder: string][] = [
  ["IMG_4821.heic", "Images"], ["invoice-march.pdf", "PDFs"], ["setup (2).dmg", "Installers"], ["podcast-ep12.mp3", "Music"],
  ["resume-final-v3.docx", "Documents"], ["Screenshot 2026-03-08 at 9.41.12.png", "Images"], ["project-backup.zip", "Archives"],
  ["budget-2026.xlsx", "Spreadsheets"], ["boarding-pass.pdf", "PDFs"], ["intro-clip.mp4", "Videos"], ["notes.txt", "Documents"],
  ["trip-photo.jpg", "Images"], ["Slack.dmg", "Installers"], ["export.csv", "Spreadsheets"], ["contract-signed.pdf", "PDFs"],
  ["voice-memo.m4a", "Music"], ["logo-final-v3.png", "Images"], ["assets.zip", "Archives"], ["script.py", "Code"],
  ["pitch-deck.key", "Presentations"], ["receipt-2231.pdf", "PDFs"], ["IMG_4822.heic", "Images"], ["screen-recording.mov", "Videos"],
  ["Inter.ttf", "Fonts"], ["photos-2025.zip", "Archives"], ["meeting-agenda.pages", "Documents"], ["driver.pkg", "Installers"],
  ["tax-form.pdf", "PDFs"], ["song-demo.wav", "Music"], ["banner (1).webp", "Images"], ["old-site.tar.gz", "Archives"],
  ["config.json", "Code"],
];
const countIn = (folder: string) => FILES.filter(([, f]) => f === folder).length;

const TONE_TEXT: Record<Tone, string> = { media: "text-grp-media", docs: "text-grp-docs", misc: "text-grp-misc" };

// The two lists never change, only the clip does: build them once so dragging doesn't redraw 43 rows per move
const AFTER_LIST = (
  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
    {FOLDERS.map(([name, tone]) => (
      <li key={name} className="flex items-center gap-3 rounded-xl border border-line bg-background px-3.5 py-3">
        <FolderClosed size={20} className={`flex-none ${TONE_TEXT[tone]}`} aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate font-medium">{name}</span>
        <span className="flex-none text-sm text-muted-foreground tabular-nums">{countIn(name)}</span>
      </li>
    ))}
  </ul>
);
const BEFORE_LIST = (
  <ul className="grid grid-cols-1 gap-x-4 gap-y-0.5 [mask-image:linear-gradient(to_bottom,#000_78%,transparent)] sm:grid-cols-2 lg:grid-cols-3">
    {FILES.map(([file, folder]) => {
      const FileIcon = folderOf(folder)[2];
      return (
        <li key={file} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm">
          <FileIcon size={15} className="flex-none text-muted-foreground" aria-hidden="true" />
          <span className="truncate">{file}</span>
        </li>
      );
    })}
  </ul>
);

const reducedMotion = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

export function BeforeAfter() {
  const [pos, setPos] = useState(50); // how much of the "before" side is showing, 0 to 100
  const posRef = useRef(50);
  const tween = useRef<gsap.core.Tween | null>(null);
  const stage = useRef<HTMLDivElement>(null);

  const set = (v: number) => { posRef.current = v; setPos(v); };
  const glide = (to: number) => {
    tween.current?.kill();
    if (reducedMotion()) return set(to);
    const o = { v: posRef.current };
    tween.current = gsap.to(o, { v: to, duration: 0.8, ease: "expo.out", onUpdate: () => set(o.v) });
  };

  // Once, as it comes into view: start on the loose folder and sweep to the middle, so the handle announces itself
  useEffect(() => {
    const el = stage.current;
    if (!el || reducedMotion()) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      set(94); glide(50);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); tween.current?.kill(); };
  }, []);

  const rounded = Math.round(pos);
  const showingBefore = rounded >= 97, showingAfter = rounded <= 3;

  return (
    <section id="before-after" className="pad-x relative z-[2] mx-auto max-w-6xl py-24 lg:py-36">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="max-w-2xl text-[38px] leading-[1.04] tracking-[-0.035em] sm:text-5xl lg:text-[56px]">
            The same folder, <em>before and after.</em>
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Drag the handle to compare an example Downloads folder without and with Sortly.
          </p>
        </div>
        <div role="group" aria-label="Jump to" className="flex w-fit rounded-full border border-line bg-surface p-1">
          {([["Before", 100, showingBefore], ["After", 0, showingAfter]] as const).map(([label, to, on]) => (
            <button
              key={label}
              type="button"
              aria-pressed={on}
              onClick={() => glide(to)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${on ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12 overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_60px_-34px_rgba(26,14,8,0.35)]">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span className="size-3 rounded-full bg-[#ff5f57]" aria-hidden="true" />
          <span className="size-3 rounded-full bg-[#febc2e]" aria-hidden="true" />
          <span className="size-3 rounded-full bg-[#28c840]" aria-hidden="true" />
          <span className="ml-3 text-sm text-muted-foreground">Downloads</span>
          <span className="ml-auto text-xs text-muted-foreground">An example folder</span>
        </div>

        <div ref={stage} data-compare className="relative h-[420px] select-none sm:h-[440px]">
          {/* After: the base layer */}
          <div data-layer="after" aria-hidden={showingBefore} className="absolute inset-0 overflow-hidden p-4 pt-16 [mask-image:linear-gradient(to_bottom,#000_80%,transparent)] sm:p-5 sm:pt-16">
            {AFTER_LIST}
          </div>

          {/* Before: on top, revealed from the left */}
          <div
            data-layer="before"
            aria-hidden={showingAfter}
            className="absolute inset-0 overflow-hidden bg-surface p-4 pt-16 sm:p-5 sm:pt-16"
            style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
          >
            {BEFORE_LIST}
          </div>

          {/* Labels, computed from the same list that draws the picture */}
          <div className="pointer-events-none absolute left-4 right-4 top-4 z-10 flex justify-between gap-3 sm:left-5 sm:right-5">
            <span className="rounded-full border border-line-strong bg-surface-raised px-3.5 py-1.5 text-sm shadow-sm">
              <b className="font-semibold">Before</b> <span className="text-muted-foreground">· {FILES.length} loose files</span>
            </span>
            <span className="rounded-full border border-line-strong bg-surface-raised px-3.5 py-1.5 text-sm shadow-sm">
              <b className="font-semibold">After</b> <span className="text-muted-foreground">· {FOLDERS.length} folders</span>
            </span>
          </div>

          {/* The control: a native range input over everything, then the drawn handle */}
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={rounded}
            onChange={(e) => { tween.current?.kill(); set(Number(e.target.value)); }}
            aria-label="Compare before and after"
            aria-valuetext={`${rounded}% before, ${100 - rounded}% after`}
            className="peer absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0"
            style={{ touchAction: "pan-y" }}
          />
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-primary peer-focus-visible:bg-accent" style={{ left: `${pos}%` }} />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 z-10 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-[0_8px_20px_-8px_rgba(26,14,8,0.6)] peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2"
            style={{ left: `${pos}%` }}
          >
            <ChevronsLeftRight size={18} />
          </span>

        </div>
      </div>
      <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-relaxed text-muted-foreground">
        Drag the handle, or use the arrow keys. New downloads sort as they arrive; files already in Downloads sort with one click.
      </p>
    </section>
  );
}
