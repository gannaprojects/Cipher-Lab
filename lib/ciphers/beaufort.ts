import { ch, lettersOnly, makeCipher, mod, pos, randInt, randWord, runLetters } from "./util";
import { validateKeyword } from "./vigenere";

export const beaufort = makeCipher({
  id: "beaufort",
  name: "Beaufort Cipher",
  tagline: "A reciprocal Vigenère: key minus letter.",
  category: "polyalphabetic",
  type: "Polyalphabetic",
  keyType: "Word",
  difficulty: "Intermediate",
  keyFields: [{ name: "key", label: "Keyword", kind: "text", placeholder: "e.g. FORTIFICATION", hint: "Letters A–Z only. The word repeats along the message." }],
  defaultKey: { key: "FORTIFICATION" },
  example: { text: "DEFENDTHEEASTWALLOFTHECASTLE", key: { key: "FORTIFICATION" }, result: "CKMPVCPVWPIWUJOGIUAPVWRIWUUK" },
  inputRules: "Letters are processed and keep their case. Spaces, digits and punctuation are kept in place; the keyword only advances on letters.",
  what: "Similar to Vigenère, but it subtracts the text letter from the key letter instead of adding. The surprise: the exact same operation both encrypts and decrypts.",
  how: ["Repeat the keyword under the message.", "Turn letters into numbers.", "Compute key − text (mod 26).", "Convert back to a letter. Run it again with the same key to undo it."],
  formulas: {
    encrypt: "Cᵢ = (Kᵢ − Pᵢ) mod 26",
    decrypt: "Pᵢ = (Kᵢ − Cᵢ) mod 26",
    legend: ["Pᵢ = plaintext letter, Cᵢ = ciphertext letter, Kᵢ = key letter", "Same formula both ways: Beaufort is reciprocal"],
  },
  validateKey: (k) => validateKeyword(k),
  generateKey: () => ({ key: randWord(randInt(4, 7)) }),
  process(text, key) {
    const kw = lettersOnly(key.key);
    return runLetters(text, (p, i, c) => {
      const kc = kw[i % kw.length];
      const k = pos(kc);
      const raw = k - p;
      const out = mod(raw);
      return {
        out,
        key: kc,
        lines: [`${c.toUpperCase()} = ${p}`, `${kc} = ${k}  (key letter)`, `${k} − ${p} = ${raw}`, `${raw} mod 26 = ${out}`, `${out} = ${ch(out)}`],
      };
    });
  },
});
