<div align="center">

# 📥 Download Sorter

**Your Downloads folder, sorted automatically.**
A tiny menu bar app for macOS that moves every new download into the right folder by file type — and asks you what to do when it meets a type it doesn't know.

![Platform](https://img.shields.io/badge/platform-macOS%2013%2B-000000?style=for-the-badge&logo=apple&logoColor=white)
![Swift](https://img.shields.io/badge/Swift-5-F05138?style=for-the-badge&logo=swift&logoColor=white)
![Apple Silicon](https://img.shields.io/badge/Apple%20Silicon-arm64-555555?style=for-the-badge&logo=apple&logoColor=white)
![Price](https://img.shields.io/badge/price-free-2ea44f?style=for-the-badge)

[**⬇️ Download**](../../releases/latest) · [How it works](#-how-it-works) · [Build from source](#-build-from-source) · [FAQ](#-faq)

</div>

---

## 📑 Table of contents

- [✨ Features](#-features)
- [🚀 Install](#-install)
- [🧠 How it works](#-how-it-works)
- [🗂️ Default folders](#️-default-folders)
- [🆕 When it finds a new file type](#-when-it-finds-a-new-file-type)
- [🛠️ Build from source](#-build-from-source)
- [📁 Project structure](#-project-structure)
- [❓ FAQ](#-faq)
- [📄 License](#-license)

## ✨ Features

- 🗃️ **Auto-sorts downloads** into folders like `Images`, `PDFs`, `Music`, `Videos`, `Archives` and more
- 🆕 **Asks about new file types** — type a folder name once and every future file of that type goes there
- ⏳ **Waits for downloads to finish** — `.crdownload`, `.download`, `.part` and `.tmp` files are never touched
- 🛡️ **Never overwrites** — duplicates become `report (1).pdf`
- ⚙️ **Manage Rules window** to add, change or remove which extension goes where
- 🚫 **"Never sort this type"** option for files you want to leave alone
- 🕘 **Recently moved** list in the menu
- 🚪 **Launch at Login**, pause/resume, and no Dock icon
- 🪶 Tiny, native, no network access, no accounts, no tracking

## 🚀 Install

1. Download **`DownloadSorter.dmg`** from the [latest release](../../releases/latest).
2. Open the DMG and drag **Download Sorter** into **Applications**.
3. Open it. The first time, macOS will say it can't verify the app, because it isn't notarized:
   - **macOS 15 Sequoia or later:** double-click the app, click **Done** (not Move to Trash), then open **System Settings → Privacy & Security**, scroll to *Security* and click **Open Anyway**.
   - **macOS 13–14:** right-click the app → **Open** → **Open**.
4. When macOS asks for access to your Downloads folder, click **Allow**.
5. Look for the tray-with-arrow icon in your menu bar. Done.

> [!TIP]
> Turn on **Launch at Login** from the menu bar icon so it's always working.

> [!NOTE]
> Requires macOS 13 (Ventura) or later on a Mac with Apple Silicon.

## 🧠 How it works

```
 new file lands in Downloads
            │
            ▼
 still downloading? ──yes──▶ wait
            │ no
            ▼
 known file type? ──yes──▶ move to its folder
            │ no
            ▼
 ask you for a folder name ──▶ remember it forever
```

The app checks your Downloads folder every 1.5 seconds. A file is only moved after its size has stopped changing, so half-finished downloads are safe. Files that were already in Downloads when the app started are left alone — use **Sort Files Already in Folder Now** in the menu to sort those too.

## 🗂️ Default folders

| Folder | File types |
| --- | --- |
| 🖼️ Images | jpg, jpeg, png, gif, heic, webp, svg, tiff, raw … |
| 📕 PDFs | pdf |
| 📝 Documents | doc, docx, txt, rtf, pages, md, epub … |
| 📊 Spreadsheets | xls, xlsx, csv, numbers … |
| 📽️ Presentations | ppt, pptx, key |
| 🎬 Videos | mp4, mov, avi, mkv, webm … |
| 🎵 Music | mp3, wav, aac, flac, m4a … |
| 🗜️ Archives | zip, rar, 7z, tar, gz … |
| 💿 Installers | dmg, pkg, iso |
| 💻 Code | py, js, ts, html, css, json, swift … |
| 🔤 Fonts | ttf, otf, woff, woff2 |

You can change any of these in **Manage Rules…**

## 🆕 When it finds a new file type

If you download something with an extension the app doesn't know (say `.sketch`), a dialog appears:

| Button | What happens |
| --- | --- |
| **Create Folder & Move** | Makes the folder you named, moves the file, and remembers the rule |
| **Skip for Now** | Leaves the file; won't ask again until the app restarts |
| **Never Sort .sketch** | Leaves these files alone for good (undo in Manage Rules) |

Rules are saved in `~/Library/Application Support/DownloadSorter/rules.json`.

## 🛠️ Build from source

You only need the Xcode Command Line Tools (`xcode-select --install`).

```bash
git clone https://github.com/Abhi97shek/download-sorter.git
cd download-sorter
./build.sh          # creates build/Download Sorter.app
./make-dmg.sh       # creates dist/DownloadSorter.dmg
```

## 📁 Project structure

```
├── Sources/
│   ├── main.swift        # app start-up and menu bar menu
│   ├── Sorter.swift      # watches Downloads, moves files, new-type dialog
│   ├── RuleStore.swift   # extension → folder rules, saved as JSON
│   └── RulesView.swift   # Manage Rules window
├── build.sh              # compiles and packages the .app
└── make-dmg.sh           # packages the .app into a DMG
```

## ❓ FAQ

<details>
<summary><b>macOS says the app "can't be opened" or is from an unidentified developer</b></summary>

The app isn't signed with a paid Apple Developer ID. On macOS 15 or later use **System Settings → Privacy & Security → Open Anyway**; on macOS 13–14, right-click the app and choose **Open**. You only need to do this once.
</details>

<details>
<summary><b>Nothing is being moved</b></summary>

Check that the menu bar icon doesn't say **Paused**, and that Download Sorter has access to your Downloads folder in **System Settings → Privacy & Security → Files and Folders**.
</details>

<details>
<summary><b>Does it send my files or data anywhere?</b></summary>

No. It has no network code. It only moves files inside your Downloads folder.
</details>

<details>
<summary><b>Can I watch a different folder?</b></summary>

Yes: <code>defaults write com.local.DownloadSorter watchFolder "/path/to/folder"</code>, then restart the app.
</details>

<details>
<summary><b>How do I uninstall it?</b></summary>

Quit it from the menu bar, delete it from Applications, and optionally delete `~/Library/Application Support/DownloadSorter`. Folders it already created in Downloads stay.
</details>

## 📄 License

Released under the [MIT License](LICENSE).

<div align="center">

Made with ❤️ and Swift

</div>
