import { Archive, FileText, FolderClosed, Image, Music } from "lucide-react";
import { Check, Collapse, Count, Roll, Stage, Row, Text, Window, type Act } from "@/stageshow/kit";
import "./finder-demo.css";

/**
 * Hopper at work, drawn with the Stageshow kit: files leave the Downloads list one
 * after another and the folder counts in the sidebar climb. Plays once when it scrolls into view.
 */
const FILES = [
  { name: "IMG_4821.heic", folder: 0, Icon: Image },
  { name: "invoice-march.pdf", folder: 1, Icon: FileText },
  { name: "podcast-ep12.mp3", folder: 2, Icon: Music },
  { name: "trip-photo.jpg", folder: 0, Icon: Image },
  { name: "project-backup.zip", folder: 3, Icon: Archive },
  { name: "resume-final.pdf", folder: 1, Icon: FileText },
] as const;
const FOLDERS = ["Images", "PDFs", "Music", "Archives"] as const;
const TONES = ["media", "docs", "media", "misc"] as const;
const countIn = (n: number, f: number) => FILES.slice(0, n).filter((x) => x.folder === f).length;

type S = { n: number };

async function script(a: Act<S>) {
  await a.wait(900);
  for (let i = 1; i <= FILES.length; i++) {
    a.mark(`file-${i}`);
    await a.set({ n: i });
    await a.wait(i === FILES.length ? 600 : 750);
  }
}

export function FinderDemo() {
  return (
    <Stage<S>
      width={760}
      height={380}
      compact={{ below: 560, width: 358, height: 330 }}
      initial={{ n: 0 }}
      poster={{ n: FILES.length }}
      play="once"
      script={script}
      accent="#c2410c"
      greys="cool"
      className="fd"
    >
      {(s, _rect, layout) => {
        const compact = layout === "compact";
        const left = FILES.length - s.n;
        return (
          <Window
            className="fd-window"
            style={compact ? { left: 12, top: 20, width: 334, height: 400 } : { left: 70, top: 28, width: 620, height: 440 }}
            sidebarWidth={compact ? 118 : 176}
            sidebar={
              <div className="fd-side">
                <span className="fd-side__label">Folders</span>
                {FOLDERS.map((name, f) => (
                  <div key={name} className="fd-side__item" data-lit={countIn(s.n, f) > 0 || undefined}>
                    <FolderClosed size={15} strokeWidth={1.7} className={`fd-tone-${TONES[f]}`} />
                    <span className="fd-side__name">{name}</span>
                    <Count className="fd-side__count" value={countIn(s.n, f)} duration={450} />
                  </div>
                ))}
              </div>
            }
            title="Downloads"
            toolbar={
              <span className="fd-status" data-done={left === 0 || undefined}>
                <Roll variant="fade">{left === 0 ? "All in folders" : `${left} waiting`}</Roll>
              </span>
            }
            body={{ className: "fd-body", "data-crop": true }}
          >
            <div className="fd-list">
              {FILES.map(({ name, folder, Icon }, i) => (
                <Collapse key={name} open={s.n <= i}>
                  <Row
                    pad={8}
                    lead={<Icon size={16} strokeWidth={1.7} className={`fd-tone-${TONES[folder]}`} />}
                    title={<Text style={{ fontSize: 13 }}>{name}</Text>}
                    meta={<span className="fd-meta">{FOLDERS[folder]}</span>}
                  />
                </Collapse>
              ))}
              <div className="fd-empty" data-show={left === 0 || undefined}>
                <Check on={left === 0} />
                <span>Every file is in its folder</span>
              </div>
            </div>
          </Window>
        );
      }}
    </Stage>
  );
}
