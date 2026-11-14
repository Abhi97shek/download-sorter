import fs from "node:fs";
import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// Read the installer's size from the file the site serves, so the page never states a stale number
const dmg = path.resolve(import.meta.dirname, "public/DownloadSorter.dmg");
const dmgSize = fs.existsSync(dmg) ? `${Math.round(fs.statSync(dmg).size / 1024)}\u00a0KB` : "under 1\u00a0MB";

export default defineConfig({
  define: { __DMG_SIZE__: JSON.stringify(dmgSize) },
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
});
