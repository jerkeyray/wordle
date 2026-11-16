"use client";

import { useEffect, useRef, type MouseEvent } from "react";

/**
 * Whether a key press is free for a page-level shortcut: no modifier (so the
 * browser's own shortcuts keep working), not mid-composition, no dialog open
 * (it owns the keyboard while it is up), and not typing into a field.
 */
export function isFreeKey(e: KeyboardEvent): boolean {
  if (e.metaKey || e.ctrlKey || e.altKey || e.isComposing) return false;
  if (document.querySelector("dialog[open]")) return false;
  return !(e.target instanceof HTMLElement && e.target.closest("input, textarea, select, [contenteditable=true]"));
}

/** Enter on a focused button or link already activates it; a shortcut must not fire too. */
export function isOnControl(e: KeyboardEvent): boolean {
  return e.target instanceof HTMLElement && !!e.target.closest("button, a, summary");
}

/**
 * Binds one key to an action for as long as `enabled` holds. Enter yields to
 * a focused control, so Tab-and-Enter still does what the focus ring says.
 */
export function useKey(key: string, action: () => void, enabled = true) {
  const latest = useRef(action);
  useEffect(() => { latest.current = action; });
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== key || e.repeat || !isFreeKey(e)) return;
      if (key === "Enter" && isOnControl(e)) return;
      e.preventDefault();
      latest.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key, enabled]);
}

/**
 * For on-screen controls that sit beside physical typing (the letter keys,
 * Submit): clicking one must not take focus, or the next physical Enter would
 * press that button again instead of submitting the guess.
 */
export const keepFocus = (e: MouseEvent) => e.preventDefault();
