"use client";

import type { MouseEvent } from "react";

function handOff(event: MouseEvent<HTMLAnchorElement>) {
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const icon = event.currentTarget.querySelector(".handoff-icon");
  icon?.firstElementChild?.animate(
    [{ opacity: 1 }, { opacity: 0, transform: "scale(.8)" }, { opacity: 1 }],
    560,
  );
  icon?.lastElementChild?.animate(
    [{ opacity: 0 }, { opacity: 1, transform: "scale(1.08)" }, { opacity: 0 }],
    560,
  );
  navigator.vibrate?.(12);
}

export default function DownloadAndroid({ url }: { url: string }) {
  return (
    <a className="download-primary" href={url} onClick={handOff}>
      <span className="handoff-icon" aria-hidden="true">
        <img src="/current-icons/hope-subject.svg" alt="" />
        <img src="/current-icons/arcnet-subject.svg" alt="" />
      </span>
      Download for Android
    </a>
  );
}
