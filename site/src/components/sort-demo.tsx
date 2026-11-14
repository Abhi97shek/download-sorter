import { useEffect, useRef } from "react";
import { isPaused, onPauseChange } from "@/lib/motion-pause";
import { gsap } from "gsap";
import { FileText, Image, Music, Archive, FolderClosed, Check } from "lucide-react";

/**
 * A small looping picture of what the app does: files in Downloads fly into
 * their folders. Drawn with HTML so it stays crisp and costs no download.
 * With "reduce motion" on, it shows the finished, tidy state instead.
 */
const FILES = [
  { name: "IMG_4821.heic", folder: "Images", Icon: Image },
  { name: "invoice-march.pdf", folder: "PDFs", Icon: FileText },
  { name: "podcast-ep12.mp3", folder: "Music", Icon: Music },
  { name: "trip-photo.jpg", folder: "Images", Icon: Image },
  { name: "project-backup.zip", folder: "Archives", Icon: Archive },
  { name: "resume-final.pdf", folder: "PDFs", Icon: FileText },
] as const;
const FOLDERS = ["Images", "PDFs", "Music", "Archives"] as const;
// The same three colours as the app icon’s tabs: media, documents, everything else
const TONE: Record<string, string> = {
  Images: "text-grp-media",
  PDFs: "text-grp-docs",
  Music: "text-grp-media",
  Archives: "text-grp-misc",
};
const counts = (f: string) => FILES.filter((x) => x.folder === f).length;

export function SortDemo() {
  const root = useRef<HTMLDivElement>(null);
  const reduced =
    typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;

    const files = Array.from(el.querySelectorAll<HTMLElement>("[data-file]"));
    const folders = Object.fromEntries(
      Array.from(el.querySelectorAll<HTMLElement>("[data-folder]")).map((f) => [f.dataset.folder!, f]),
    );
    const status = el.querySelector<HTMLElement>("[data-status]")!;
    const empty = el.querySelector<HTMLElement>("[data-empty]")!;
    const check = el.querySelector<HTMLElement>("[data-check]")!;
    const tally = new Map<string, number>();

    const reset = () => {
      tally.clear();
      gsap.set(files, { clearProps: "all" });
      gsap.set(el.querySelectorAll("[data-hl]"), { clearProps: "all" });
      gsap.set(empty, { opacity: 0 });
      el.querySelectorAll<HTMLElement>("[data-count]").forEach((c) => (c.textContent = "0"));
      status.textContent = `${FILES.length} files waiting`;
      gsap.set(check, { scale: 0, opacity: 0 });
    };

    let tl: gsap.core.Timeline;
    const build = () => {
      tl?.kill();
      reset();
      tl = gsap.timeline({ repeat: -1, repeatDelay: 2.2, delay: 1.4, onRepeat: reset });
      files.forEach((file, i) => {
        const target = folders[FILES[i].folder];
        const a = file.getBoundingClientRect();
        const b = target.getBoundingClientRect();
        const count = target.querySelector<HTMLElement>("[data-count]")!;
        tl.to(file.querySelector("[data-hl]"), { opacity: 1, duration: 0.25, ease: "power2.out" })
          .to(file, {
            x: b.left + b.width / 2 - (a.left + a.width / 2),
            y: b.top + b.height / 2 - (a.top + a.height / 2),
            scale: 0.4,
            opacity: 0,
            duration: 0.75,
            ease: "expo.inOut",
          })
          .call(() => {
            const n = (tally.get(FILES[i].folder) ?? 0) + 1;
            tally.set(FILES[i].folder, n);
            count.textContent = String(n);
            status.textContent = `${FILES.length - files.filter((_, j) => j <= i).length} files waiting`;
          })
          .fromTo(target, { scale: 1.05 }, { scale: 1, duration: 0.4, ease: "power3.out" }, "<")
          .to({}, { duration: 0.15 });
      });
      tl.call(() => {
        status.textContent = "All sorted";
      })
        .to(check, { scale: 1, opacity: 1, duration: 0.6, ease: "expo.out" })
        .to(empty, { opacity: 1, duration: 0.5, ease: "power2.out" }, "<");
    };

    build();
    let t: number;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(build, 200);
    };
    window.addEventListener("resize", onResize);
    // Don’t animate while it’s off screen
    let inView = true;
    const sync = () => tl.paused(!inView || isPaused());
    const io = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }, { threshold: 0.2 });
    io.observe(el);
    const offPause = onPauseChange(sync);
    sync();

    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t);
      io.disconnect();
      offPause();
      tl.kill();
    };
  }, [reduced]);

  return (
    <div
      ref={root}
      data-hero="demo"
      className="mx-auto mt-14 w-full max-w-[640px] text-left"
    >
      <p className="sr-only">
        Illustration: files in a Downloads folder move one by one into Images, PDFs, Music and Archives folders.
      </p>
      <div
        aria-hidden="true"
        className="overflow-hidden rounded-2xl border border-line-strong bg-[#1a0e08]/92 shadow-[0_40px_80px_-30px_rgba(26,14,8,0.65)] backdrop-blur-xl"
      >
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-sm text-muted-foreground">Downloads</span>
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
            <Check
              data-check
              size={14}
              strokeWidth={3}
              className={`text-ok ${reduced ? "" : "scale-0 opacity-0"}`}
            />
            <span data-status>{reduced ? "All sorted" : `${FILES.length} files waiting`}</span>
          </span>
        </div>

        <div className="grid grid-cols-[1.25fr_1fr] gap-4 p-4 sm:gap-6 sm:p-5">
          <ul className="relative space-y-1.5">
            <li
              data-empty
              className={`absolute inset-0 grid place-items-center text-center text-sm text-muted-foreground ${
                reduced ? "" : "opacity-0"
              }`}
            >
              All tidy. Nothing left to sort.
            </li>
            {FILES.map(({ name, folder, Icon }) => (
              <li
                key={name}
                data-file
                className={`relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-foreground ${
                  reduced ? "opacity-0" : ""
                }`}
              >
                <span data-hl aria-hidden="true" className="absolute inset-0 rounded-md bg-accent/20 opacity-0" />
                <Icon size={15} className={`relative flex-none ${TONE[folder]}`} />
                <span className="relative truncate">{name}</span>
              </li>
            ))}
          </ul>

          <ul className="space-y-1.5 border-l border-line pl-4 sm:pl-6">
            {FOLDERS.map((f) => (
              <li
                key={f}
                data-folder={f}
                className="flex items-center gap-2.5 rounded-md border border-line bg-background/40 px-2.5 py-2 text-sm"
              >
                <FolderClosed size={15} className={`flex-none ${TONE[f]}`} />
                <span className="flex-1 truncate">{f}</span>
                <span data-count className="text-xs text-muted-foreground tabular-nums">
                  {reduced ? counts(f) : 0}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
