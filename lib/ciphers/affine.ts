import { ch, gcd, isInt, keyOf, makeCipher, mod, modInverse, randInt, runLetters, shiftAlphabet } from "./util";

const VALID_A = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];

export const affine = makeCipher({
  id: "affine",
  name: "Affine Cipher",
  tagline: "Apply a mathematical substitution.",
  category: "substitution",
  type: "Substitution",
  keyType: "Two numbers (a, b)",
  difficulty: "Intermediate",
  keyFields: [
    { name: "a", label: "a", kind: "number", placeholder: "coprime with 26", hint: "Multiplier. Must share no factor with 26: 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23 or 25." },
    { name: "b", label: "b", kind: "number", placeholder: "0–25", hint: "Shift added after multiplying." },
  ],
  defaultKey: { a: "5", b: "8" },
  example: { text: "AFFINE CIPHER", key: { a: "5", b: "8" }, result: "IHHWVC SWFRCP" },
  inputRules: "Letters are transformed and keep their case. Spaces, digits and punctuation are left unchanged.",
  what: "A Caesar cipher with an extra multiplication. Each letter position x becomes a·x + b. The multiplier a must be coprime with 26, otherwise two letters would map to the same result and decryption would be ambiguous.",
  how: ["Choose a (coprime with 26) and b.", "Turn each letter into a position x.", "Encrypt: multiply by a, add b, take mod 26.", "Decrypt: subtract b, then multiply by a⁻¹ (the modular inverse of a)."],
  formulas: {
    encrypt: "E(x) = (a·x + b) mod 26",
    decrypt: "D(y) = a⁻¹ · (y − b) mod 26",
    legend: ["x = plaintext letter position, y = ciphertext letter position", "a⁻¹ = the number with a · a⁻¹ ≡ 1 (mod 26)", "gcd(a, 26) must equal 1"],
  },
  validateKey(key) {
    const e: Record<string, string> = {};
    const a = keyOf(key, "a");
    const b = keyOf(key, "b");
    if (!isInt(a)) e.a = "a must be a whole number.";
    else if (gcd(+a, 26) !== 1) e.a = `a must be coprime with 26 (gcd(${a}, 26) = ${gcd(+a, 26)}). Try 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23 or 25.`;
    if (!isInt(b)) e.b = "b must be a whole number.";
    return e;
  },
  generateKey: () => ({ a: String(VALID_A[randInt(0, VALID_A.length - 1)]), b: String(randInt(0, 25)) }),
  alphabetMap: (key) => shiftAlphabet((p) => Number(key.a) * p + Number(key.b)),
  process(text, key, mode) {
    const a = mod(Number(key.a));
    const b = mod(Number(key.b));
    const inv = modInverse(a) ?? 1;
    return runLetters(text, (p, _i, c) => {
      if (mode === "encrypt") {
        const raw = a * p + b;
        const out = mod(raw);
        return { out, lines: [`${c.toUpperCase()} = ${p}`, `${a} × ${p} + ${b} = ${raw}`, `${raw} mod 26 = ${out}`, `position ${out} = ${ch(out)}`] };
      }
      const raw = inv * (p - b);
      const out = mod(raw);
      return { out, lines: [`${c.toUpperCase()} = ${p}`, `a⁻¹ = ${inv} (since ${a} × ${inv} = ${a * inv} ≡ 1)`, `${inv} × (${p} − ${b}) = ${raw}`, `${raw} mod 26 = ${out}`, `position ${out} = ${ch(out)}`] };
    });
  },
});
