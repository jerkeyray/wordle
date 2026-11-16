/**
 * Keeps the figures in README.md and on the about page equal to the answer bank.
 *
 *   node scripts/sync-readme.mjs           rewrite both
 *   node scripts/sync-readme.mjs --check   exit 1 if either is out of date
 *
 * Everything between the README's bank-stats markers is generated, and so is
 * src/lib/word-stats.json, which the about page renders at build time, and
 * src/lib/home-words.json, the words the home screen's row is drawn from; edit
 * this script, not them. `make test` runs the check, and a Go test holds the
 * JSON to the server's own Stats, so a bank change cannot land with stale
 * numbers in either place.
 */
import { readFile, writeFile } from "node:fs/promises";
import { bankFigures, BANK_PATH } from "./bank-lib.mjs";

const README = new URL("../../README.md", import.meta.url);
const STATS_JSON = new URL("../src/lib/word-stats.json", import.meta.url);
const HOME_JSON = new URL("../src/lib/home-words.json", import.meta.url);
const START = "<!-- bank-stats:start -->";
const END = "<!-- bank-stats:end -->";
const n = (x) => x.toLocaleString("en-GB");

const f = await bankFigures();
const [five, six] = f.lengths;
const row = (name, key) => `| ${name} | ${n(five[key])} | ${n(six[key])} |`;
const block = `${START}
**${n(f.answers)} answers** to play, and **${n(f.dictionary)} words** accepted as guesses.

| Difficulty | 5 letters | 6 letters |
| --- | ---: | ---: |
${row("Familiar", "familiar")}
${row("Stretch", "stretch")}
${row("Challenging", "challenging")}
| **Total** | **${n(five.total)}** | **${n(six.total)}** |
${END}`;

const text = await readFile(README, "utf8");
const from = text.indexOf(START);
const to = text.indexOf(END);
if (from < 0 || to < 0) throw new Error("README.md is missing the bank-stats markers");
const next = text.slice(0, from) + block + text.slice(to + END.length);

const json = JSON.stringify(f, null, 2) + "\n";
const oldJson = await readFile(STATS_JSON, "utf8").catch(() => "");
// The home row: five-letter "stretch" answers, the words-worth-knowing middle
// of the bank. Slang and retired entries are left out.
const bank = JSON.parse(await readFile(BANK_PATH, "utf8"));
const homeWords = bank
  .filter((w) => !w.retired && w.word.length === 5 && w.difficulty === "stretch" && w.register !== "slang")
  .map((w) => w.word)
  .sort();
const homeJson = JSON.stringify(homeWords) + "\n";
const oldHomeJson = await readFile(HOME_JSON, "utf8").catch(() => "");
const stale = next !== text || json !== oldJson || homeJson !== oldHomeJson;

if (process.argv.includes("--check")) {
  if (stale) {
    console.error("README.md, src/lib/word-stats.json or src/lib/home-words.json is out of date with the word bank. Run: pnpm readme:sync");
    process.exit(1);
  }
  console.log("README and about-page figures match the word bank.");
} else {
  await writeFile(README, next);
  await writeFile(STATS_JSON, json);
  await writeFile(HOME_JSON, homeJson);
  console.log(stale ? "README and about-page figures updated." : "Figures already up to date.");
}
