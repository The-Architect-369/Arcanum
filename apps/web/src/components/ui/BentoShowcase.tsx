"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { cn } from "@/lib/cn";
import { copy } from "@/content/narrative";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Variant = "arcnet" | "mana" | "tempus";

export default function BentoShowcase({ variant, className }: { variant: Variant; className?: string }) {
  const data = copy.showcase[variant];
  const [items, setItems] = useState(data.items);
  const [mobileIndex, setMobileIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const controls = useAnimation();

  const tileWidth = 320;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setItems(data.items);
    setMobileIndex(0);
  }, [data.items, variant]);

  const cycleDesktop = async (direction: number) => {
    const shift = -direction * tileWidth;

    await controls.set({ x: 0 });

    await controls.start({
      x: shift,
      transition: { duration: 0.45, ease: [0.45, 0, 0.55, 1] },
    });

    setItems((prev) => {
      const updated = [...prev];
      if (direction === 1) {
        updated.push(updated.shift()!);
      } else {
        updated.unshift(updated.pop()!);
      }
      return updated;
    });

    await controls.set({ x: 0 });
  };

  const nextMobile = () => setMobileIndex((prev) => (prev + 1) % data.items.length);
  const prevMobile = () => setMobileIndex((prev) => (prev - 1 + data.items.length) % data.items.length);

  const handleMobileDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 50) prevMobile();
    else if (info.offset.x < -50) nextMobile();
  };

  const handleDesktopDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 50) cycleDesktop(-1);
    else if (info.offset.x < -50) cycleDesktop(1);
  };

  return (
    <div
      className={cn(
        "relative mx-auto flex w-full max-w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[var(--bg-deep)] text-center shadow-lg backdrop-blur-md",
        "min-h-[440px] sm:min-h-[540px] md:min-h-[620px]",
        className
      )}
    >
      <div className="flex flex-col items-center justify-center px-5 py-6 sm:px-6 sm:py-8">
        <h2 className="h2 gradient-text mb-2">{data.heading}</h2>
        {data.sub && <p className="lead max-w-prose opacity-90">{data.sub}</p>}
      </div>

      <div className="relative flex-1 select-none overflow-hidden px-3 pb-4 sm:px-6 sm:pb-6">
        {isMobile ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <div className="relative flex w-full items-center justify-center">
              <button
                type="button"
                onClick={prevMobile}
                className="absolute left-0 z-20 rounded-full border border-white/20 bg-white/10 p-2 backdrop-blur-sm hover:bg-white/20"
                aria-label={`Previous ${data.heading} card`}
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>

              <div className="mx-10 flex w-full max-w-[420px] items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${variant}-${mobileIndex}`}
                    initial={{ opacity: 0, y: 18, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    drag="x"
                    dragElastic={0.16}
                    onDragEnd={handleMobileDragEnd}
                    className="w-full"
                  >
                    <article className="flex min-h-[320px] w-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-6 text-center backdrop-blur-lg shadow-[0_0_25px_rgba(180,255,255,0.18)]">
                      <Image
                        src={data.items[mobileIndex].image || "/logo-arcanum.svg"}
                        alt={data.items[mobileIndex].title}
                        width={72}
                        height={72}
                        className="mx-auto mb-4 object-contain"
                      />
                      <h4 className="mb-2 text-lg font-semibold text-white">
                        {data.items[mobileIndex].title}
                      </h4>
                      <p className="max-w-[92%] text-sm text-white/90 opacity-85">
                        {data.items[mobileIndex].body}
                      </p>
                    </article>
                  </motion.div>
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={nextMobile}
                className="absolute right-0 z-20 rounded-full border border-white/20 bg-white/10 p-2 backdrop-blur-sm hover:bg-white/20"
                aria-label={`Next ${data.heading} card`}
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              {data.items.map((item, index) => (
                <button
                  key={`${variant}-dot-${item.title}-${index}`}
                  type="button"
                  onClick={() => setMobileIndex(index)}
                  className={cn(
                    "h-2.5 w-2.5 rounded-full border border-white/20 transition-all",
                    index === mobileIndex ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.65)]" : "bg-white/20"
                  )}
                  aria-label={`Go to ${item.title}`}
                  aria-pressed={index === mobileIndex}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="relative flex h-full items-center justify-center overflow-hidden">
            <button
              type="button"
              onClick={() => cycleDesktop(-1)}
              className="absolute left-3 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-2 backdrop-blur-sm hover:bg-white/20"
              aria-label={`Previous ${data.heading} card`}
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>

            <button
              type="button"
              onClick={() => cycleDesktop(1)}
              className="absolute right-3 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-2 backdrop-blur-sm hover:bg-white/20"
              aria-label={`Next ${data.heading} card`}
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>

            <motion.div
              className="flex h-full items-center justify-center gap-8"
              animate={controls}
              drag="x"
              dragElastic={0.2}
              onDragEnd={handleDesktopDragEnd}
            >
              {items.map((item, i) => (
                <motion.div
                  key={`${item.title}-${i}`}
                  className={cn(
                    "flex aspect-square w-[320px] flex-shrink-0 flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 text-center backdrop-blur-lg transition-all duration-500",
                    i === 2 ? "scale-105 shadow-[0_0_25px_rgba(180,255,255,0.6)]" : "scale-95 opacity-80"
                  )}
                >
                  <Image
                    src={item.image || "/logo-arcanum.svg"}
                    alt={item.title}
                    width={60}
                    height={60}
                    className="mx-auto mb-4 object-contain"
                  />
                  <h4 className="mb-2 font-semibold text-white">{item.title}</h4>
                  <p className="mx-auto max-w-[90%] text-sm text-white/90 opacity-80">{item.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
