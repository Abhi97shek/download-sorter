import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { isPaused, onPauseChange } from "@/lib/motion-pause";

gsap.registerPlugin(ScrollTrigger, SplitText);

// Dev-only handle for debugging in the browser console (stripped from production builds)
if (import.meta.env.DEV) Object.assign(window, { gsap, ScrollTrigger });

/**
 * The page's motion, kept to a few things that earn their place:
 *
 *   on load      the hero enters once (headline lines rise out of a mask)
 *   dealt moment the new-file-type popup plays out as you reach it
 *   dealt moment the install steps switch on, with a line that fills as you read
 *   state        the nav underline follows the section you are in
 *   arrival      the closing logo's arrow lands in its tray
 *
 * Hover and press are CSS (a lift, a step, a press). Nothing fades in because the
 * page scrolled, nothing tilts, and nothing parallaxes. Under reduced motion
 * everything simply rests, fully visible. Returns a cleanup function.
 */
export function initAnimations(scope: HTMLElement): () => void {
  const mm = gsap.matchMedia(scope);

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const q = gsap.utils.selector(scope);

    // ---- Hero: enters once on load ----
    gsap
      .timeline({ defaults: { ease: "expo.out" } })
      // Explicit end values, so a CSS transition or a re-mount can never leave anything hidden
      .fromTo(q("[data-hero=pill]"), { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 0.15)
      .fromTo(q("[data-hero=sub]"), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 0.7)
      .fromTo(q("[data-hero=cta] > *"), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 }, 0.9)
      .fromTo(q("[data-hero=demo]"), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1 }, 1.1);

    // The headline settles into place one line at a time, rising out of a mask
    const title = q("[data-hero=title]")[0];
    if (title) {
      SplitText.create(title, {
        type: "lines",
        mask: "lines",
        autoSplit: true, // re-splits on resize and when the web font arrives
        onSplit(self) {
          // The mask clips to the line box; give descenders room
          (self.masks as HTMLElement[]).forEach((m) => {
            m.style.paddingBottom = "0.16em";
            m.style.marginBottom = "-0.16em";
          });
          return gsap.from(self.lines, { yPercent: 115, duration: 1.2, stagger: 0.14, delay: 0.3, ease: "expo.out" });
        },
      });
    }

    // The "How it works" connector draws from step 1 to step 3
    gsap.utils.toArray<HTMLElement>(q("[data-line]")).forEach((el) => {
      gsap.from(el, {
        scaleX: 0, duration: 1.4, ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    });

    // ---- Install steps: a line fills as you read down, and each step switches on as you reach it ----
    const steps = gsap.utils.toArray<HTMLElement>(q("#install ol[data-steps] > li"));
    steps.forEach((li, i) => {
      const badge = li.querySelector<HTMLElement>("[data-badge]");
      const seg = li.querySelector<HTMLElement>("[data-seg]");
      if (seg) {
        gsap.fromTo(seg, { scaleY: 0 }, {
          scaleY: 1, ease: "none",
          scrollTrigger: { trigger: li, start: "top 62%", end: "bottom 62%", scrub: true },
        });
      }
      if (i > 0 && badge) {
        badge.dataset.idle = "true";
        ScrollTrigger.create({
          trigger: li,
          start: "top 62%",
          onEnter: () => delete badge.dataset.idle,
          onLeaveBack: () => (badge.dataset.idle = "true"),
        });
      }
    });

    // ---- Closing logo: the arrow lands in the tray the first time you reach it ----
    const closing = q("[data-closing]")[0];
    if (closing) {
      gsap.from(closing.querySelectorAll("[data-arrow]"), {
        y: -22, opacity: 0, duration: 1, ease: "expo.out",
        scrollTrigger: { trigger: closing, start: "top 85%", once: true },
      });
    }

    // ---- The popup's drift runs only while it is on screen, and never when the visitor has paused motion ----
    const offPauseListeners: (() => void)[] = [];
    gsap.utils.toArray<HTMLElement>(q("[data-float]")).forEach((el) => {
      const drift = gsap.to(el, { y: -10, duration: 2.4, yoyo: true, repeat: -1, ease: "sine.inOut", paused: true });
      let onScreen = false;
      const sync = () => drift.paused(!onScreen || isPaused());
      ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => { onScreen = self.isActive; sync(); },
      });
      offPauseListeners.push(onPauseChange(sync));
    });

    // ---- The authored moment: the new-file-type popup plays out as you reach it ----
    // The product's one unusual behaviour: the popup arrives, the folder name is
    // typed, the button is pressed, the file moves.
    const stage = q("[data-sketch=stage]")[0];
    if (stage) {
      const press = q("[data-sketch=press]");
      gsap
        .timeline({
          defaults: { ease: "expo.out" },
          scrollTrigger: { trigger: stage, start: "top 70%", once: true },
        })
        .from(stage.firstElementChild, { opacity: 0, y: 28, scale: 0.96, duration: 0.8 })
        // A cover the colour of the field slides away to the right, in steps: typing, with a transform
        .fromTo(q("[data-sketch=cover]"), { scaleX: 1 }, { scaleX: 0, duration: 0.9, ease: "steps(12)" }, 0.7)
        .to(press, { scale: 0.95, duration: 0.12, ease: "power2.in" }, 2.0)
        .to(press, { scale: 1, duration: 0.45 }, 2.12)
        .from(q("[data-sketch=done]"), { opacity: 0, y: 10, duration: 0.7 }, 2.25)
        .from(q("[data-sketch=done] svg"), { scale: 0, duration: 0.6 }, 2.35);
    }

    // ---- FAQ answers slide in when opened ----
    const details = q("details") as HTMLDetailsElement[];
    const onToggle = (e: Event) => {
      const d = e.currentTarget as HTMLDetailsElement;
      if (d.open) gsap.from(d.querySelector("p"), { y: -10, opacity: 0, duration: 0.45, ease: "power2.out" });
    };
    details.forEach((d) => d.addEventListener("toggle", onToggle));

    // Recalculate trigger positions once fonts have loaded
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      details.forEach((d) => d.removeEventListener("toggle", onToggle));
      window.removeEventListener("load", refresh);
      offPauseListeners.forEach((off) => off());
    };
  });

  // ---- Wayfinding: the nav underline follows the section you are reading ----
  mm.add("(min-width: 768px)", () => {
    const q = gsap.utils.selector(scope);
    const indicator = q("[data-nav-indicator]")[0];
    if (!indicator) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Later sections first, so the last one you have scrolled past wins
    const targets = ["#faq", "#install", "#how"]
      .map((href) => ({
        href,
        el: scope.querySelector<HTMLElement>(href),
        link: scope.querySelector<HTMLElement>(`[data-nav="${href}"]`),
      }))
      .filter((t): t is { href: string; el: HTMLElement; link: HTMLElement } => !!t.el && !!t.link);
    let active: string | null = null;

    // Layout is measured when it can change (load, resize, a ScrollTrigger refresh), never while scrolling
    let tops: Record<string, number> = {};
    let slots: Record<string, { x: number; w: number }> = {};
    const measure = () => {
      const wrap = indicator.parentElement!.getBoundingClientRect();
      tops = {}; slots = {};
      targets.forEach((t) => {
        tops[t.href] = t.el.getBoundingClientRect().top + window.scrollY;
        const r = t.link.getBoundingClientRect();
        slots[t.href] = { x: r.left - wrap.left + 12, w: r.width - 24 };
      });
    };
    const place = (instant = false) => {
      const slot = active ? slots[active] : undefined;
      if (!slot) return void gsap.to(indicator, { opacity: 0, duration: 0.25 });
      const vars = { x: slot.x, width: slot.w, opacity: 1 };
      if (instant || reduced) gsap.set(indicator, vars);
      else gsap.to(indicator, { ...vars, duration: 0.5, ease: "expo.out" });
    };
    const update = () => {
      const line = window.scrollY + window.innerHeight * 0.5;
      const hit = targets.find((t) => tops[t.href] <= line);
      const next = hit?.href ?? null;
      if (next === active) return;
      const first = active === null;
      active = next;
      targets.forEach((t) =>
        t.href === active ? t.link.setAttribute("aria-current", "location") : t.link.removeAttribute("aria-current"),
      );
      place(first);
    };
    measure();
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: update });
    update();
    const remeasure = () => { measure(); active = null; update(); };
    ScrollTrigger.addEventListener("refresh", remeasure);
    window.addEventListener("resize", remeasure);
    return () => {
      ScrollTrigger.removeEventListener("refresh", remeasure);
      window.removeEventListener("resize", remeasure);
      targets.forEach((t) => t.link.removeAttribute("aria-current"));
    };
  });

  return () => mm.revert();
}
