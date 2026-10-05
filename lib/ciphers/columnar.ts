import { keyOf, lettersOnly, makeCipher, randInt, randWord } from "./util";
import type { CharItem } from "./types";

export const columnar = makeCipher({
  id: "columnar",
  name: "Columnar Transposition",
  tagline: "Write in rows, read columns in keyword order.",
  category: "transposition",
  type: "Transposition",
  keyType: "Word",
  difficulty: "Intermediate",
  keyFields: [{ name: "key", label: "Keyword", kind: "text", placeholder: "e.g. ZEBRAS", hint: "Letters A–Z. Its alphabetical order decides which column is read first." }],
  defaultKey: { key: "ZEBRAS" },
  example: { text: "WEAREDISCOVERED", key: { key: "ZEBRAS" }, result: "EVXACDESEROXDEXWIR" },
  inputRules: "Only letters are used: spaces, digits and punctuation are removed and output is uppercase. If the last row is incomplete, it is padded with X.",
  what: "Another transposition cipher. The message is written in rows under a keyword, then the columns are read out in the alphabetical order of the keyword letters.",
  how: ["Write the keyword as column headers.", "Fill the text row by row (pad the last row with X).", "Number the columns by the alphabetical order of the keyword (ties: left to right).", "Read column 1 top to bottom, then column 2, and so on.", "To decrypt, cut the ciphertext into columns of equal height and put them back in order."],
  validateKey(key) {
    const k = keyOf(key, "key");
    if (lettersOnly(k).length < 2) return { key: "Keyword must contain at least 2 letters." };
    if (/[^A-Za-z]/.test(k)) return { key: "Keyword may only contain the letters A–Z." };
    return {};
  },
  validateText(text, key, mode) {
    const n = lettersOnly(key.key).length;
    if (mode === "decrypt" && lettersOnly(text).length % n) return `Ciphertext length must be a multiple of the keyword length (${n}); found ${lettersOnly(text).length} letters.`;
    return null;
  },
  generateKey: () => ({ key: randWord(randInt(4, 7)) }),
  process(text, key, mode) {
    const kw = lettersOnly(key.key);
    const n = kw.length;
    let letters = lettersOnly(text);
    const notes: string[] = [];
    if (letters.length !== text.replace(/\s/g, "").length) notes.push("Digits, punctuation and other symbols were removed.");
    if (mode === "encrypt" && letters.length % n) {
      const pad = n - (letters.length % n);
      letters += "X".repeat(pad);
      notes.push(`Padded with ${pad} × X to fill the last row.`);
    }
    const rows = letters.length / n;
    const order = kw.split("").map((c, i) => i).sort((a, b) => kw[a].localeCompare(kw[b]) || a - b); // order[j] = column read j-th
    const rank = order.map((_, j) => j).reduce<number[]>((acc, j) => ((acc[order[j]] = j + 1), acc), []);
    const grid: string[][] = Array.from({ length: rows }, () => Array(n).fill(""));
    const items: CharItem[] = [];
    let out = "";
    if (mode === "encrypt") {
      letters.split("").forEach((c, i) => (grid[Math.floor(i / n)][i % n] = c));
      order.forEach((col) =>
        grid.forEach((row, r) => {
          out += row[col];
          items.push({ input: row[col], output: row[col], cell: [r, col], lines: [`Column ${rank[col]} is "${kw[col]}"'s turn.`, `Read row ${r + 1}: "${row[col]}".`] });
        }),
      );
    } else {
      order.forEach((col, j) =>
        Array.from({ length: rows }, (_, r) => {
          grid[r][col] = letters[j * rows + r];
          items.push({ input: letters[j * rows + r], output: letters[j * rows + r], cell: [r, col], lines: [`Ciphertext block ${j + 1} belongs to column "${kw[col]}" (rank ${rank[col]}).`, `It fills row ${r + 1} of that column.`] });
        }),
      );
      out = grid.flat().join("");
    }
    return {
      output: out,
      notes,
      steps: { kind: "chars", layout: "sequence", items, grid: { cells: grid, colHeaders: kw.split("").map((c, i) => `${c}${rank[i]}`) } },
    };
  },
});
