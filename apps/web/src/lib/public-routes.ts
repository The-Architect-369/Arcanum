const publicRoutes = new Set([
  "/",
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
