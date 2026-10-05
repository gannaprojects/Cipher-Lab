import { ArrowLeftRight, Binary, Brackets, Columns3, FlipHorizontal2, Grid3x3, Repeat, RefreshCw, RotateCw, Sigma, Table2, Waves, type LucideIcon } from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  caesar: RotateCw,
  atbash: FlipHorizontal2,
  affine: Sigma,
  vigenere: Table2,
  autokey: Repeat,
  beaufort: ArrowLeftRight,
  playfair: Grid3x3,
  hill: Brackets,
  railfence: Waves,
  columnar: Columns3,
  rot13: RefreshCw,
  bacon: Binary,
};
