import { isInt, keyOf, makeCipher, randInt } from "./util";
import type { CharItem } from "./types";

const railOf = (len: number, rails: number) => {
  const period = 2 * (rails - 1);
  return Array.from({ length: len }, (_, i) => {
    const m = i % period;
    return m < rails ? m : period - m;
  });
};

export const railFence = makeCipher({
  id: "railfence",
  name: "Rail Fence Cipher",
  tagline: "Write in a zigzag, read row by row.",
  category: "transposition",
  type: "Transposition",
  keyType: "Number",
  difficulty: "Beginner",
  keyFields: [{ name: "rails", label: "Number of rails", kind: "number", placeholder: "2 or more", hint: "How many rows the zigzag uses." }],
  defaultKey: { rails: "3" },
  example: { text: "WEAREDISCOVEREDFLEEATONCE", key: { rails: "3" }, result: "WECRLTEERDSOEEFEAOCAIVDEN" },
  inputRules: "Every character, including spaces and punctuation, is moved exactly as typed — nothing is removed or changed. Case is preserved.",
  what: "A transposition cipher: the letters are not replaced, only rearranged. The message is written diagonally down and up across several rails, then read off rail by rail.",
  how: ["Draw the number of rails (rows).", "Write the message in a zigzag: down the rails, then back up.", "Read each rail left to right, top rail first.", "To decrypt, rebuild the same zigzag shape, fill it rail by rail, and read it in zigzag order."],
  validateKey(key) {
    const r = keyOf(key, "rails");
    return isInt(r) && +r >= 2 ? {} : { rails: "Number of rails must be a whole number, at least 2." };
  },
  generateKey: () => ({ rails: String(randInt(2, 5)) }),
  process(text, key, mode) {
    const chars = [...text];
    const rails = Number(key.rails);
    const rail = railOf(chars.length, rails);
    const order = chars.map((_, i) => i).sort((a, b) => rail[a] - rail[b] || a - b); // read order
    const cells: string[][] = Array.from({ length: rails }, () => Array(chars.length).fill(""));
    const out: string[] = Array(chars.length);
    const items: CharItem[] = [];
    order.forEach((idx, j) => {
      const src = mode === "encrypt" ? chars[idx] : chars[j];
      if (mode === "encrypt") out[j] = src;
      else out[idx] = src;
      cells[rail[idx]][idx] = src;
      items.push({
        input: src,
        output: src,
        cell: [rail[idx], idx],
        lines:
          mode === "encrypt"
            ? [`"${src}" sits on rail ${rail[idx] + 1}, column ${idx + 1}.`, `Reading rail ${rail[idx] + 1} left to right gives it position ${j + 1} in the ciphertext.`]
            : [`Ciphertext letter ${j + 1} "${src}" fills rail ${rail[idx] + 1}, column ${idx + 1}.`, "Reading the zigzag top-left to right restores the message."],
      });
    });
    return {
      output: out.join(""),
      notes: [],
      steps: { kind: "chars", layout: "sequence", items, grid: { cells, rowHeaders: Array.from({ length: rails }, (_, i) => `R${i + 1}`) } },
    };
  },
});
