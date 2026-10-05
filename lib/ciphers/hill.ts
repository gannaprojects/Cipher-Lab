import { ch, gcd, isInt, lettersOnly, makeCipher, mod, modInverse, pos, randInt } from "./util";
import type { HillItem, Key, KeyErrors } from "./types";

type Matrix = number[][];

const minor = (m: Matrix, r: number, c: number): Matrix => m.filter((_, i) => i !== r).map((row) => row.filter((_, j) => j !== c));

export function determinant(m: Matrix): number {
  if (m.length === 1) return m[0][0];
  if (m.length === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  return m[0].reduce((s, v, j) => s + (j % 2 ? -1 : 1) * v * determinant(minor(m, 0, j)), 0);
}

/** Adjugate (transpose of the cofactor matrix), reduced mod 26. */
export function adjugate(m: Matrix): Matrix {
  if (m.length === 1) return [[1]];
  return m.map((_, i) => m.map((__, j) => mod((((i + j) % 2) ? -1 : 1) * determinant(minor(m, j, i)))));
}

/** K⁻¹ mod 26 = det⁻¹ · adj(K) mod 26, or null when gcd(det, 26) ≠ 1. */
export function inverseMod26(m: Matrix) {
  const det = mod(determinant(m));
  const detInv = modInverse(det);
  if (detInv === null) return null;
  const adj = adjugate(m);
  return { det, detInv, adjugate: adj, inverse: adj.map((r) => r.map((v) => mod(v * detInv))) };
}

export function parseMatrix(key: Key): Matrix | null {
  const n = Number(key.size);
  const cells = (key.m ?? "").split(",");
  if (![2, 3].includes(n) || cells.length !== n * n || !cells.every((c) => isInt(c))) return null;
  return Array.from({ length: n }, (_, r) => cells.slice(r * n, r * n + n).map((c) => mod(Number(c))));
}

const validateKey = (key: Key, mode: "encrypt" | "decrypt"): KeyErrors => {
  const m = parseMatrix(key);
  if (!m) return { m: "Matrix must contain integers in every cell." };
  if (mode === "decrypt") {
    const det = mod(determinant(m));
    if (!inverseMod26(m))
      return { m: `This matrix has no modular inverse mod 26. Its determinant is ${det}, and gcd(${det}, 26) = ${gcd(det, 26)} (it must be 1). Choose another key.` };
  }
  return {};
};

const fmt = (m: Matrix) => m.map((r) => r.join(" ")).join(" / ");

export function randomInvertibleMatrix(n: number): Matrix {
  for (;;) {
    const m = Array.from({ length: n }, () => Array.from({ length: n }, () => randInt(0, 25)));
    if (inverseMod26(m)) return m;
  }
}

export const hill = makeCipher({
  id: "hill",
  name: "Hill Cipher",
  tagline: "Use matrix multiplication.",
  category: "matrix",
  type: "Matrix (polygraph)",
  keyType: "Matrix",
  difficulty: "Advanced",
  keyFields: [
    { name: "size", label: "Matrix size", kind: "size" },
    { name: "m", label: "Key matrix", kind: "matrix", hint: "Whole numbers. For decryption the determinant must be coprime with 26." },
  ],
  defaultKey: { size: "2", m: "3,3,2,5" },
  example: { text: "HELP", key: { size: "2", m: "3,3,2,5" }, result: "HIAT" },
  inputRules: "Only letters are used: spaces, digits and punctuation are removed and the output is uppercase. If the letter count is not a multiple of the matrix size, X is appended as padding.",
  what: "Invented by Lester Hill in 1929. The message is cut into blocks of n letters; each block becomes a vector of numbers that is multiplied by an n×n key matrix. The key matrix must be invertible mod 26 so the message can be recovered.",
  how: [
    "Letters → numbers (A=0 … Z=25).",
    "Group the numbers into vectors of length n (pad with X if needed).",
    "Multiply the key matrix by each vector.",
    "Take every result mod 26.",
    "Numbers → ciphertext letters. To decrypt, multiply by the inverse matrix mod 26.",
  ],
  formulas: {
    encrypt: "C = K · P  (mod 26)",
    decrypt: "P = K⁻¹ · C  (mod 26)",
    legend: [
      "P = column vector of plaintext numbers for one block",
      "K = the n×n key matrix",
      "C = column vector of ciphertext numbers",
      "K⁻¹ = inverse of K mod 26 = det(K)⁻¹ · adj(K); it exists only if gcd(det K, 26) = 1",
      "mod 26 = wrap results back into 0–25",
    ],
  },
  validateKey,
  validateText(text, key, mode) {
    const n = Number(key.size);
    if (mode === "decrypt" && lettersOnly(text).length % n) return `Hill ciphertext length must be a multiple of ${n} letters (found ${lettersOnly(text).length}).`;
    return null;
  },
  generateKey: () => {
    const n = randInt(2, 3);
    return { size: String(n), m: randomInvertibleMatrix(n).flat().join(",") };
  },
  process(text, key, mode) {
    const km = parseMatrix(key)!;
    const n = km.length;
    const inv = inverseMod26(km);
    const used = mode === "encrypt" ? km : inv!.inverse;
    const notes: string[] = [];
    let letters = lettersOnly(text);
    if (letters.length !== text.replace(/\s/g, "").length) notes.push("Digits, punctuation and other symbols were removed.");
    if (mode === "encrypt" && letters.length % n) {
      const pad = n - (letters.length % n);
      letters += "X".repeat(pad);
      notes.push(`Padded with ${pad} × X so the text fills whole blocks of ${n}.`);
    }
    if (mode === "encrypt" && !inv) notes.push("Warning: this matrix has no inverse mod 26, so text encrypted with it can never be decrypted. Choose a valid key.");
    if (km.flat().some((v, i) => v !== Number(key.m.split(",")[i]))) notes.push("Matrix entries outside 0–25 were reduced mod 26.");

    const items: HillItem[] = [];
    for (let i = 0; i + n <= letters.length; i += n) {
      const block = letters.slice(i, i + n);
      const vec = block.split("").map(pos);
      const product = used.map((row) => row.reduce((s, v, j) => s + v * vec[j], 0));
      const result = product.map((v) => mod(v));
      const out = result.map(ch).join("");
      items.push({
        input: block,
        output: out,
        vec,
        product,
        result,
        lines: used.map((row, r) => `${row.map((v, j) => `${v}×${vec[j]}`).join(" + ")} = ${product[r]};  ${product[r]} mod 26 = ${result[r]} → ${ch(result[r])}`),
      });
    }
    if (mode === "decrypt") notes.unshift(`Inverse matrix mod 26 = ${fmt(used)}`);
    return {
      output: items.map((i) => i.output).join(""),
      notes,
      steps: { kind: "hill", matrix: used, keyMatrix: km, inverse: inv ? { det: inv.det, detInv: inv.detInv, adjugate: inv.adjugate } : undefined, items },
    };
  },
});
