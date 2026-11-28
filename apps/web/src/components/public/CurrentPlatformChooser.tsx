"use client";

import { useRef, useState, type ReactNode } from "react";
import ArcanumMark from "./ArcanumMark";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useCurrentNavigation } from "./CurrentExperience";

const platforms = [
  "Android",
  "iPhone/iPad",
  "Windows",
  "macOS",
  "Linux",
  "Arcanum Current (web app)",
] as const;
type Platform = (typeof platforms)[number];
const webApp = platforms[5];

export default function CurrentPlatformChooser({
  buildName,
  android,
  web,
}: {
  buildName?: string;
  android: ReactNode;
  web: ReactNode;
}) {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [showRelease, setShowRelease] = useState(false);
  const buildButton = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const choices = useRef<HTMLDivElement>(null);
  const nav = useCurrentNavigation();
  function togglePlatforms() {
    setExpanded(!expanded);
    if (!expanded)
      requestAnimationFrame(() =>
        choices.current
          ?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
          ?.focus(),
      );
  }
  function choose(value: Platform) {
    if (value !== platform) setShowRelease(false);
    setPlatform(value);
    setExpanded(false);
    requestAnimationFrame(() => heading.current?.focus());
  }
  function back() {
    if (platform === "Android" && showRelease) {
      setShowRelease(false);
      requestAnimationFrame(() => buildButton.current?.focus());
    } else {
      togglePlatforms();
    }
  }
  const packageOpen =
    !expanded && platform === "Android" && showRelease && !!buildName;
  return (
    <>
      <h2 className={packageOpen ? "sr-only" : "download-title"}>Downloads</h2>
      <button
        type="button"
        className="download-chooser"
        hidden={packageOpen}
        aria-expanded={expanded}
        aria-controls="current-platforms"
        onClick={togglePlatforms}
      >
        <span>{platform ?? "Choose your platform"}</span>
        <ChevronDown size={18} aria-hidden="true" />
      </button>
      <div
        ref={choices}
        id="current-platforms"
        role="group"
        aria-label="Platforms"
        hidden={!expanded}
      >
        {platforms.map((value) => (
          <button
            type="button"
            key={value}
            className="download-option"
            aria-pressed={platform === value}
            onClick={() => choose(value)}
          >
            <span>{value}</span>
            <small>
              {value === "Android" && buildName
                ? "APK"
                : value === webApp
                  ? "Install"
                  : "Unavailable"}
            </small>
          </button>
        ))}
      </div>
      {!expanded && platform && (
        <div
          className={
            packageOpen ? "download-step package-entry" : "download-step"
          }
        >
          <div className="download-context">
            <button type="button" className="download-back" onClick={back}>
              ← Back
            </button>
            {packageOpen && <span>{buildName}</span>}
          </div>
          <h3 ref={heading} tabIndex={-1} className="package-heading">
            {platform === webApp ? (
              "Install Arcanum Current (web app)"
            ) : (
              <>
                <ArcanumMark />{" "}
                <span>
                  for{" "}
                  {platform === "iPhone/iPad" ? "iPhone and iPad" : platform}
                </span>
              </>
            )}
          </h3>
          {platform === "Android" && buildName ? (
            showRelease ? (
              android
            ) : (
              <button
                type="button"
                ref={buildButton}
                className="download-option"
                onClick={() => {
                  setShowRelease(true);
                  requestAnimationFrame(() => heading.current?.focus());
                }}
              >
                Choose {buildName}
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            )
          ) : platform === webApp ? (
            web
          ) : (
            <>
              <p>There is no published Arcanum package for {platform}.</p>
              <a
                className="download-primary"
                href="/updates"
                onClick={(event) => {
                  if (
                    nav &&
                    !event.metaKey &&
                    !event.ctrlKey &&
                    !event.shiftKey &&
                    !event.altKey
                  ) {
                    event.preventDefault();
                    nav.navigate("updates");
                  }
                }}
              >
                Follow development updates →
              </a>
            </>
          )}
        </div>
      )}
    </>
  );
}
