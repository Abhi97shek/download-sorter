import {
  Download, FolderOpen, Hourglass, FolderPlus, Settings2, Lock, Pause, Sparkles, Rocket,
  ChevronDown, Plus, CodeXml, ArrowUpRight, ShieldCheck, Check, FolderClosed,
} from "lucide-react";
import { DownloadLink, DeviceNote } from "@/components/download-link";
import { AppLogo } from "@/components/app-logo";
import { Brand } from "@/components/brand";
import { SortField } from "@/components/sort-field";
import { useDevice } from "@/lib/device";
import type { ReactNode } from "react";

const REPO = "https://github.com/Abhi97shek/download-sorter";

// Section rhythm on a 144px beat; tight pairs sit closer, the install gets the most room.
const PAD = { tight: "py-16 lg:py-24", default: "py-24 lg:py-36", loose: "py-28 lg:py-40" } as const;

function Section({
  id,
  children,
  className = "",
  pad = "default",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  pad?: keyof typeof PAD;
}) {
  return (
    <section id={id} className={`pad-x relative z-[2] mx-auto max-w-6xl ${PAD[pad]} ${className}`}>
      {children}
    </section>
  );
}

function H2({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`text-[38px] leading-[1.04] tracking-[-0.035em] sm:text-5xl lg:text-[56px] ${className}`}>
      {children}
    </h2>
  );
}

function Lede({ children }: { children: ReactNode }) {
  return <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">{children}</p>;
}

/** Primary action on a light ground: ink on cream. */
const CTA_INK =
  "inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground transition-[translate,scale] hover:-translate-y-px hover:brightness-90 active:scale-[0.97]";

