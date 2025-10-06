"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SquareCarousel({ items }: { items: { title: string; body: string }[] }) {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [frame, setFrame] = useState(280); // px, updated on resize

  useEffect(() => {
    function measure() {
      if (!containerRef.current) return;
      // leave a little padding for the ring
      setFrame(Math.max(200, Math.floor(containerRef.current.clientWidth)));
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // clamp index into range
  useEffect(() => {
    setIndex((i) => Math.max(0, Math.min(items.length - 1, i)));
  }, [items.length]);

  const xOffset = useMemo(() => -index * frame, [index, frame]);

  return (
    <div ref={containerRef} className="relative isolate w-full">
      {/* viewport */}
      <div className="overflow-hidden rounded-2xl ring-1 ring-white/10 h-44 sm:h-48">
        <motion.div
          className="flex h-full"
          drag="x"
          dragConstraints={{ left: -(items.length - 1) * frame, right: 0 }}
          dragElastic={0.1}
          animate={{ x: xOffset }}
          transition={{ type: "spring", stiffness: 200, damping: 28 }}
          onDragEnd={(_, info) => {
            const threshold = 40; // px
            const velocity = info.velocity.x;
            let next = index;
            if (info.offset.x < -threshold || velocity < -300) next = index + 1;
            if (info.offset.x > threshold || velocity > 300) next = index - 1;
            setIndex(Math.max(0, Math.min(items.length - 1, next)));
          }}
          style={{ width: frame * items.length }}
        >
          {items.map((it, i) => (
            <div
              key={i}
              className="shrink-0 h-full w-full grid place-items-center bg-white/3 px-4 text-center"
              style={{ width: frame }}
            >
              <div>
                <div className="text-sm font-semibold tracking-tight">{it.title}</div>
                <div className="mt-1 text-xs text-white/70">{it.body}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* dots */}
      <div className="mt-2 flex items-center justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 w-2 rounded-full transition ${
              i === index ? "bg-cyan-400" : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
