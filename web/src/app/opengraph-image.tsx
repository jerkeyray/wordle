import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Default (Node) runtime: Vercel Services cannot deploy Edge functions, and
// with no dynamic inputs this image is rendered once at build time anyway.
export const alt = "Wordle";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The app icon's palette (app/icon.svg): dark ink, with the dark theme's marks.
const C = {
  bg: "#1a1016",
  ink: "#f4eef1",
  hit: "#2fb894",
  present: "#e0568f",
  absent: "#3a2b34",
};

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

/** The site's floral watermark (public/floral.svg), inked in the text colour. */
async function loadFloral(): Promise<string | null> {
  try {
    const svg = await readFile(join(process.cwd(), "public/floral.svg"), "utf8");
    const inked = svg.replace("<svg ", `<svg fill="${C.ink}" `);
    return `data:image/svg+xml;base64,${Buffer.from(inked).toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const [serif, floral] = await Promise.all([loadFont("Fraunces:opsz,wght@144,600", "Wordle"), loadFloral()]);

  const tile = 68;
  const gap = 10;

  return new ImageResponse(
    (
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: C.bg }}>
        {floral && (
          // Satori ignores background-repeat on SVG data URIs, so the tiles are laid by hand.
          <div style={{ position: "absolute", top: -125, left: -280, display: "flex", flexWrap: "wrap", width: 1760, opacity: 0.04 }}>
            {[0, 1, 2, 3].map((i) => <img key={i} src={floral} width={880} height={880} alt="" />)}
          </div>
        )}
        {/* A soft wash behind the lockup so the pattern falls away from the name. */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, display: "flex", backgroundImage: `radial-gradient(ellipse at center, ${C.bg} 26%, rgba(26,16,22,0.8) 46%, rgba(26,16,22,0) 72%)` }} />

        <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
          <div style={{ display: "flex", flexWrap: "wrap", width: tile * 2 + gap, gap }}>
            {[C.hit, C.absent, C.absent, C.present].map((color, i) => (
              <div key={i} style={{ width: tile, height: tile, borderRadius: 14, background: color }} />
            ))}
          </div>
          <div style={{ display: "flex", color: C.ink, fontFamily: "Fraunces", fontSize: 168, fontWeight: 600, letterSpacing: -5, lineHeight: 1, paddingBottom: 14 }}>
            Wordle
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: serif ? [{ name: "Fraunces", data: serif, weight: 600, style: "normal" }] : [] },
  );
}
