import { ch, makeCipher, runLetters, shiftAlphabet } from "./util";

export const atbash = makeCipher({
  id: "atbash",
  name: "Atbash Cipher",
  tagline: "Reverse the alphabet.",
  category: "substitution",
  type: "Substitution",
  keyType: "None",
  difficulty: "Beginner",
  keyFields: [],
  defaultKey: {},
  example: { text: "HELLO", key: {}, result: "SVOOL" },
  inputRules: "Letters are mirrored and keep their case. Spaces, digits and punctuation are left unchanged.",
  what: "An ancient Hebrew cipher: A becomes Z, B becomes Y, and so on. There is no key, so encrypting and decrypting are the same operation.",
  how: ["Turn each letter into a position (A=0 … Z=25).", "Replace x with 25 − x.", "Turn the number back into a letter."],
  formulas: {
    encrypt: "E(x) = (25 − x) mod 26",
    decrypt: "D(x) = (25 − x) mod 26",
    legend: ["x = letter position (A=0 … Z=25)", "Same formula both ways — Atbash undoes itself."],
  },
  validateKey: () => ({}),
  alphabetMap: () => shiftAlphabet((p) => 25 - p),
  process(text) {
    return runLetters(text, (p, _i, c) => {
      const out = 25 - p;
      return { out, lines: [`${c.toUpperCase()} = position ${p}`, `25 − ${p} = ${out}`, `position ${out} = ${ch(out)}`] };
    });
  },
});
