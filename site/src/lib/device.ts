import { useEffect, useState } from "react";

export type Device = {
  /** A real Mac that can run the app. False on phones, tablets, Windows and Linux. */
  isMac: boolean;
  /** Positively detected Intel Mac. Only Chromium browsers can tell; Safari can't, so this is false there. */
  isIntel: boolean;
};

type UAData = { getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string }> };

function detectMac(): boolean {
  if (typeof navigator === "undefined") return true;
  const ua = navigator.userAgent;
  // iPadOS reports itself as a Mac but has a touch screen.
  const touch = navigator.maxTouchPoints > 1;
  return /Macintosh|Mac OS X/.test(ua) && !touch && !/iPhone|iPad|iPod|Android/.test(ua);
}

export function useDevice(): Device {
  const [device, setDevice] = useState<Device>(() => ({ isMac: detectMac(), isIntel: false }));

  useEffect(() => {
    const uaData = (navigator as Navigator & { userAgentData?: UAData }).userAgentData;
    if (!device.isMac || !uaData?.getHighEntropyValues) return;
    let cancelled = false;
    uaData
      .getHighEntropyValues(["architecture"])
      .then((v) => {
        if (!cancelled && v.architecture === "x86") setDevice({ isMac: true, isIntel: true });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [device.isMac]);

  return device;
}

/** A link that opens the visitor's email app with this page's address, to open on a Mac later. */
export function sendToMacHref(): string {
  const url = typeof location !== "undefined" ? location.origin : "";
  const subject = encodeURIComponent("Download Sorter for Mac");
  const body = encodeURIComponent(`Open this on your Mac to download Download Sorter:\n${url}`);
  return `mailto:?subject=${subject}&body=${body}`;
}
