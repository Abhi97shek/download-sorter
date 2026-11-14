import { Download, Mail } from "lucide-react";
import { sendToMacHref, useDevice } from "@/lib/device";
import { Brand } from "@/components/brand";

/**
 * The page’s one download action. On a Mac it downloads the DMG; on a phone,
 * tablet, Windows or Linux it offers to email the page’s link to open on a Mac.
 */
export function DownloadLink({
  variant = "full",
  className = "",
}: {
  variant?: "full" | "compact";
  className?: string;
}) {
  const { isMac } = useDevice();

  if (!isMac) {
    return (
      <a href={sendToMacHref()} className={className}>
        <Mail size={variant === "full" ? 18 : 15} aria-hidden="true" />
        {variant === "full" ? "Email this page" : "Send to Mac"}
      </a>
    );
  }
  return (
    <a href="/DownloadSorter.dmg" download className={`group/dl ${className}`}>
      <Download
        size={variant === "full" ? 18 : 15}
        aria-hidden="true"
        className="transition-transform duration-300 ease-out group-hover/dl:translate-y-0.5 group-focus-visible/dl:translate-y-0.5"
      />
      {variant === "full" ? "Download for Mac" : "Download"}
    </a>
  );
}

/** The short line under the main download button, honest about what this device can do. */
export function DeviceNote({ className = "" }: { className?: string }) {
  const { isMac, isIntel } = useDevice();
  if (!isMac) {
    return (
      <p className={className}>
        <Brand /> is a Mac app. Open this page on your Mac to download it.
      </p>
    );
  }
  if (isIntel) {
    return (
      <p className={`${className} text-accent`}>
        This looks like an Intel Mac. This version needs Apple Silicon (M1 or newer), so it won’t run here yet.
      </p>
    );
  }
  return (
    <p className={`${className} tabular-nums`}>
      macOS 13+ · Apple Silicon (M1 or newer) · 694 KB · No account needed
    </p>
  );
}
