"use client";

import { useState } from "react";
import { Dialog } from "./Dialog";
import { keepFocus, useKey } from "@/lib/keys";

const GROUPS: { title: string; keys: [keys: string[], does: string][] }[] = [
  {
    title: "Playing",
    keys: [
      [["A", "–", "Z"], "Type a letter"],
      [["Backspace"], "Delete a letter"],
      [["Enter"], "Submit the guess"],
      [["/"], "Open the clue, then Enter to reveal it"],
    ],
  },
  {
    title: "After a word",
    keys: [
      [["Enter"], "Next word"],
      [["Esc"], "Close the entry, keep the board"],
    ],
  },
  {
    title: "Anywhere",
    keys: [
      [["Enter"], "Begin, on the home screen"],
      [["Esc"], "Go back, or close what is open"],
      [["Tab"], "Move between buttons"],
      [["?"], "Show these shortcuts"],
    ],
  },
];

/**
 * The keyboard map. `?` opens it from any page; on a desktop, a faint corner
 * link says so. The link is hidden on touch screens and narrow windows (see
 * .keys-hint), where there is no keyboard to map and no spare corner.
 */
export function Shortcuts() {
  const [open, setOpen] = useState(false);
  useKey("?", () => setOpen(true));

  return <>
    <button className="keys-hint" onMouseDown={keepFocus} onClick={() => setOpen(true)} aria-keyshortcuts="Shift+?" aria-label="Keyboard shortcuts">
      <kbd>?</kbd> Shortcuts
    </button>
    {open && <Dialog title="Keyboard shortcuts" onClose={() => setOpen(false)} onEnter={() => setOpen(false)} className="clue-dialog keys-dialog">
      {GROUPS.map((group) => <section key={group.title} className="keys-group">
        <h2 className="keys-group-title">{group.title}</h2>
        <dl>
          {group.keys.map(([keys, does]) => <div key={does} className="keys-row">
            <dt>{keys.map((k, i) => k === "–" ? <span key={i} aria-label="to">–</span> : <kbd key={i}>{k}</kbd>)}</dt>
            <dd>{does}</dd>
          </div>)}
        </dl>
      </section>)}
    </Dialog>}
  </>;
}
