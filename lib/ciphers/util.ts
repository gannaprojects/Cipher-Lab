import type { CharItem, CipherAlgorithm, CipherDef, CipherRun, Key } from "./types";

export const mod = (n: number, m = 26) => ((n % m) + m) % m;
export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function modInverse(a: number, m = 26): number | null {
  const r = mod(a, m);
  for (let x = 1; x < m; x++) if ((r * x) % m === 1) return x;
  return null;
}

export const isLetter = (c: string) => /^[A-Za-z]$/.test(c);
export const pos = (c: string) => c.toUpperCase().charCodeAt(0) - 65;
export const ch = (n: number) => String.fromCharCode(65 + mod(n));
export const lettersOnly = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, "");
export const isInt = (s: string | undefined) => /^-?\d+$/.test((s ?? "").trim());

export function makeCipher(def: CipherDef): CipherAlgorithm {
  const { process, ...rest } = def;
  return {
    ...rest,
    encrypt: (t, k) => process(t, k, "encrypt").output,
    decrypt: (t, k) => process(t, k, "decrypt").output,
    getSteps: process,
  };
}

export interface LetterResult {
  out: number;
  key?: string;
  lines: string[];
  tabula?: { row: string; col: string };
}

/**
 * Shared runner for ciphers that map one letter to one letter.
 * Case is preserved; non-letters are kept in place and skipped (the key does not advance on them).
 * `f` is called in order, once per letter, so it may be stateful (Autokey).
 */
export function runLetters(text: string, f: (p: number, i: number, c: string) => LetterResult): CipherRun {
  let out = "";
  let i = 0;
  let skipped = 0;
  const items: CharItem[] = [];
  for (const c of text) {
    if (!isLetter(c)) {
      out += c;
      skipped++;
      items.push({ input: c, output: c, skip: true, lines: [`"${c === " " ? "space" : c}" is not a letter, so it is kept as is.`] });
      continue;
    }
    const r = f(pos(c), i++, c);
    const o = ch(r.out);
    const oc = c === c.toLowerCase() ? o.toLowerCase() : o;
    out += oc;
    items.push({ input: c, output: oc, key: r.key, lines: r.lines, tabula: r.tabula });
  }
  const notes = skipped
    ? [`${skipped} non-letter character${skipped > 1 ? "s" : ""} (spaces, digits, punctuation) kept unchanged. Upper/lower case is preserved.`]
    : [];
  return { output: out, notes, steps: { kind: "chars", layout: "map", items } };
}

export const shiftAlphabet = (f: (p: number) => number) => ALPHABET.split("").map((_, p) => ch(f(p))).join("");

export function randInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}
export function randWord(len: number) {
  return Array.from({ length: len }, () => ALPHABET[randInt(0, 25)]).join("");
}

export const keyOf = (k: Key, name: string) => (k[name] ?? "").trim();
