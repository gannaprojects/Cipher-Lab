import type { Category, CipherAlgorithm } from "./types";
import { caesar } from "./caesar";
import { atbash } from "./atbash";
import { affine } from "./affine";
import { vigenere } from "./vigenere";
import { autokey } from "./autokey";
import { beaufort } from "./beaufort";
import { playfair } from "./playfair";
import { hill } from "./hill";
import { railFence } from "./railFence";
import { columnar } from "./columnar";
import { rot13 } from "./rot13";
import { bacon } from "./bacon";

export const ALGORITHMS: CipherAlgorithm[] = [caesar, atbash, affine, vigenere, autokey, beaufort, playfair, hill, railFence, columnar, rot13, bacon];

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "substitution", label: "Substitution" },
  { id: "polyalphabetic", label: "Polyalphabetic" },
  { id: "matrix", label: "Polygraph / Matrix" },
  { id: "transposition", label: "Transposition" },
  { id: "other", label: "Other / Educational" },
];

export const getAlgorithm = (id: string) => ALGORITHMS.find((a) => a.id === id);

export * from "./types";
