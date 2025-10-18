"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
import { cn } from "@shared/lib/cn";
import { copy } from "@/content/narrative";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Variant = "arcnet" | "mana" | "tempus";

export default function BentoShowcaseV12_4({ variant, className }: { variant: Variant; className?: string }) {
  const data = copy.showcase[variant];
  const [items, setItems] = useState(data.items);
  const [offset, setOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const controls = useAnimation();

  const tileWidth = 320;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Smooth and directional carousel movement
  const cycle = async (direction: number) => {
    const shift = -direction * tileWidth; // reversed for natural direction

    // Reset first to prevent stickiness
    await controls.set({ x: 0 });

    // Animate to the next tile smoothly
    await controls.start({
      x: shift,
      transition: { duration: 0.5, ease: [0.45, 0, 0.55, 1] },
    });

    // Reorder items based on direction
    setItems((prev) => {
      const updated = [...prev];
      if (direction === 1) {
        // move first to end (rightward motion)
        updated.push(updated.shift()!);
      } else {
        // move last to start (leftward motion)
        updated.unshift(updated.pop()!);
      }
      return updated;
    });

    // Reset position immediately after reorder to maintain seamless loop
    await controls.set({ x: 0 });
  };

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 50) cycle(-1); // swipe right, move left
    else if (info.offset.x < -50) cycle(1); // swipe left, move right
  };

  return (
    <div
      className={cn(
        "relative w-full max-w-[94vw] sm:max-w-[720px] md:max-w-[960px] lg:max-w-[1100px] mx-auto",
        "min-h-[480px] sm:min-h-[560px] md:min-h-[640px] lg:min-h-[720px]",
        "rounded-2xl bg-[var(--bg-deep)] backdrop-blur-md border border-white/10 shadow-lg overflow-hidden",
        "flex flex-col text-center divide-y divide-white/5",
        className
      )}
    >
      {/* Top 25% */}
      <div className="flex flex-col items-center justify-center flex-[0.25_1_0%] py-8 px-6">
        <h2 className="h2 gradient-text mb-2">{data.heading}</h2>
        {data.sub && <p className="lead max-w-prose opacity-90">{data.sub}</p>}
      </div>

      {/* Bottom 75% */}
      <div className="relative flex-[0.75_1_0%] w-full select-none flex items-center justify-center overflow-hidden">
        {/* Arrows */}
        {!isMobile && (
          <>
            <button
              onClick={() => cycle(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 z-30"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>

            <button
              onClick={() => cycle(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 z-30"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </>
        )}

        {/* Continuous Carousel Track */}
        <motion.div
          className="flex items-center justify-center gap-8 h-full z-20"
          animate={controls}
          drag={isMobile ? "x" : false}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
        >
          {items.map((item, i) => (
            <motion.div
              key={`${item.title}-${i}`}
              className={cn(
                "flex-shrink-0 border border-white/10 rounded-xl bg-white/5 backdrop-blur-lg aspect-square flex flex-col items-center justify-center text-center transition-all duration-500",
                i === 2 ? "scale-105 shadow-[0_0_25px_rgba(180,255,255,0.6)]" : "opacity-80 scale-95"
              )}
              style={{ width: `${tileWidth}px` }}
            >
              <Image
                src={item.image || "/logo-arcanum.svg"}
                alt={item.title}
                width={60}
                height={60}
                className="object-contain mx-auto mb-4"
              />
              <h4 className="font-semibold mb-2 text-white">{item.title}</h4>
              <p className="text-sm opacity-80 text-white/90 max-w-[90%] mx-auto">{item.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
