const publicRoutes = new Set([
  "/",
  "/experience/v07/index.html",
  "/experience/v07/style.c1b4a6732d75.css",
  "/experience/v07/app.51b8278c670a.js",

  "/about",
  "/explore",
  "/principles",
  "/updates",
  "/updates-sw.js",
  "/current-icons/arcnet-subject.svg",
  "/current-icons/hope-pearl.svg",
  "/current-icons/hope-subject.svg",
  "/current-icons/icon-192.png",
  "/current-icons/icon-512.png",
  "/current-icons/maskable-192.png",
  "/current-icons/maskable-512.png",
  "/current-icons/native-mark.svg",
  "/current-icons/native-symbol.svg",
  "/current-icons/tempus-subject.svg",
  "/current-icons/vitae-subject.svg",
  "/updates/manifest.webmanifest",
  "/updates/offline.html",
  "/download",
  "/journeys",
  "/architect",
  "/architect/login",
  // Device-gate exception only; this page enforces owner authentication server-side.
  "/architect/review",
  "/site-log.json",
  "/art/hope-architect-v2.png",
  ...["tempus", "hope", "vitae", "arcnet", "mana"].map(
    (slug) => `/explore/${slug}`,
  ),
]);

export function isPublicSitePath(pathname: string) {
  return publicRoutes.has(pathname) || /^\/updates\/[a-z0-9-]+$/.test(pathname);
}
