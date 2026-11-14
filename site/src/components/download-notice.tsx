import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";

/**
 * Appears after any Download link is clicked, so the visitor isn’t left in
 * Finder wondering what to do next. Listens for clicks on links to the .dmg.
 */
export function DownloadNotice() {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false); // drives the enter transition
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href$=".dmg"]');
      if (!link) return;
      setOpen(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setOpen(false), 30000);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return setShown(false);
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  if (!open) return null;

  const showSteps = () => {
    document.getElementById("install")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`on-dark fixed inset-x-[max(1rem,env(safe-area-inset-left))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 rounded-2xl border border-line-strong bg-[#1a0e08] p-5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] transition-[opacity,translate] duration-500 ease-out sm:inset-x-auto sm:right-[max(1.5rem,env(safe-area-inset-right))] sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] sm:w-[360px] ${
        shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <button
        onClick={() => setOpen(false)}
        aria-label="Dismiss"
        className="absolute right-3 top-3 grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
      >
        <X size={16} aria-hidden="true" />
      </button>
      <p className="flex items-center gap-2 pr-8 font-medium">
        <span className="grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
          <Check size={12} aria-hidden="true" />
        </span>
        Your download has started
      </p>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-accent">
        <li>Open <span translate="no" className="font-mono text-[0.875em] text-foreground">DownloadSorter.dmg</span> from your Downloads.</li>
        <li>Drag the app into Applications.</li>
        <li>
          macOS will block it the first time. <span className="text-foreground">That’s expected.</span> Follow the one-time step below.
        </li>
      </ol>
      <button
        onClick={showSteps}
        className="mt-4 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-foreground underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-accent"
      >
        Show me the install steps <ArrowRight size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
