import { useEffect, useRef } from "react";
import { HeroSection } from "@/components/ui/glass-video-hero";
import { SiteHeader } from "@/components/site-header";
import { DownloadNotice } from "@/components/download-notice";
import { HowItWorks, NewTypeSection, Features, Folders, Install, ClosingCta } from "@/components/sections";
import { Faq } from "@/components/faq";
import { initAnimations } from "@/lib/animations";

export default function App() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current) return;
    return initAnimations(root.current);
  }, []);

  return (
    <div ref={root}>
      <a
        href="#top"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <SiteHeader />
      <DownloadNotice />
      <main>
        <HeroSection />
        <HowItWorks />
        <NewTypeSection />
        <Features />
        <Folders />
        <Install />
        <Faq />
        <ClosingCta />
      </main>
    </div>
  );
}
