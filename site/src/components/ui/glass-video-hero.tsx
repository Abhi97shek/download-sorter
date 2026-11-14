import { DownloadLink, DeviceNote } from "@/components/download-link";
import { SortDemo } from "@/components/sort-demo";
import { SortField } from "@/components/sort-field";
import { PauseMotion } from "@/components/pause-motion";

/**
 * The hero: a ground that runs from dark (where the headline sits) to cream
 * (where the product sits), a centred headline, one pair of actions, and the
 * app itself at work in a window.
 */
const HeroSection = () => {
  return (
    <section id="top" className="on-dark hero-ground grain relative w-full overflow-hidden">
      <SortField mode="live" className="field-hero z-0" />
      <div
        data-hero="content"
        className="pad-x relative z-10 flex flex-col items-center pb-16 pt-36 text-center sm:pt-40 lg:pb-24 lg:pt-44"
      >
        <div
          data-hero="pill"
          className="inline-flex h-9 items-center gap-2.5 rounded-full border border-line bg-surface px-3.5 text-sm text-foreground backdrop-blur"
        >
          <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
          Free and open source · Version 1.0 for Mac
        </div>

        <h1
          data-hero="title"
          className="mt-8 max-w-4xl text-[46px] leading-[1.02] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-[84px]"
        >
          Your Downloads folder,{" "}
          <br className="hidden lg:block" />
          sorted by itself.
        </h1>

        <p data-hero="sub" className="mt-7 max-w-[580px] text-lg leading-relaxed text-muted-foreground sm:text-[19px]">
          A tiny menu bar app that moves every new download into the right
          folder by file type. Meet a type it doesn’t know? It asks you to name
          a folder, once.
        </p>

        <div data-hero="cta" className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <DownloadLink className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground shadow-[0_10px_24px_-10px_rgba(0,0,0,0.5)] transition-[translate,scale] hover:-translate-y-px hover:brightness-95 active:scale-[0.97]" />
          <a
            href="#how"
            className="inline-flex items-center rounded-xl border border-line-strong bg-[#1a0e08]/55 px-6 py-3.5 text-base text-foreground backdrop-blur transition-[translate,scale,background-color] hover:-translate-y-px hover:bg-[#1a0e08]/75 active:scale-[0.97]"
          >
            See how it works
          </a>
        </div>

        <DeviceNote className="mt-5 max-w-xl text-balance text-sm text-foreground" />

        <SortDemo />
      </div>
      <PauseMotion className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-[max(1.5rem,env(safe-area-inset-left))] z-20" />
    </section>
  );
};

export { HeroSection };
