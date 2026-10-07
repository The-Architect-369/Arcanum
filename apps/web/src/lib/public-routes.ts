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
  ...["tempus", "hope", "vitae", "arcnet", "mana"].map(
    (slug) => `/explore/${slug}`,
  ),
]);

export function isPublicSitePath(pathname: string) {
  return publicRoutes.has(pathname);
}
