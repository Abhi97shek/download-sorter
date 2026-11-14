import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { flushSync } from "react-dom";
import { FileQuestion, Plus } from "lucide-react";

const REPO = "https://github.com/Abhi97shek/download-sorter";

const QS: [string, string][] = [
  ["Is it really free?", "Yes. No ads, no accounts and no upgrade later."],
  ["Does it send my files or data anywhere?", "No. The app has no network code. It only moves files inside your Downloads folder."],
  ["macOS says it can’t verify the app. What now?", "On macOS 15 or later, click Done (not Move to Trash), open System Settings → Privacy & Security, scroll to Security and click Open Anyway next to Download Sorter. On macOS 13 and 14, right-click the app, choose Open, then Open again. You only need to do this once."],
  ["Does it work on an Intel Mac?", "Not yet. This version is built for Apple Silicon (M1 and newer)."],
  ["Can I undo a move?", "Files are moved, not deleted. Open the sub-folder inside Downloads and drag the file back. Use Pause Sorting in the menu if you want files to stay put."],
  ["How do I uninstall it?", "Choose Quit from the menu bar icon, then drag the app from Applications to the Trash. Folders it already made in Downloads stay."],
];

/**
 * Questions as files in a Finder-style window; the chosen one opens in a Quick
 * Look-style preview. The highlight glides between rows and the preview swaps
 * with a View Transition where the browser has one (others switch instantly).
 * Built as vertical tabs: arrow keys, Home and End move between questions.
 * Phones get the plain tap-to-open list.
 */
/** `#question-3` selects the third question; the URL follows the selection so it can be shared. */
const fromHash = () => {
  const m = /^#question-(\d+)$/.exec(location.hash);
  const i = m ? Number(m[1]) - 1 : 0;
  return i >= 0 && i < QS.length ? i : 0;
};

export function Faq() {
  const [active, setActive] = useState(fromHash);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  // Arriving on a deep link: bring the questions into view, and open the matching answer on phones
  useEffect(() => {
    if (!/^#question-\d+$/.test(location.hash)) return;
    const i = fromHash();
    document.querySelectorAll<HTMLDetailsElement>("#faq details")[i]?.setAttribute("open", "");
    requestAnimationFrame(() => document.getElementById("faq")?.scrollIntoView({ block: "start" }));
  }, []);
  // Back and forward, or a pasted link, change the selection too
  useEffect(() => {
    const onHash = () => /^#question-\d+$/.test(location.hash) && setActive(fromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const select = (i: number, focus = false) => {
    history.replaceState(null, "", `#question-${i + 1}`);
    if (i === active) return focus && tabs.current[i]?.focus();
    const apply = () => flushSync(() => setActive(i));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    type VT = { ready: Promise<void>; finished: Promise<void>; updateCallbackDone: Promise<void> };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => VT };
    if (doc.startViewTransition && !reduced) {
      // Quick key presses cut the previous transition short; that is expected, not an error
      const vt = doc.startViewTransition(apply);
      [vt.ready, vt.finished, vt.updateCallbackDone].forEach((pr) => pr.catch(() => {}));
    } else apply();
    if (focus) tabs.current[i]?.focus();
  };

  const onKey = (e: KeyboardEvent) => {
    const last = QS.length - 1;
    const next = { ArrowDown: active === last ? 0 : active + 1, ArrowUp: active === 0 ? last : active - 1, Home: 0, End: last }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(next, true);
  };

  const [q, a] = QS[active];

  return (
    <section id="faq" className="pad-x relative z-[2] mx-auto max-w-6xl py-24 lg:py-36">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-[38px] leading-[1.04] tracking-[-0.035em] sm:text-5xl lg:text-[56px]">Questions</h2>
        <p className="max-w-sm leading-relaxed text-muted-foreground sm:text-right">
          Something else? <a className="text-foreground underline decoration-line-strong hover:decoration-accent" href={`${REPO}/issues`}>Ask on GitHub</a>.
        </p>
      </div>

      {/* Desktop and tablet: a Finder window with a Quick Look pane */}
      <div className="mt-12 hidden overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_60px_-34px_rgba(26,14,8,0.35)] md:block">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span className="size-3 rounded-full bg-[#ff5f57]" aria-hidden="true" />
          <span className="size-3 rounded-full bg-[#febc2e]" aria-hidden="true" />
          <span className="size-3 rounded-full bg-[#28c840]" aria-hidden="true" />
          <span className="ml-3 text-sm text-muted-foreground">Questions</span>
          <span className="ml-auto font-mono text-xs text-muted-foreground tabular-nums">{QS.length} items</span>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <div role="tablist" aria-orientation="vertical" aria-label="Questions" onKeyDown={onKey} className="border-r border-line p-2">
            {QS.map(([question], i) => {
              const on = i === active;
              return (
                <button
                  key={question}
                  ref={(el) => { tabs.current[i] = el; }}
                  role="tab"
                  id={`faq-tab-${i}`}
                  aria-selected={on}
                  aria-controls="faq-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => select(i)}
                  className="group relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[15px] transition-colors"
                >
                  {/* The highlight is one element that glides from row to row */}
                  {on && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-lg bg-primary"
                      style={{ viewTransitionName: "faq-sel" } as React.CSSProperties}
                    />
                  )}
                  {!on && <span aria-hidden="true" className="absolute inset-0 rounded-lg transition-colors group-hover:bg-line" />}
                  <FileQuestion
                    size={17}
                    aria-hidden="true"
                    className={`relative flex-none ${on ? "text-primary-foreground" : "text-accent"}`}
                  />
                  <span className={`relative ${on ? "font-medium text-primary-foreground" : "text-foreground"}`}>{question}</span>
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            id="faq-panel"
            aria-labelledby={`faq-tab-${active}`}
            tabIndex={0}
            className="flex min-h-[380px] flex-col p-8 lg:p-10"
          >
            <div className="flex flex-1 flex-col" style={{ viewTransitionName: "faq-card" } as React.CSSProperties}>
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <FileQuestion size={19} aria-hidden="true" />
                </span>
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  Question {active + 1} of {QS.length}
                </span>
              </div>
              <h3 className="mt-6 text-2xl leading-snug tracking-[-0.02em] lg:text-[28px]">{q}</h3>
              <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-muted-foreground">{a}</p>
              <p className="mt-auto pt-8 text-sm text-muted-foreground">
                <kbd className="rounded border border-line-strong px-1.5 py-0.5 font-mono text-xs">↑</kbd>{" "}
                <kbd className="rounded border border-line-strong px-1.5 py-0.5 font-mono text-xs">↓</kbd>{" "}
                to browse questions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Phones: the plain tap-to-open list */}
      <div className="mt-10 space-y-3 md:hidden">
        {QS.map(([question, answer]) => (
          <details
            key={question}
            onToggle={(e) => e.currentTarget.open && history.replaceState(null, "", `#question-${QS.findIndex(([x]) => x === question) + 1}`)}
            className="group rounded-xl border border-line bg-surface px-5 transition-colors duration-300 open:border-line-strong"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden">
              {question}
              <Plus size={18} aria-hidden="true" className="flex-none text-muted-foreground transition-transform duration-300 group-open:rotate-45" />
            </summary>
            <p className="max-w-[65ch] pb-5 leading-relaxed text-muted-foreground">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
