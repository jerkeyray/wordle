"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useKey } from "@/lib/keys";

interface BackButtonProps {
  href: string;
}

/**
 * Back, as an icon button the same size as the one in the opposite corner.
 *
 * It used to be the word "BACK" floating above the content, which read as a
 * stray label rather than a control and left the header unbalanced.
 *
 * Escape does the same from anywhere on the page, unless a dialog is open:
 * then Escape closes the dialog first.
 */
export function BackButton({ href }: BackButtonProps) {
  const router = useRouter();
  useKey("Escape", () => router.push(href));
  return (
    <Link className="icon-button" href={href} aria-label="Back" title="Back (Esc)" aria-keyshortcuts="Escape">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M15 5l-7 7 7 7"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
