import { ALPHABET, keyOf, lettersOnly, makeCipher, mod, randInt, randWord } from "./util";
import type { PlayfairItem } from "./types";

/** Standard convention: 25-letter alphabet, J is merged into I. */
export function buildMatrix(keyword: string): string[][] {
  const seq = [...new Set((lettersOnly(keyword) + ALPHABET).replace(/J/g, "I"))];
  return Array.from({ length: 5 }, (_, r) => seq.slice(r * 5, r * 5 + 5));
}

/** Normalize and split plaintext into pairs, inserting X (or Q after an X) between doubles and at the end. */
export function preparePairs(text: string) {
  const raw = lettersOnly(text).replace(/J/g, "I");
  const pairs: string[] = [];
  const fixes: string[] = [];
  let i = 0;
  while (i < raw.length) {
    const a = raw[i];
    const b = raw[i + 1];
    const filler = a === "X" ? "Q" : "X";
    if (b === undefined) {
      pairs.push(a + filler);
      fixes.push(`Added filler ${filler} to complete the last pair.`);
      i++;
    } else if (a === b) {
      pairs.push(a + filler);
      fixes.push(`Inserted filler ${filler} between the double ${a}${a}.`);
      i++;
    } else {
      pairs.push(a + b);
      i += 2;
    }
  }
  return { raw, pairs, fixes };
}

export const playfair = makeCipher({
  id: "playfair",
  name: "Playfair Cipher",
  tagline: "Encrypt pairs of letters using a 5×5 grid.",
  category: "matrix",
  type: "Polygraph (digraph substitution)",
  keyType: "Word",
  difficulty: "Intermediate",
  keyFields: [{ name: "key", label: "Keyword", kind: "text", placeholder: "e.g. MONARCHY", hint: "Letters A–Z. Repeated letters are dropped; J is treated as I." }],
  defaultKey: { key: "MONARCHY" },
  example: { text: "HIDE THE GOLD", key: { key: "MONARCHY" }, result: "BFCKPDFIMPBZ" },
  inputRules: "I/J convention: the grid has 25 cells, so J is merged with I (every J becomes I). Only letters are used — spaces, digits and punctuation are removed, and output is uppercase. Doubled letters in a pair get an X (or Q after an X) inserted, and an odd last letter gets an X.",
  what: "Invented by Charles Wheatstone and promoted by Lord Playfair. Instead of single letters it encrypts pairs of letters using a 5×5 grid built from a keyword, which hides single-letter frequencies.",
  how: [
    "Build the 5×5 grid: keyword first (no repeats), then the rest of the alphabet. I and J share a cell.",
    "Clean the text and split it into pairs. Double letters get a filler; an odd last letter gets a filler.",
    "Same row → take the letter to the right of each (wrap around).",
    "Same column → take the letter below each (wrap around).",
    "Rectangle → each letter becomes the one in its own row, in the other letter's column.",
  ],
  validateKey(key) {
    const k = keyOf(key, "key");
    if (!lettersOnly(k).length) return { key: "Enter a valid keyword (letters A–Z)." };
    if (/[^A-Za-z]/.test(k)) return { key: "Enter a valid keyword: letters A–Z only." };
    return {};
  },
  validateText(text, _key, mode) {
    if (mode === "decrypt") {
      const raw = lettersOnly(text);
      if (raw.length % 2) return "Playfair ciphertext must have an even number of letters.";
      for (let i = 0; i < raw.length; i += 2) if (raw[i] === raw[i + 1]) return `Invalid ciphertext: pair "${raw[i]}${raw[i + 1]}" repeats a letter, which Playfair never produces.`;
      if (raw.includes("J")) return "Playfair ciphertext cannot contain J (J is merged into I).";
    }
    return null;
  },
  generateKey: () => ({ key: randWord(randInt(5, 8)) }),
  process(text, key, mode) {
    const matrix = buildMatrix(key.key);
    const find = new Map<string, [number, number]>();
    matrix.forEach((row, r) => row.forEach((c, cc) => find.set(c, [r, cc])));
    const d = mode === "encrypt" ? 1 : -1;
    const notes: string[] = ["I/J convention: J is merged with I in the 5×5 grid."];

    let pairs: string[];
    let fixes: string[] = [];
    const original = lettersOnly(text);
    if (mode === "encrypt") {
      const p = preparePairs(text);
      pairs = p.pairs;
      fixes = p.fixes;
      if (/J/.test(original)) notes.push("Every J was replaced with I.");
      notes.push(`Prepared text: ${pairs.join(" ")}`);
      notes.push(...fixes);
    } else {
      const raw = original.replace(/J/g, "I");
      pairs = raw.match(/../g) ?? [];
      notes.push("Decryption gives back the padded text. Filler letters (X/Q) and the I/J merge are not removed automatically — use context to read the message.");
    }
    if (original.length !== text.replace(/\s/g, "").length) notes.push("Digits, punctuation and other symbols were removed.");

    const items: PlayfairItem[] = pairs.map((pr) => {
      const [a, b] = [find.get(pr[0])!, find.get(pr[1])!];
      let oa: [number, number];
      let ob: [number, number];
      let rule: PlayfairItem["rule"];
      let lines: string[];
      if (a[0] === b[0]) {
        rule = "row";
        oa = [a[0], mod(a[1] + d, 5)];
        ob = [b[0], mod(b[1] + d, 5)];
        lines = [`${pr[0]} and ${pr[1]} are in the same row.`, `Move each one ${d === 1 ? "right" : "left"} (wrapping around).`];
      } else if (a[1] === b[1]) {
        rule = "column";
        oa = [mod(a[0] + d, 5), a[1]];
        ob = [mod(b[0] + d, 5), b[1]];
        lines = [`${pr[0]} and ${pr[1]} are in the same column.`, `Move each one ${d === 1 ? "down" : "up"} (wrapping around).`];
      } else {
        rule = "rectangle";
        oa = [a[0], b[1]];
        ob = [b[0], a[1]];
        lines = [`${pr[0]} and ${pr[1]} form a rectangle.`, "Each letter is replaced by the corner in its own row, in the other letter's column."];
      }
      const out = matrix[oa[0]][oa[1]] + matrix[ob[0]][ob[1]];
      lines.push(`${pr[0]} ${pr[1]}  →  ${out[0]} ${out[1]}`);
      return { input: pr, output: out, rule, a, b, outA: oa, outB: ob, lines };
    });

    return {
      output: items.map((i) => i.output).join(""),
      notes,
      steps: { kind: "playfair", matrix, original, pairs, fixes, items },
    };
  },
});
