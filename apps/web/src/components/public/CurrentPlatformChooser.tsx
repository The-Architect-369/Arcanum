"use client";
import { createContext, useContext, useRef, useState } from "react";
const Choice = createContext<{
  value: string;
  choose: (value: string) => void;
} | null>(null);
export function PlatformChoiceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [value, choose] = useState("");
  return (
    <Choice.Provider value={{ value, choose }}>{children}</Choice.Provider>
  );
}
export default function CurrentPlatformChooser({
  android,
  web,
}: {
  android: React.ReactNode;
  web: React.ReactNode;
}) {
  const choice = useContext(Choice);
  const select = useRef<HTMLSelectElement>(null);
  const value = choice?.value ?? "";
  return (
    <>
      <label className="current-device-choice">
        Choose your device or web app
        <select
          ref={select}
          value={value}
          onChange={(event) => choice?.choose(event.target.value)}
        >
          <option value="">Choose an option</option>
          <option value="Android">
            Android — development download available
          </option>
          {["iPhone / iPad", "Windows", "macOS", "Linux"].map((name) => (
            <option key={name} value={name}>
              {name} — no native release available
            </option>
          ))}
          <option value="web">Arcanum Current — web app</option>
        </select>
      </label>
      {value && (
        <section
          className="current-selected-platform"
          aria-label="Selected availability"
        >
          <button
            className="current-action"
            type="button"
            onClick={() => {
              choice?.choose("");
              select.current?.focus();
            }}
          >
            ← Change selection
          </button>
          <h3>{value === "web" ? "Arcanum Current — web app" : value}</h3>
          <span className="updates-status-pill">
            {value === "web"
              ? "Browser access available"
              : value === "Android"
                ? "Development download available"
                : "No download available"}
          </span>
          {value === "Android" ? (
            android
          ) : value === "web" ? (
            web
          ) : (
            <>
              <p>There isn’t a release for this platform yet.</p>
              <p>
                This listing does not establish an active development or
                delivery commitment for {value}. You can read Arcanum Current in
                a compatible browser.
              </p>
              <a className="current-action" href="/updates?view=next">
                Follow development →
              </a>
              <p>
                No platform-specific published work is listed yet; explore the
                wider project directions.
              </p>
            </>
          )}
        </section>
      )}
    </>
  );
}
