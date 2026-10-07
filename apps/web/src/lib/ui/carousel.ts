/** Shared cyclic navigation, extracted from the existing BentoShowcase. */
export function cycleIndex(index: number, direction: number, count: number) {
  return (((index + direction) % count) + count) % count;
}

/** Retain BentoShowcase's 50px threshold; vertical page scrolling wins. */
export function carouselSwipe(dx: number, dy: number) {
  if (Math.abs(dx) <= 50 || Math.abs(dx) <= Math.abs(dy) * 1.5) return 0;
  return dx < 0 ? 1 : -1;
}
