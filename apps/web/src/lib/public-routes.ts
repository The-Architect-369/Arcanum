const publicRoutes = new Set([
  "/",
  "/experience/v07/index.html",
  "/experience/v07/style.c1b4a6732d75.css",
  "/experience/v07/app.51b8278c670a.js",

  "/about",
  "/explore",
  "/principles",
  "/updates",
  "/download",
  "/journeys",
  "/architect",
  "/site-log.json",
  "/art/hope-architect-v2.png",
  ...["tempus", "hope", "vitae", "arcnet", "mana"].map(
    (slug) => `/explore/${slug}`,
  ),
]);

export function isPublicSitePath(pathname: string) {
  return publicRoutes.has(pathname);
}
