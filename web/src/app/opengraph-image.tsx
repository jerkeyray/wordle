import { ImageResponse } from "next/og";

// Default (Node) runtime: Vercel Services cannot deploy Edge functions, and
// with no dynamic inputs this image is rendered once at build time anyway.
export const alt = "Wordle: a solved board for SOLACE beside its dictionary entry";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The app's light-theme tokens (styles/tokens-base.css) on a plain white page.
const C = {
  bg: "#ffffff",
  raised: "#fcf0f4",
  rule: "#eed7df",
  text: "#2a1620",
  muted: "#8b6575",
  faint: "#b08e9c",
  hit: "#12907a",
  hitText: "#f1fbf8",
  present: "#c2356f",
  presentText: "#fff5f9",
  absent: "#dcccd2",
  absentText: "#6f5b65",
};

type Mark = "hit" | "present" | "absent";
const TILE: Record<Mark, { bg: string; fg: string }> = {
  hit: { bg: C.hit, fg: C.hitText },
  present: { bg: C.present, fg: C.presentText },
  absent: { bg: C.absent, fg: C.absentText },
};

// A real game against a real bank answer, marked the way the server marks it.
const ANSWER = { word: "solace", partOfSpeech: "noun", definition: "Comfort in sadness or loss." };
const ROWS: { guess: string; marks: Mark[] }[] = [
  { guess: "planet", marks: ["absent", "present", "present", "absent", "present", "absent"] },
  { guess: "social", marks: ["hit", "hit", "present", "absent", "present", "present"] },
  { guess: "solace", marks: ["hit", "hit", "hit", "hit", "hit", "hit"] },
];

const TAGLINE = "Solve words. Keep the good ones.";
const HOST = "wordle.jerkeyray.com";

/**
 * Fetches just the glyphs the card uses from Google Fonts. The legacy user
 * agent makes it serve woff, which Satori can read (it cannot read woff2). On
 * failure the card falls back to the default font rather than failing the build.
 */
async function loadFont(family: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`,
      { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.30 (KHTML, like Gecko) Safari/534.30" } },
    ).then((res) => res.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:woff|truetype|opentype)'\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((res) => res.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const serifText = "Wordle" + ROWS.map((r) => r.guess.toUpperCase()).join("") + ANSWER.word;
  const [serif, serifItalic, sans] = await Promise.all([
    loadFont("Fraunces:wght@600", serifText),
    loadFont("Fraunces:ital,wght@1,400", ANSWER.definition),
    loadFont("Instrument+Sans:wght@500", TAGLINE + HOST + ANSWER.partOfSpeech.toUpperCase()),
  ]);
  const fonts = [
    serif && { name: "Fraunces", data: serif, weight: 600 as const, style: "normal" as const },
    serifItalic && { name: "Fraunces", data: serifItalic, weight: 400 as const, style: "italic" as const },
    sans && { name: "Instrument Sans", data: sans, weight: 500 as const, style: "normal" as const },
  ].filter((f) => !!f);

  return new ImageResponse(
    (
      <div style={{ background: C.bg, display: "flex", height: "100%", width: "100%", padding: "72px 80px", fontFamily: "Instrument Sans" }}>
        {/* Left: who this is. */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 470 }}>
          <div style={{ display: "flex", flexWrap: "wrap", width: 76, gap: 8 }}>
            {[C.hit, C.absent, C.absent, C.present].map((color, i) => <div key={i} style={{ background: color, borderRadius: 8, height: 34, width: 34 }} />)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", color: C.text, fontFamily: "Fraunces", fontSize: 112, fontWeight: 600, letterSpacing: -3, lineHeight: 1 }}>Wordle</div>
            <div style={{ display: "flex", flexDirection: "column", color: C.muted, fontSize: 34, lineHeight: 1.3 }}>
              {TAGLINE.split(/(?<=\.) /).map((line) => <div key={line} style={{ display: "flex" }}>{line}</div>)}
            </div>
          </div>
          <div style={{ display: "flex", color: C.faint, fontSize: 24 }}>{HOST}</div>
        </div>

        {/* Right: what it is. A solved board, and the word you keep. */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", marginLeft: "auto", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ROWS.map((row) => (
              <div key={row.guess} style={{ display: "flex", gap: 10 }}>
                {row.guess.toUpperCase().split("").map((letter, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 76, height: 76, borderRadius: 10, background: TILE[row.marks[i]].bg, color: TILE[row.marks[i]].fg, fontFamily: "Fraunces", fontSize: 42, fontWeight: 600 }}>{letter}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, background: C.raised, border: `1px solid ${C.rule}`, borderRadius: 16, padding: "22px 28px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
              <div style={{ display: "flex", color: C.text, fontFamily: "Fraunces", fontSize: 40, fontWeight: 600 }}>{ANSWER.word}</div>
              <div style={{ display: "flex", color: C.faint, fontSize: 18, letterSpacing: 2 }}>{ANSWER.partOfSpeech.toUpperCase()}</div>
            </div>
            <div style={{ display: "flex", color: C.muted, fontFamily: "Fraunces", fontStyle: "italic", fontSize: 28 }}>{ANSWER.definition}</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
