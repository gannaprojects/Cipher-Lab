import { describe, expect, it } from "vitest";
import { ALGORITHMS, getAlgorithm } from "../lib/ciphers";
import { caesar } from "../lib/ciphers/caesar";
import { vigenere } from "../lib/ciphers/vigenere";
import { playfair, buildMatrix, preparePairs } from "../lib/ciphers/playfair";
import { hill, determinant, inverseMod26, randomInvertibleMatrix } from "../lib/ciphers/hill";
import { affine } from "../lib/ciphers/affine";
import { atbash } from "../lib/ciphers/atbash";
import { rot13 } from "../lib/ciphers/rot13";
import { railFence } from "../lib/ciphers/railFence";
import { columnar } from "../lib/ciphers/columnar";
import { autokey } from "../lib/ciphers/autokey";
import { beaufort } from "../lib/ciphers/beaufort";
import { bacon } from "../lib/ciphers/bacon";
import { mod, modInverse } from "../lib/ciphers/util";

describe("math helpers", () => {
  it("mod handles negatives", () => {
    expect(mod(-1)).toBe(25);
    expect(mod(-27)).toBe(25);
    expect(mod(52)).toBe(0);
  });
  it("modInverse", () => {
    expect(modInverse(9)).toBe(3);
    expect(modInverse(5)).toBe(21);
    expect(modInverse(13)).toBeNull();
    expect(modInverse(2)).toBeNull();
  });
});

describe("caesar", () => {
  it("HELLO / 3", () => {
    expect(caesar.encrypt("HELLO", { shift: "3" })).toBe("KHOOR");
    expect(caesar.decrypt("KHOOR", { shift: "3" })).toBe("HELLO");
  });
  it("wraps, keeps case and punctuation", () => {
    expect(caesar.encrypt("Xyz, abc!", { shift: "3" })).toBe("Abc, def!");
    expect(caesar.decrypt("Abc, def!", { shift: "3" })).toBe("Xyz, abc!");
  });
  it("shift 0 and 25", () => {
    expect(caesar.encrypt("ABC", { shift: "0" })).toBe("ABC");
    expect(caesar.encrypt("ABC", { shift: "25" })).toBe("ZAB");
  });
  it("validates", () => {
    for (const s of ["-1", "26", "", "x", "1.5"]) expect(caesar.validateKey({ shift: s }, "encrypt").shift).toBeTruthy();
    expect(caesar.validateKey({ shift: "25" }, "encrypt")).toEqual({});
  });
});

describe("vigenere", () => {
  it("ATTACKATDAWN / LEMON", () => {
    expect(vigenere.encrypt("ATTACKATDAWN", { key: "LEMON" })).toBe("LXFOPVEFRNHR");
    expect(vigenere.decrypt("LXFOPVEFRNHR", { key: "LEMON" })).toBe("ATTACKATDAWN");
  });
  it("key advances only on letters", () => {
    expect(vigenere.encrypt("ATTACK AT DAWN", { key: "LEMON" })).toBe("LXFOPV EF RNHR");
  });
  it("validates", () => {
    expect(vigenere.validateKey({ key: "" }, "encrypt").key).toBe("Key must contain letters.");
    expect(vigenere.validateKey({ key: "12" }, "encrypt").key).toBeTruthy();
    expect(vigenere.validateKey({ key: "LEMON" }, "encrypt")).toEqual({});
  });
});

