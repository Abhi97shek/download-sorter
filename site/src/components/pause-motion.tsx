import { Pause, Play } from "lucide-react";
import { setPaused, usePaused } from "@/lib/motion-pause";

/** A way to stop the looping background animation (it already stops for "reduce motion", so it hides then). */
export function PauseMotion({ className = "" }: { className?: string }) {
  const paused = usePaused();
  const reduced = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return null;
  return (
    <button
      type="button"
      aria-pressed={paused}
      onClick={() => setPaused(!paused)}
      className={`on-dark inline-flex items-center gap-2 rounded-full border border-line-strong bg-[#1a0e08]/85 px-3.5 py-2 text-sm text-foreground backdrop-blur transition-[translate,scale] hover:-translate-y-px active:scale-[0.97] ${className}`}
    >
      {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
      {paused ? "Play animation" : "Pause animation"}
    </button>
  );
}