export function HowItWorks() {
  const steps = [
    { icon: Download, title: "You download a file", text: "From Safari, Chrome, Firefox or AirDrop. Anything that saves to Downloads." },
    { icon: Hourglass, title: "It waits until it’s done", text: "Files still downloading are never touched, so nothing breaks halfway." },
    { icon: FolderOpen, title: "It moves to the right folder", text: "PDFs to PDFs, photos to Images, songs to Music. Duplicates get renamed, never overwritten." },
  ];
  return (
    <Section id="how" pad="default" className="!pt-10 lg:!pt-14">
      <H2 className="max-w-2xl">
        Download as usual. <em>It does the rest.</em>
      </H2>
      <div className="relative mt-16">
        {/* Connector between the three step markers (desktop) */}
        <div
          data-line
          aria-hidden="true"
          className="absolute left-6 top-6 hidden h-px origin-left bg-line-strong md:block"
          style={{ right: "calc((100% - 4rem) / 3 - 1.5rem)" }}
        />
        <ol className="grid gap-12 md:grid-cols-3 md:gap-8">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title}>
              <span className="relative z-10 grid size-12 place-items-center rounded-full border border-line-strong bg-background text-accent">
                <Icon size={20} aria-hidden="true" />
              </span>
              <p className="mt-5 font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground tabular-nums">
                Step {i + 1}
              </p>
              <h3 className="mt-1.5 text-xl">{title}</h3>
              <p className="mt-2 max-w-[34ch] leading-relaxed text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

/** The page’s dark band: the product’s one unusual behaviour, performed. */
export function NewTypeSection() {
  return (
    <div className="on-dark grain bg-background">
      <Section pad="default" className="grid gap-14 lg:grid-cols-2 lg:items-center">
        <div>
          <H2>
            Meets something new? <em>It asks you.</em>
          </H2>
          <Lede>
            Download a type the app hasn’t seen and a small window pops up. Type a
            folder name once, and every future file of that type goes there
            automatically.
          </Lede>
          <dl className="mt-8 space-y-4">
            {[
              ["Create Folder & Move", "makes your folder and remembers the rule."],
              ["Skip for Now", "leaves the file where it is."],
              ["Never Sort", "keeps that type out of the app’s hands for good."],
            ].map(([term, desc]) => (
              <div key={term} className="flex gap-3">
                <span aria-hidden="true" className="mt-[0.6em] size-1.5 flex-none rounded-full bg-accent" />
                <div className="leading-relaxed">
                  <dt className="inline font-medium text-foreground">{term}</dt>{" "}
                  <dd className="inline text-muted-foreground">{desc}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <div
          className="flex justify-center rounded-3xl border border-line bg-surface px-4 py-14"
          role="img"
          aria-label="Illustration of the window that asks where a new file type should go"
        >
          <div data-sketch="stage" className="flex flex-col items-center">
            <div
              data-float
              className="on-light w-[300px] rounded-[14px] border border-line bg-background p-5 text-center text-foreground shadow-[0_30px_60px_-24px_rgba(0,0,0,0.7)]"
            >
              <div className="mx-auto mb-3 grid size-[52px] place-items-center rounded-xl bg-primary text-primary-foreground">
                <FolderPlus size={26} aria-hidden="true" />
              </div>
              <p className="mb-2 text-sm font-semibold">New file type: .sketch</p>
              <p className="mb-2 text-xs leading-relaxed text-muted-foreground">“design.sketch” was downloaded, and there is no folder for .sketch files yet.</p>
              <p className="mb-3 text-xs leading-relaxed text-muted-foreground">Type a name for a new folder, or pick an existing one.</p>
              <div className="mb-3 flex h-7 items-center justify-between rounded-md border border-accent bg-surface-raised px-2 text-left text-xs ring-3 ring-accent/25">
                <span data-sketch="text" className="relative">
                  SKETCH Files
                  <span data-sketch="cover" aria-hidden="true" className="absolute -inset-x-px inset-y-0 origin-right scale-x-0 bg-surface-raised" />
                </span>
                <ChevronDown size={12} aria-hidden="true" className="text-muted-foreground" />
              </div>
              <div data-sketch="press" className="rounded-md bg-primary py-1.5 text-xs font-medium text-primary-foreground">Create Folder &amp; Move</div>
              <div className="mt-1.5 rounded-md border border-line bg-surface-raised py-1.5 text-xs">Skip for Now</div>
              <div className="mt-1.5 rounded-md border border-line bg-surface-raised py-1.5 text-xs">Never Sort .sketch</div>
            </div>
            {/* What the click does, shown outside the app window */}
            <p data-sketch="done" className="mt-7 flex items-center gap-2 text-sm text-muted-foreground">
              <Check size={15} strokeWidth={3} className="text-ok" aria-hidden="true" />
              design.sketch moved to SKETCH Files
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}

export function Features() {
  const lead = [
    {
      icon: FolderOpen,
      title: "Clean up old files",
      text: "Years of downloads piled up? One click sorts everything already sitting in your Downloads folder.",
    },
    {
      icon: Lock,
      title: "Private by design",
      text: "No account, no network access. It only moves files inside your Downloads folder, and the code is public.",
    },
  ];
  const more = [
    { icon: Sparkles, title: "Light and quiet", text: "Lives in your menu bar. No Dock icon." },
    { icon: Settings2, title: "Your rules", text: "Add, change or remove any file type." },
    { icon: Pause, title: "Pause any time", text: "Switch sorting off from the menu bar." },
    { icon: Rocket, title: "Starts with your Mac", text: "Turn on Launch at Login and forget it." },
  ];
  return (
    <Section pad="default" className="!pb-12 lg:!pb-16">
      <H2 className="max-w-2xl">Small app. One job, <em>done well.</em></H2>
      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {lead.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-line bg-surface p-8 transition-transform hover:-translate-y-0.5">
            <Icon size={24} className="text-accent" aria-hidden="true" />
            <h3 className="mt-6 text-2xl">{title}</h3>
            <p className="mt-2.5 max-w-[40ch] text-lg leading-relaxed text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
      <ul className="mt-12 grid gap-x-10 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
        {more.map(({ icon: Icon, title, text }) => (
          <li key={title} className="border-t border-line py-5">
            <p className="flex items-center gap-2 font-semibold">
              <Icon size={16} className="flex-none text-accent" aria-hidden="true" />
              {title}
            </p>
            <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">{text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function Folders() {
  // Three groups, matching the three tabs on the app icon
  const groups = [
    {
      name: "Media",
      icon: "text-grp-media",
      dot: "bg-grp-media",
      folders: [
        ["Images", "jpg, png, heic, gif, webp, svg…"],
        ["Videos", "mp4, mov, mkv, webm…"],
        ["Music", "mp3, wav, flac, m4a…"],
      ],
    },
    {
      name: "Documents",
      icon: "text-grp-docs",
      dot: "bg-grp-docs",
      folders: [
        ["PDFs", "pdf"],
        ["Documents", "docx, txt, rtf, pages, md…"],
        ["Spreadsheets", "xlsx, csv, numbers…"],
        ["Presentations", "pptx, key"],
      ],
    },
    {
      name: "Everything else",
      icon: "text-grp-misc",
      dot: "bg-grp-misc",
      folders: [
        ["Archives", "zip, rar, 7z, tar, gz…"],
        ["Installers", "dmg, pkg, iso"],
        ["Code", "py, js, html, json, swift…"],
        ["Fonts", "ttf, otf, woff, woff2"],
      ],
    },
  ];
  return (
    <Section pad="default" className="!pt-12 lg:!pt-16">
      <H2 className="max-w-3xl">11 folders, ready on <em>day one.</em></H2>
      <Lede>Created inside Downloads the first time a matching file arrives. Rename or reassign any of them.</Lede>
      <div className="mt-12 overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="flex items-center gap-2 border-b border-line px-5 py-3 text-sm text-muted-foreground">
          <FolderClosed size={15} className="text-accent" aria-hidden="true" />
          Downloads
        </div>
        <div className="grid md:grid-cols-3">
          {groups.map((g, gi) => (
            <div key={g.name} className={`px-5 py-5 ${gi > 0 ? "border-t border-line md:border-l md:border-t-0" : ""}`}>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className={`size-2 rounded-full ${g.dot}`} aria-hidden="true" />
                {g.name}
              </p>
              <ul className="mt-3 space-y-1">
                {g.folders.map(([name, exts]) => (
                  <li key={name} className="rounded-lg px-2.5 py-2 transition-colors hover:bg-background">
                    <span className="flex items-center gap-2.5 font-medium">
                      <FolderClosed size={16} className={`flex-none ${g.icon}`} aria-hidden="true" />
                      {name}
                    </span>
                    <span className="mt-0.5 block pl-[26px] font-mono text-[13px] text-muted-foreground">{exts}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1 border-t border-dashed border-line-strong px-5 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <span className="flex items-center gap-2.5 font-medium">
            <Plus size={16} className="flex-none text-accent" aria-hidden="true" />
            Anything else
          </span>
          <span className="pl-[26px] text-sm text-muted-foreground sm:pl-0 sm:text-right">You name the folder the first time</span>
        </div>
      </div>
    </Section>
  );
}

export function Install() {
  return (
    <Section id="install" pad="loose">
      <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-20">
        <div>
          <H2>Up and running <em>in a minute.</em></H2>
          <ol data-steps className="mt-12 space-y-6">
            <Step n={1}>
              Open <code translate="no" className="text-[0.875em] text-foreground">DownloadSorter.dmg</code> from your Downloads folder.
            </Step>
            <Step n={2}>Drag <Brand /> into your Applications folder, then open it from there.</Step>
            <Step n={3}>
              <b className="font-medium text-foreground">The first time, macOS will say it can’t verify the app.</b>{" "}
              That’s expected: the app is free and independent, so it isn’t signed with a paid Apple Developer ID. Confirm it once, the way that matches your Mac:
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-line bg-surface p-4">
                  <p className="text-sm font-semibold text-foreground">macOS&nbsp;15 Sequoia or later</p>
                  <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-base marker:text-accent">
                    <li>Double-click the app. When you see “Not Opened”, click <b className="font-medium text-foreground">Done</b>. Don’t click Move to Trash.</li>
                    <li>Open <b className="font-medium text-foreground">System Settings → Privacy &amp; Security</b> and scroll down to Security.</li>
                    <li>Click <b className="font-medium text-foreground">Open Anyway</b> next to <Brand />, then enter your password or use Touch ID.</li>
                  </ol>
                </div>
                <div className="rounded-xl border border-line bg-surface p-4">
                  <p className="text-sm font-semibold text-foreground">macOS&nbsp;13 Ventura or&nbsp;14 Sonoma</p>
                  <p className="mt-2 text-base">
                    Right-click the app, choose <b className="font-medium text-foreground">Open</b>, then click Open again.
                  </p>
                </div>
              </div>
              <p className="mt-3 flex items-start gap-2 text-sm text-accent">
                <ShieldCheck size={16} className="mt-0.5 flex-none" aria-hidden="true" />
                You only do this once. The code is public, so you can read exactly what the app does before you open it.
              </p>
            </Step>
            <Step n={4}>
              When macOS asks about your Downloads folder, click <b className="font-medium text-foreground">Allow</b>. The app needs this to move your files.
            </Step>
            <Step n={5} last>
              Look for a small tray with a down arrow in your <b className="font-medium text-foreground">menu bar</b> at the top of the screen. That’s <Brand />, and it’s working.
            </Step>
          </ol>
        </div>

        {/* The download, as a dark card that follows you down the long steps */}
        <div className="self-start lg:sticky lg:top-28">
          <div className="on-dark rounded-3xl bg-background p-7 text-foreground shadow-[0_30px_60px_-30px_rgba(26,14,8,0.55)]">
            <AppLogo size={44} />
            <p className="mt-5 text-xl font-semibold"><Brand />&nbsp;1.0</p>
            <p className="mt-1 text-sm text-muted-foreground tabular-nums">Free · 694&nbsp;KB · No account needed</p>
            <DownloadLink className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground transition-[translate,scale] hover:-translate-y-px hover:brightness-95 active:scale-[0.97]" />
            <ul className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm text-muted-foreground">
              <li className="flex gap-2"><Check size={16} className="mt-0.5 flex-none text-accent" aria-hidden="true" />macOS&nbsp;13 Ventura or later</li>
              <li className="flex gap-2"><Check size={16} className="mt-0.5 flex-none text-accent" aria-hidden="true" />Apple Silicon only (M1 or newer). Intel Macs aren’t supported yet.</li>
              <li className="flex gap-2"><Check size={16} className="mt-0.5 flex-none text-accent" aria-hidden="true" />Open source (MIT). <a className="text-foreground underline decoration-line-strong underline-offset-4 hover:decoration-accent" href={REPO}>Read the code</a></li>
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Step({ n, last = false, children }: { n: number; last?: boolean; children: ReactNode }) {
  return (
    <li className="relative flex gap-4 leading-relaxed text-muted-foreground">
      {/* Progress line down to the next step: a faint track, and a fill that grows as you read */}
      {!last && (
        <>
          <span aria-hidden="true" className="absolute left-[13px] top-8 -bottom-6 w-px bg-line" />
          <span aria-hidden="true" data-seg className="absolute left-[13px] top-8 -bottom-6 w-px origin-top bg-accent" />
        </>
      )}
      <span
        data-badge
        className="relative grid size-7 flex-none place-items-center rounded-full bg-primary text-sm font-medium tabular-nums text-primary-foreground transition-colors duration-500 data-[idle=true]:bg-line data-[idle=true]:text-muted-foreground"
      >
        {n}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">{children}</div>
    </li>
  );
}

/** The close and the footer share one dark band. */
export function ClosingCta() {
  const { isMac } = useDevice();
  const links = [
    isMac
      ? { href: "/DownloadSorter.dmg", label: "Download", download: true }
      : { href: "#install", label: "How to install", download: false },
    { href: REPO, label: "Source code", icon: CodeXml },
    { href: `${REPO}/issues`, label: "Report a problem", icon: ArrowUpRight },
  ];
  return (
    <div className="on-dark grain relative overflow-hidden bg-background">
      {/* The page ends where the hero began: the same file grid, now sorted */}
      <SortField mode="sorted" className="field-close z-0" />
      <Section pad="default" className="text-center">
        <div data-closing className="group/logo mx-auto w-fit">
          <AppLogo size={72} />
        </div>
        <h2 className="mx-auto mt-8 max-w-3xl text-[38px] leading-[1.04] tracking-[-0.035em] sm:text-5xl lg:text-[56px]">
          Let your Downloads <em>tidy themselves.</em>
        </h2>
        <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
          Free, tiny, and out of your way.
        </p>
        <div className="mt-9 flex flex-col items-center gap-4">
          <DownloadLink className={CTA_INK} />
          <DeviceNote className="max-w-xl text-balance text-sm text-muted-foreground" />
        </div>
      </Section>
      <footer className="relative z-[2] border-t border-line">
        <div className="pad-x mx-auto flex max-w-6xl flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <AppLogo size={36} />
            <div>
              <p className="font-semibold"><Brand /></p>
              <p className="text-sm text-muted-foreground">Version 1.0 · Free and open source (MIT)</p>
            </div>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {links.map(({ href, label, download, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(download ? { download: true } : {})}
                  className="inline-flex items-center gap-1.5 rounded-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {Icon && <Icon size={14} aria-hidden="true" />}
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </div>
  );
}