describe("playfair", () => {
  it("MONARCHY matrix (I/J merged)", () => {
    expect(buildMatrix("MONARCHY").map((r) => r.join(""))).toEqual(["MONAR", "CHYBD", "EFGIK", "LPQST", "UVWXZ"]);
  });
  it("preprocessing: BALLOON -> BA LX LO ON", () => {
    expect(preparePairs("BALLOON").pairs).toEqual(["BA", "LX", "LO", "ON"]);
    expect(preparePairs("HELLO").pairs).toEqual(["HE", "LX", "LO"]);
    expect(preparePairs("XX").pairs).toEqual(["XQ", "XQ"]);
    expect(preparePairs("JAM").pairs).toEqual(["IA", "MX"]);
  });
  it("rectangle rule: HI -> BF", () => {
    expect(playfair.encrypt("HI", { key: "MONARCHY" })).toBe("BF");
    expect(playfair.decrypt("BF", { key: "MONARCHY" })).toBe("HI");
  });
  it("classic example: instrumentsz -> gatlmzclrqtx", () => {
    expect(playfair.encrypt("instrumentsz", { key: "MONARCHY" })).toBe("GATLMZCLRQTX");
  });
  it("Wikipedia: hide the gold in the tree stump", () => {
    expect(playfair.encrypt("hide the gold in the tree stump", { key: "PLAYFAIREXAMPLE" })).toBe("BMODZBXDNABEKUDMUIXMMOUVIF");
    expect(playfair.decrypt("BMODZBXDNABEKUDMUIXMMOUVIF", { key: "PLAYFAIREXAMPLE" })).toBe("HIDETHEGOLDINTHETREXESTUMP");
  });
  it("row and column rules wrap", () => {
    // MONARCHY: M O in same row -> O N ; row wrap: R M -> M O
    expect(playfair.encrypt("MO", { key: "MONARCHY" })).toBe("ON");
    expect(playfair.encrypt("RM", { key: "MONARCHY" })).toBe("MO");
    // same column: M and C -> C E ; Z? column 0: M C E L U ; U M -> M C
    expect(playfair.encrypt("MC", { key: "MONARCHY" })).toBe("CE");
    expect(playfair.encrypt("UM", { key: "MONARCHY" })).toBe("MC");
  });
  it("round trip returns the padded, normalized text", () => {
    const c = playfair.encrypt("Balloon", { key: "monarchy" });
    expect(playfair.decrypt(c, { key: "MONARCHY" })).toBe("BALXLOON");
  });
  it("validates", () => {
    expect(playfair.validateKey({ key: "" }, "encrypt").key).toBeTruthy();
    expect(playfair.validateText!("ABC", { key: "K" }, "decrypt")).toBeTruthy();
    expect(playfair.validateText!("AA", { key: "K" }, "decrypt")).toBeTruthy();
  });
});

