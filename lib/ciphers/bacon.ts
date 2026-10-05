import { ch, lettersOnly, makeCipher, pos } from "./util";
import type { CharItem } from "./types";

const toCode = (p: number) => p.toString(2).padStart(5, "0").replace(/0/g, "A").replace(/1/g, "B");

export const bacon = makeCipher({
  id: "bacon",
  name: "Bacon's Cipher",
  tagline: "Hide letters as groups of A and B.",
  category: "other",
  type: "Substitution (binary encoding)",
  keyType: "None",
  difficulty: "Beginner",
  keyFields: [],
  defaultKey: {},
  example: { text: "HELLO", key: {}, result: "AABBB AABAA ABABB ABABB ABBBA" },
  inputRules: "Encrypt: only letters are used (case ignored); spaces, digits and punctuation are removed. Output is groups of 5 A/B letters. Decrypt: only the letters A and B are read (any case); everything else is ignored. This is the 26-letter version where every letter has its own code.",
  what: "Francis Bacon's 1605 encoding writes every letter as five symbols, each either A or B — essentially 5-bit binary. It can be hidden in anything with two styles, like two fonts.",
  how: ["Take a letter's position (A=0 … Z=25).", "Write it in 5-bit binary.", "Replace every 0 with A and every 1 with B.", "To decrypt, read the A/B text in groups of five and reverse the process."],
  validateKey: () => ({}),
  validateText(text, _key, mode) {
    if (mode === "decrypt") {
      const n = text.replace(/[^ABab]/g, "").length;
      if (n === 0 || n % 5) return `Bacon ciphertext needs A/B letters in groups of 5 (found ${n} A/B letters).`;
    }
    return null;
  },
  process(text, _key, mode) {
    const items: CharItem[] = [];
    const notes: string[] = [];
    if (mode === "encrypt") {
      const letters = lettersOnly(text);
      if (letters.length !== text.replace(/\s/g, "").length) notes.push("Digits, punctuation and other symbols were removed.");
      letters.split("").forEach((c) => {
        const p = pos(c);
        const code = toCode(p);
        items.push({ input: c, output: code, lines: [`${c} = ${p}`, `${p} in 5-bit binary = ${p.toString(2).padStart(5, "0")}`, `0 → A, 1 → B: ${code}`] });
      });
      return { output: items.map((i) => i.output).join(" "), notes, steps: { kind: "chars", layout: "map", items } };
    }
    const ab = text.toUpperCase().replace(/[^AB]/g, "");
    if (ab.length !== text.replace(/\s/g, "").length) notes.push("Characters other than A and B were ignored.");
    for (let i = 0; i + 5 <= ab.length; i += 5) {
      const g = ab.slice(i, i + 5);
      const bits = g.replace(/A/g, "0").replace(/B/g, "1");
      const p = parseInt(bits, 2);
      const c = p > 25 ? "?" : ch(p);
      items.push({ input: g, output: c, lines: [`${g}: A → 0, B → 1 gives ${bits}`, `${bits} in decimal = ${p}`, p > 25 ? "Above 25: not a letter." : `position ${p} = ${c}`] });
    }
    return { output: items.map((i) => i.output).join(""), notes, steps: { kind: "chars", layout: "map", items } };
  },
});
