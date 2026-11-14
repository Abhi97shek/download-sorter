export type Tone = "media" | "docs" | "misc";

/**
 * The app's built-in folders, in the three groups used across the page.
 * The source of truth is Sources/RuleStore.swift; keep the two in step.
 */
export const FOLDER_GROUPS: { name: string; tone: Tone; folders: [name: string, extensions: string][] }[] = [
  {
    name: "Media",
    tone: "media",
    folders: [
      ["Images", "jpg, png, heic, gif, webp, svg…"],
      ["Videos", "mp4, mov, mkv, webm…"],
      ["Music", "mp3, wav, flac, m4a…"],
    ],
  },
  {
    name: "Documents",
    tone: "docs",
    folders: [
      ["PDFs", "pdf"],
      ["Documents", "docx, txt, rtf, pages, md…"],
      ["Spreadsheets", "xlsx, csv, numbers…"],
      ["Presentations", "pptx, key"],
    ],
  },
  {
    name: "Everything else",
    tone: "misc",
    folders: [
      ["Archives", "zip, rar, 7z, tar, gz…"],
      ["Installers", "dmg, pkg, iso"],
      ["Code", "py, js, html, json, swift…"],
      ["Fonts", "ttf, otf, woff, woff2"],
    ],
  },
];

export const FOLDER_COUNT = FOLDER_GROUPS.reduce((n, g) => n + g.folders.length, 0);
