import { ch, keyOf, lettersOnly, makeCipher, mod, pos, randInt, randWord, runLetters } from "./util";
import { validateKeyword } from "./vigenere";

export const autokey = makeCipher({
  id: "autokey",
  name: "Autokey Cipher",
  tagline: "Extend the key using the message itself.",
  category: "polyalphabetic",
  type: "Polyalphabetic",
  keyType: "Word",
  difficulty: "Intermediate",
  keyFields: [{ name: "key", label: "Starter key", kind: "text", placeholder: "e.g. QUEENLY", hint: "Letters A–Z only. After the key runs out, the plaintext itself is used as the key." }],
  defaultKey: { key: "QUEENLY" },
  example: { text: "ATTACKATDAWN", key: { key: "QUEENLY" }, result: "QNXEPVYTWTWP" },
  inputRules: "Letters are encrypted and keep their case. Spaces, digits and punctuation are kept in place and skipped (they never become part of the key stream).",
  what: "A Vigenère variant that avoids repeating the key. You start with a short key, then the plaintext letters themselves continue the key stream.",
  how: ["Write the starter key, then the plaintext right after it: that is the key stream.", "Add each key-stream letter to each plaintext letter (mod 26).", "To decrypt, recover letters one by one: each recovered letter is later used as key."],
  formulas: {
    encrypt: "Cᵢ = (Pᵢ + Kᵢ) mod 26,  K = key ∥ P",
    decrypt: "Pᵢ = (Cᵢ − Kᵢ + 26) mod 26,  K = key ∥ P",
    legend: ["K = starter key followed by the plaintext letters", "Pᵢ, Kᵢ, Cᵢ = plaintext, key and ciphertext letter i", "Decryption fills the key stream in as it goes"],
  },
  validateKey: (k) => validateKeyword(k),
  generateKey: () => ({ key: randWord(randInt(4, 7)) }),
  process(text, key, mode) {
    const stream = lettersOnly(keyOf(key, "key")).split("");
    if (mode === "encrypt") stream.push(...lettersOnly(text));
    const run = runLetters(text, (p, i, c) => {
      const kc = stream[i];
      const k = pos(kc);
      const raw = mode === "encrypt" ? p + k : p - k;
      const out = mod(raw);
      if (mode === "decrypt") stream.push(ch(out)); // the recovered letter becomes key later
      const plain = mode === "encrypt" ? c.toUpperCase() : ch(out);
      return {
        out,
        key: kc,
        tabula: { row: kc, col: plain },
        lines: [
          `${c.toUpperCase()} = ${p}`,
          `${kc} = ${k}  (${i < key.key.trim().length ? "from the starter key" : "from the message itself"})`,
          `${p} ${mode === "encrypt" ? "+" : "−"} ${k} = ${raw}`,
          `${raw} mod 26 = ${out}`,
          `${out} = ${ch(out)}`,
        ],
      };
    });
    run.notes.unshift("Key stream = starter key followed by the message letters.");
    return run;
  },
});
