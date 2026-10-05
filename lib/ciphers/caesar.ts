import { ch, isInt, keyOf, makeCipher, mod, randInt, runLetters, shiftAlphabet } from "./util";

export const caesar = makeCipher({
  id: "caesar",
  name: "Caesar Cipher",
  tagline: "Shift every letter by a fixed amount.",
  category: "substitution",
  type: "Substitution",
  keyType: "Number",
  difficulty: "Beginner",
  keyFields: [{ name: "shift", label: "Shift", kind: "number", placeholder: "0–25", hint: "How many places to move each letter (0–25)." }],
  defaultKey: { shift: "3" },
  example: { text: "HELLO", key: { shift: "3" }, result: "KHOOR" },
  inputRules: "Letters are shifted and keep their case. Spaces, digits and punctuation are left unchanged.",
  what: "Julius Caesar reportedly used this to protect military messages. Every letter slides a fixed number of places along the alphabet, wrapping from Z back to A.",
  how: ["Pick a shift k from 0 to 25.", "Turn each letter into a position (A=0 … Z=25).", "Add k (to encrypt) or subtract k (to decrypt).", "Wrap around with mod 26 and turn the number back into a letter."],
  formulas: {
    encrypt: "E(x) = (x + k) mod 26",
    decrypt: "D(x) = (x − k) mod 26",
    legend: ["x = letter position (A=0 … Z=25)", "k = the key (shift)", "mod 26 = wrap around the alphabet"],
  },
  validateKey(key) {
    const s = keyOf(key, "shift");
    return isInt(s) && +s >= 0 && +s <= 25 ? {} : { shift: "Shift must be a whole number between 0 and 25." };
  },
  generateKey: () => ({ shift: String(randInt(1, 25)) }),
  alphabetMap: (key) => shiftAlphabet((p) => p + Number(key.shift)),
  process(text, key, mode) {
    const k = Number(key.shift);
    return runLetters(text, (p, _i, c) => {
      const raw = mode === "encrypt" ? p + k : p - k;
      const out = mod(raw);
      return {
        out,
        lines: [
          `${c.toUpperCase()} = position ${p}`,
          `${p} ${mode === "encrypt" ? "+" : "−"} ${k} = ${raw}`,
          `${raw} mod 26 = ${out}${raw < 0 ? " (wrapped around)" : ""}`,
          `position ${out} = ${ch(out)}`,
        ],
      };
    });
  },
});
