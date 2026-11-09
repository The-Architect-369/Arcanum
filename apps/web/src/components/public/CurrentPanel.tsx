"use client";
import { useEffect, useId, useRef } from "react";
export default function CurrentPanel({
  title,
  label,
  onClose,
  children,
}: {
  title: string;
  label: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const returnTo = useRef<HTMLElement | null>(null);
  const ownsEntry = useRef(false);
  const finished = useRef(false);
  const closing = useRef(false);
  function requestClose() {
    if (closing.current) return;
    if (ownsEntry.current && history.state?.arcanumCurrentPanel === titleId) {
      closing.current = true;
      history.back();
    } else dialog.current?.close();
  }
  useEffect(() => {
    returnTo.current = document.activeElement as HTMLElement;
    history.pushState(
      { ...history.state, arcanumCurrentPanel: titleId },
      "",
      location.href,
    );
    ownsEntry.current = true;
    const back = () => {
      ownsEntry.current = false;
      dialog.current?.close();
    };
    window.addEventListener("popstate", back);
    dialog.current?.showModal();
    close.current?.focus();
    return () => window.removeEventListener("popstate", back);
  }, [titleId]);
  return (
    <dialog
      ref={dialog}
      className="updates-post-panel"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClose={() => {
        if (finished.current) return;
        finished.current = true;
        returnTo.current?.focus({ preventScroll: true });
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div className="updates-post-panel-content">
        <div className="updates-post-panel-top">
          <p className="updates-meta">{label}</p>
          <button
            ref={close}
            type="button"
            aria-label="Close panel"
            onClick={requestClose}
          >
            Close ×
          </button>
        </div>
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </dialog>
  );
}