describe("hill", () => {
  const k2 = { size: "2", m: "3,3,2,5" };
  it("determinant & inverse", () => {
    expect(determinant([[3, 3], [2, 5]])).toBe(9);
    expect(inverseMod26([[3, 3], [2, 5]])?.inverse).toEqual([[15, 17], [20, 9]]);
    expect(determinant([[6, 24, 1], [13, 16, 10], [20, 17, 15]])).toBe(441);
    expect(inverseMod26([[2, 4], [1, 2]])).toBeNull();
    expect(inverseMod26([[2, 0], [0, 1]])).toBeNull(); // det 2
  });
  it("3x3 inverse satisfies K·K⁻¹ = I (mod 26)", () => {
    const K = [[6, 24, 1], [13, 16, 10], [20, 17, 15]];
    const inv = inverseMod26(K)!.inverse;
    const prod = K.map((r) => inv[0].map((_, j) => mod(r.reduce((s, v, i) => s + v * inv[i][j], 0))));
    expect(prod).toEqual([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
  });
  it("2x2 HELP -> HIAT", () => {
    expect(hill.encrypt("HELP", k2)).toBe("HIAT");
    expect(hill.decrypt("HIAT", k2)).toBe("HELP");
  });
  it("HI -> TC", () => expect(hill.encrypt("HI", k2)).toBe("TC"));
  it("3x3 ACT -> POH", () => {
    const k3 = { size: "3", m: "6,24,1,13,16,10,20,17,15" };
    expect(hill.encrypt("ACT", k3)).toBe("POH");
    expect(hill.decrypt("POH", k3)).toBe("ACT");
  });
  it("pads with X", () => {
    expect(hill.decrypt(hill.encrypt("HEY", k2), k2)).toBe("HEYX");
  });
  it("rejects non-invertible matrix for decrypt only", () => {
    const bad = { size: "2", m: "2,4,1,2" };
    expect(hill.validateKey(bad, "decrypt").m).toMatch(/no modular inverse/);
    expect(hill.validateKey(bad, "encrypt")).toEqual({});
    expect(hill.validateKey({ size: "2", m: "1,x,3,4" }, "encrypt").m).toBe("Matrix must contain integers in every cell.");
  });
  it("negative entries are reduced mod 26", () => {
    expect(hill.encrypt("HELP", { size: "2", m: "-23,3,2,5" })).toBe("HIAT");
  });
  it("generated keys are always invertible and round-trip", () => {
    for (let i = 0; i < 50; i++) {
      const key = hill.generateKey!();
      expect(hill.validateKey(key, "decrypt")).toEqual({});
      expect(hill.decrypt(hill.encrypt("ATTACKATDAWNX", key), key).startsWith("ATTACKATDAWNX")).toBe(true);
      expect(inverseMod26(randomInvertibleMatrix(3))).not.toBeNull();
    }
  });
});

describe("affine", () => {
  const k = { a: "5", b: "8" };
  it("AFFINE CIPHER", () => {
    expect(affine.encrypt("AFFINE CIPHER", k)).toBe("IHHWVC SWFRCP");
    expect(affine.decrypt("IHHWVC SWFRCP", k)).toBe("AFFINE CIPHER");
  });
  it("a must be coprime with 26", () => {
    for (const a of ["2", "13", "26", "0", "x"]) expect(affine.validateKey({ a, b: "1" }, "encrypt").a).toBeTruthy();
    expect(affine.validateKey({ a: "7", b: "1" }, "encrypt")).toEqual({});
  });
  it("round trips for every valid a", () => {
    for (const a of [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25])
      expect(affine.decrypt(affine.encrypt("Hello, World", { a: String(a), b: "11" }), { a: String(a), b: "11" })).toBe("Hello, World");
  });
  it("negative b", () => expect(affine.encrypt("A", { a: "1", b: "-1" })).toBe("Z"));
});

describe("other ciphers", () => {
  it("atbash", () => {
    expect(atbash.encrypt("HELLO", {})).toBe("SVOOL");
    expect(atbash.decrypt("SVOOL", {})).toBe("HELLO");
  });
  it("rot13", () => {
    expect(rot13.encrypt("HELLO", {})).toBe("URYYB");
    expect(rot13.decrypt(rot13.encrypt("Hello!", {}), {})).toBe("Hello!");
  });
  it("rail fence", () => {
    expect(railFence.encrypt("WEAREDISCOVEREDFLEEATONCE", { rails: "3" })).toBe("WECRLTEERDSOEEFEAOCAIVDEN");
    expect(railFence.decrypt("WECRLTEERDSOEEFEAOCAIVDEN", { rails: "3" })).toBe("WEAREDISCOVEREDFLEEATONCE");
    for (const r of [2, 4, 7, 30]) expect(railFence.decrypt(railFence.encrypt("Hello, World!", { rails: String(r) }), { rails: String(r) })).toBe("Hello, World!");
    expect(railFence.validateKey({ rails: "1" }, "encrypt").rails).toBe("Number of rails must be a whole number, at least 2.");
  });
  it("columnar", () => {
    expect(columnar.encrypt("ABCDEF", { key: "BA" })).toBe("BDFACE");
    expect(columnar.decrypt("BDFACE", { key: "BA" })).toBe("ABCDEF");
    expect(columnar.decrypt(columnar.encrypt("WEAREDISCOVERED", { key: "ZEBRAS" }), { key: "ZEBRAS" })).toBe("WEAREDISCOVEREDXXX");
  });
  it("autokey", () => {
    expect(autokey.encrypt("ATTACKATDAWN", { key: "QUEENLY" })).toBe("QNXEPVYTWTWP");
    expect(autokey.decrypt("QNXEPVYTWTWP", { key: "QUEENLY" })).toBe("ATTACKATDAWN");
  });
  it("beaufort", () => {
    const k = { key: "FORTIFICATION" };
    expect(beaufort.encrypt("DEFENDTHEEASTWALLOFTHECASTLE", k)).toBe("CKMPVCPVWPIWUJOGIUAPVWRIWUUK");
    expect(beaufort.decrypt("CKMPVCPVWPIWUJOGIUAPVWRIWUUK", k)).toBe("DEFENDTHEEASTWALLOFTHECASTLE");
  });
  it("bacon", () => {
    expect(bacon.encrypt("HELLO", {})).toBe("AABBB AABAA ABABB ABABB ABBBA");
    expect(bacon.decrypt("AABBB AABAA ABABB ABABB ABBBA", {})).toBe("HELLO");
    expect(bacon.decrypt("aabbbaabaaababbababbabbba", {})).toBe("HELLO");
  });
});

describe("every algorithm: documented example & round trip", () => {
  it.each(ALGORITHMS.map((a) => [a.id]))("%s", (id) => {
    const a = getAlgorithm(id)!;
    expect(a.validateKey(a.example.key, "decrypt")).toEqual({});
    expect(a.encrypt(a.example.text, a.example.key)).toBe(a.example.result);
    const back = a.decrypt(a.example.result, a.example.key);
    // reversible: re-encrypting the decrypted text must give the same ciphertext
    expect(a.encrypt(back, a.example.key)).toBe(a.example.result);
  });
  it("generateKey always validates", () => {
    for (const a of ALGORITHMS) if (a.generateKey) for (let i = 0; i < 20; i++) expect(a.validateKey(a.generateKey(), "decrypt")).toEqual({});
  });
});
