"use client";

import { useState, useSyncExternalStore } from "react";
import styles from "./fullscreen-button.module.css";

function subscribe(onChange: () => void) {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}

function getSnapshot() {
  if (document.fullscreenElement) return "fullscreen";
  return document.fullscreenEnabled ? "available" : "unavailable";
}

function getServerSnapshot() {
  return "unavailable";
}

export default function FullscreenButton() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const isFullscreen = state === "fullscreen";
  const label = isFullscreen ? "Sair da tela cheia" : "Tela cheia";

  async function toggleFullscreen() {
    setError("");
    setPending(true);
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      setError("Não foi possível alterar a tela cheia. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  if (state === "unavailable") return null;

  return (
    <div className={styles.control} data-fullscreen={isFullscreen}>
      <button
        type="button"
        className={styles.button}
        onClick={toggleFullscreen}
        disabled={pending}
        aria-label={label}
        aria-pressed={isFullscreen}
        title={error || label}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d={isFullscreen ? "M3 8h5V3m8 0v5h5M3 16h5v5m8 0v-5h5" : "M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5"} />
        </svg>
        {label}
      </button>
      <span className={styles.status} role="status">{error}</span>
    </div>
  );
}
