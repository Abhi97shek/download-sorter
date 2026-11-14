import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { DownloadLink } from "@/components/download-link";
import { AppLogo } from "@/components/app-logo";
import { Brand } from "@/components/brand";

const links = [
  { href: "#how", label: "How it works" },
  { href: "#install", label: "Install" },
  { href: "#faq", label: "FAQ" },
  { href: "https://github.com/Abhi97shek/download-sorter", label: "GitHub" },
];

/** A floating pill: always dark, so it reads over the hero and over the cream page alike. */
export function SiteHeader() {
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="on-dark fixed inset-x-[max(1rem,env(safe-area-inset-left))] top-[max(1rem,env(safe-area-inset-top))] z-40 mx-auto max-w-[760px] rounded-2xl border border-line bg-[#1a0e08]/90 shadow-[0_12px_32px_-12px_rgba(26,14,8,0.6)] backdrop-blur-xl">
      <nav className="flex h-[52px] items-center justify-between gap-2 pl-3 pr-1.5 sm:gap-4 sm:pl-4 sm:pr-2" aria-label="Main">
        <a href="#top" className="group/logo flex items-center gap-2.5 whitespace-nowrap rounded-md text-[15px] font-semibold text-foreground">
          <AppLogo size={26} />
          <Brand />
        </a>

        <div className="flex items-center gap-1">
          <div className="relative hidden md:block">
            <ul className="flex items-center">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    data-nav={l.href}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground aria-[current=location]:text-foreground"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            {/* Slides under whichever section you are reading */}
            <span
              data-nav-indicator
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0.5 left-0 h-px w-0 bg-accent opacity-0"
            />
          </div>
          <DownloadLink
            variant="compact"
            className="ml-1 inline-flex items-center gap-1.5 whitespace-nowrap rounded-[10px] bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-[translate,scale] hover:-translate-y-px hover:brightness-90 active:scale-[0.97]"
          />
          <button
            type="button"
            onClick={() => setMenu((m) => !m)}
            aria-expanded={menu}
            aria-controls={menu ? "mobile-menu" : undefined}
            aria-label={menu ? "Close menu" : "Open menu"}
            className="grid size-10 place-items-center rounded-md text-foreground md:hidden"
          >
            {menu ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {menu && (
        <ul id="mobile-menu" className="border-t border-line px-4 pb-3 pt-1 md:hidden">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setMenu(false)}
                className="block rounded-md py-3 text-base text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
