import fs from "node:fs";
import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";
import faq from "./src/lib/faq.json" with { type: "json" };

// Read the installer's size from the file the site serves, so the page never states a stale number
const dmg = path.resolve(import.meta.dirname, "public/DownloadSorter.dmg");
const dmgSize = fs.existsSync(dmg) ? `${Math.round(fs.statSync(dmg).size / 1024)}\u00a0KB` : "under 1\u00a0MB";

const TITLE = "Sortly — free Mac app that sorts your Downloads folder";
const DESC = "Sortly is a free menu bar app for Mac. It moves every new download into the right folder by file type, and asks you to name a folder when it sees a new type.";

/**
 * Search and AI-answer metadata. Set SITE_URL (e.g. https://sortly.pages.dev) when building;
 * without it the absolute-URL tags (canonical, social image, sitemap) are left out rather than guessed.
 */
function seo(): Plugin {
  const site = (process.env.SITE_URL ?? "").replace(/\/$/, "");
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Sortly",
      description: DESC,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "macOS 13 or later, Apple Silicon",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      ...(site && { url: `${site}/`, image: `${site}/icon.png` }),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
  ];
  const tags = [
    { tag: "meta", attrs: { name: "robots", content: "index, follow, max-image-preview:large" }, injectTo: "head" as const },
    { tag: "meta", attrs: { property: "og:type", content: "website" }, injectTo: "head" as const },
    { tag: "meta", attrs: { property: "og:site_name", content: "Sortly" }, injectTo: "head" as const },
    { tag: "meta", attrs: { property: "og:title", content: TITLE }, injectTo: "head" as const },
    { tag: "meta", attrs: { property: "og:description", content: DESC }, injectTo: "head" as const },
    { tag: "meta", attrs: { name: "twitter:card", content: "summary" }, injectTo: "head" as const },
    ...(site
      ? [
          { tag: "link", attrs: { rel: "canonical", href: `${site}/` }, injectTo: "head" as const },
          { tag: "meta", attrs: { property: "og:url", content: `${site}/` }, injectTo: "head" as const },
          { tag: "meta", attrs: { property: "og:image", content: `${site}/icon.png` }, injectTo: "head" as const },
        ]
      : []),
    { tag: "script", attrs: { type: "application/ld+json" }, children: JSON.stringify(jsonLd), injectTo: "head" as const },
  ];
  return {
    name: "seo",
    transformIndexHtml: () => tags,
    generateBundle() {
      const emit = (fileName: string, source: string) => this.emitFile({ type: "asset", fileName, source });
      emit("robots.txt", `User-agent: *\nAllow: /\n${site ? `Sitemap: ${site}/sitemap.xml\n` : ""}`);
      if (site) emit("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${site}/</loc></url></urlset>\n`);
      // llms.txt: a plain summary for AI assistants
      emit(
        "llms.txt",
        `# Sortly\n\n> ${DESC}\n\nSortly is free, runs on macOS 13 or later on Apple Silicon (M1 or newer), has no network code and needs no account.\n\n## Questions\n\n${faq.map(([q, a]) => `- ${q} ${a}`).join("\n")}\n`,
      );
    },
  };
}

export default defineConfig({
  define: { __DMG_SIZE__: JSON.stringify(dmgSize) },
  plugins: [react(), tailwindcss(), seo()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
});
