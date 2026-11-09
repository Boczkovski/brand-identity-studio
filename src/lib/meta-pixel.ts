// Meta Pixel for the PODER landing page. One pixel, three events:
// PageView (site visit), Lead (registration saved), Contact (WhatsApp group click).
export const META_PIXEL_ID = "1679884870159342";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: Fbq;
  loaded: boolean;
  version: string;
};
declare global {
  interface Window { fbq?: Fbq; _fbq?: Fbq }
}

const CONSENT_KEY = "poder_ads_consent"; // "granted" | "denied"
const CONSENT_REGIONS = new Set(["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","IS","LI","NO","GB","CH"]);

let regionPromise: Promise<boolean> | null = null;
/** true when the visitor must give consent before advertising tracking. */
export function needsConsent(): Promise<boolean> {
  regionPromise ??= (async () => {
    try {
      const res = await fetch("/cdn-cgi/trace", { signal: AbortSignal.timeout(2000) });
      if (!res.ok) return true;
      const text = await res.text();
      const get = (k: string) => text.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1]?.trim();
      const loc = get("loc"), host = get("h");
      if (!loc || loc === "XX" || loc === "T1" || (host && host !== location.host)) return true;
      return CONSENT_REGIONS.has(loc);
    } catch { return true; }
  })();
  return regionPromise;
}

export const getConsent = () => (typeof localStorage === "undefined" ? null : localStorage.getItem(CONSENT_KEY));
export function setConsent(value: "granted" | "denied") {
  localStorage.setItem(CONSENT_KEY, value);
  localStorage.setItem(`${CONSENT_KEY}_at`, new Date().toISOString());
  localStorage.setItem(`${CONSENT_KEY}_notice`, "poder-cookies-2026-11-09");
  if (value === "granted") void initPixel(); else window.fbq?.("consent", "revoke");
}

function gpc() { return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true; }

async function allowed() {
  if (!META_PIXEL_ID || gpc()) return false;
  const c = getConsent();
  if (c === "denied") return false;
  if (c === "granted") return true;
  return !(await needsConsent());
}

let initialized = false;
export async function initPixel() {
  if (initialized || !(await allowed())) return;
  initialized = true;
  if (!window.fbq) {
    const n = function (...args: unknown[]) {
      if (n.callMethod) n.callMethod.apply(n, args); else n.queue.push(args);
    } as Fbq;
    n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
    window.fbq = n; window._fbq ??= n;
    const s = document.createElement("script");
    s.async = true; s.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(s);
  }
  window.fbq("consent", "grant");
  window.fbq("init", META_PIXEL_ID, {}, { agent: "lovable" });
  window.fbq("track", "PageView");
}

export async function trackPixel(event: "Lead" | "Contact") {
  if (!initialized || !(await allowed())) return;
  window.fbq?.("track", event, {}, { eventID: crypto.randomUUID() });
}
