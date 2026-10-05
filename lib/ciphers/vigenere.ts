import { ch, keyOf, lettersOnly, makeCipher, mod, pos, randInt, randWord, runLetters } from "./util";
import type { Key, KeyErrors } from "./types";

export const validateKeyword = (key: Key, name = "key"): KeyErrors => {
  const k = keyOf(key, name);
  if (!lettersOnly(k).length) return { [name]: "Key must contain letters." };
  if (/[^A-Za-z]/.test(k)) return { [name]: "Key may only contain the letters A–Z (no spaces, digits or symbols)." };
  return {};
};

export const vigenere = makeCipher({
  id: "vigenere",
  name: "Vigenère Cipher",
  tagline: "Encrypt using a repeating keyword.",
  category: "polyalphabetic",
  type: "Polyalphabetic",
  keyType: "Word",
  difficulty: "Intermediate",
  keyFields: [{ name: "key", label: "Keyword", kind: "text", placeholder: "e.g. LEMON", hint: "Letters A–Z only. The word repeats along the message." }],
  defaultKey: { key: "LEMON" },
  example: { text: "ATTACKATDAWN", key: { key: "LEMON" }, result: "LXFOPVEFRNHR" },
  inputRules: "Letters are encrypted and keep their case. Spaces, digits and punctuation are kept in place; the keyword only advances on letters.",
  what: "Like a Caesar cipher, but the shift changes with every letter. A keyword decides the shift: each key letter is a Caesar shift (A=0, B=1, …). The keyword repeats until it covers the whole message.",
  how: ["Repeat the keyword under the message.", "Turn each text letter and key letter into numbers.", "Add them (encrypt) or subtract them (decrypt).", "Wrap with mod 26 and convert back to a letter."],
  formulas: {
    encrypt: "Cᵢ = (Pᵢ + Kᵢ) mod 26",
    decrypt: "Pᵢ = (Cᵢ − Kᵢ + 26) mod 26",
    legend: ["Pᵢ = i-th plaintext letter (A=0 … Z=25)", "Kᵢ = i-th key letter (the keyword repeats)", "Cᵢ = i-th ciphertext letter", "+ 26 keeps the number positive before mod"],
  },
  validateKey: (k) => validateKeyword(k),
  generateKey: () => ({ key: randWord(randInt(4, 7)) }),
  process(text, key, mode) {
    const kw = lettersOnly(key.key);
    const run = runLetters(text, (p, i, c) => {
      const kc = kw[i % kw.length];
      const k = pos(kc);
      const raw = mode === "encrypt" ? p + k : p - k;
      const out = mod(raw);
      const op = mode === "encrypt" ? "+" : "−";
      const plain = mode === "encrypt" ? c.toUpperCase() : ch(out);
      return {
        out,
        key: kc,
        tabula: { row: kc, col: plain },
        lines: [
          `${c.toUpperCase()} = ${p}`,
          `${kc} = ${k}  (key letter)`,
          `${p} ${op} ${k} = ${raw}`,
          mode === "encrypt" ? `${raw} mod 26 = ${out}` : `(${raw} + 26) mod 26 = ${out}`,
          `${out} = ${ch(out)}`,
        ],
      };
    });
    run.notes.unshift(`Keyword ${kw} repeats along the letters: ${Array.from({ length: Math.min(text.replace(/[^A-Za-z]/g, "").length, 24) }, (_, i) => kw[i % kw.length]).join("")}…`);
    return run;
  },
});
