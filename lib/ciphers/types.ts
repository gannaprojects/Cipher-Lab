export type Mode = "encrypt" | "decrypt";
/** Every key field is stored as a string (what the user typed); each cipher parses its own. */
export type Key = Record<string, string>;
export type KeyErrors = Record<string, string | undefined>;

export type Category = "substitution" | "polyalphabetic" | "matrix" | "transposition" | "other";

export interface KeyField {
  name: string;
  label: string;
  kind: "number" | "text" | "size" | "matrix";
  placeholder?: string;
  hint?: string;
}

/** One column of the "chars" visualization. */
export interface CharItem {
  input: string;
  output: string;
  key?: string;
  lines: string[];
  skip?: boolean;
  tabula?: { row: string; col: string };
  /** [row, col] in the optional grid */
  cell?: [number, number];
}

export interface PlayfairItem {
  input: string;
  output: string;
  rule: "row" | "column" | "rectangle";
  a: [number, number];
  b: [number, number];
  outA: [number, number];
  outB: [number, number];
  lines: string[];
}

export interface HillItem {
  input: string;
  output: string;
  vec: number[];
  product: number[];
  result: number[];
  lines: string[];
}

export type Steps =
  | {
      kind: "chars";
      /** "map": TEXT / KEY / RESULT rows. "sequence": only the output being built in read order. */
      layout: "map" | "sequence";
      items: CharItem[];
      grid?: { cells: string[][]; colHeaders?: string[]; rowHeaders?: string[] };
    }
  | {
      kind: "playfair";
      matrix: string[][];
      original: string;
      pairs: string[];
      fixes: string[];
      items: PlayfairItem[];
    }
  | {
      kind: "hill";
      /** matrix actually multiplied (key for encrypt, inverse for decrypt) */
      matrix: number[][];
      keyMatrix: number[][];
      inverse?: { det: number; detInv: number; adjugate: number[][] };
      items: HillItem[];
    };

export interface CipherRun {
  output: string;
  /** Plain-language messages about what was normalized, padded or skipped. */
  notes: string[];
  steps: Steps;
}

export interface CipherAlgorithm {
  id: string;
  name: string;
  tagline: string;
  category: Category;
  type: string;
  keyType: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  keyFields: KeyField[];
  defaultKey: Key;
  example: { text: string; key: Key; result: string };
  /** What happens to spaces, digits, punctuation, case. */
  inputRules: string;
  what: string;
  how: string[];
  formulas?: { encrypt: string; decrypt: string; legend: string[] };
  validateKey(key: Key, mode: Mode): KeyErrors;
  validateText?(text: string, key: Key, mode: Mode): string | null;
  generateKey?(): Key;
  /** 26 letters showing where A..Z go on encryption (for the alphabet visualizer). */
  alphabetMap?(key: Key): string;
  encrypt(text: string, key: Key): string;
  decrypt(text: string, key: Key): string;
  getSteps(text: string, key: Key, mode: Mode): CipherRun;
}

export type CipherDef = Omit<CipherAlgorithm, "encrypt" | "decrypt" | "getSteps"> & {
  process(text: string, key: Key, mode: Mode): CipherRun;
};
