import { ch, makeCipher, mod, runLetters, shiftAlphabet } from "./util";

export const rot13 = makeCipher({
  id: "rot13",
  name: "ROT13",
  tagline: "Caesar with a fixed shift of 13.",
  category: "other",
  type: "Substitution",
  keyType: "None",
  difficulty: "Beginner",
  keyFields: [],
  defaultKey: {},
  example: { text: "HELLO", key: {}, result: "URYYB" },
  inputRules: "Letters are rotated and keep their case. Spaces, digits and punctuation are left unchanged.",
  what: "A Caesar cipher whose shift is always 13. Since the alphabet has 26 letters, applying ROT13 twice returns the original text.",
  how: ["Turn each letter into a position.", "Add 13.", "Wrap with mod 26 and turn it back into a letter."],
  formulas: {
    encrypt: "E(x) = (x + 13) mod 26",
    decrypt: "D(x) = (x + 13) mod 26",
    legend: ["x = letter position (A=0 … Z=25)", "13 + 13 = 26 ≡ 0, so the same step encrypts and decrypts."],
  },
  validateKey: () => ({}),
  alphabetMap: () => shiftAlphabet((p) => p + 13),
  process(text) {
    return runLetters(text, (p, _i, c) => {
      const out = mod(p + 13);
      return { out, lines: [`${c.toUpperCase()} = position ${p}`, `${p} + 13 = ${p + 13}`, `${p + 13} mod 26 = ${out}`, `position ${out} = ${ch(out)}`] };
    });
  },
});
