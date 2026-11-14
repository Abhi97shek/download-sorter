# Download Sorter website

The marketing and download page for [Download Sorter](https://github.com/Abhi97shek/download-sorter),
a free menu bar app that sorts your Downloads folder.

React, TypeScript, Tailwind CSS 4 and GSAP, built with Vite.

## Run it

```bash
npm install
npm run fetch-dmg   # copies the latest release's DownloadSorter.dmg into public/
npm run dev         # http://localhost:5173
```

## Build and publish

```bash
npm run build       # output in dist/, ready for any static host
```

The installer is not stored in git. `npm run fetch-dmg` downloads the latest release asset into
`public/DownloadSorter.dmg` so the build can serve it at `/DownloadSorter.dmg`.

## Notes

- Design: warm cream and burnt orange, set in Google Sans Flex and Google Sans Code.
- Motion respects `prefers-reduced-motion`, and the looping background animation has a Pause button.
- The download button adapts to the visitor: Macs get the DMG; phones, tablets and PCs get an
  "Email this page" link instead.
- Questions deep-link: `/#question-3` opens the third answer.
