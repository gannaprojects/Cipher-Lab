"use client";
import { ALPHABET } from "@/lib/ciphers/util";

/** Vigenère table. Row = key letter, column = plaintext letter, cell = ciphertext letter. */
export default function TabulaRecta({ row, col }: { row?: string; col?: string }) {
  const r = row ? ALPHABET.indexOf(row) : -1;
  const c = col ? ALPHABET.indexOf(col) : -1;
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-black/20 p-2" role="img" aria-label={row && col ? `Tabula recta: key row ${row}, text column ${col}, result ${ALPHABET[(r + c) % 26]}` : "Tabula recta"}>
      <table className="mono mx-auto border-separate border-spacing-0 text-[10px] leading-none sm:text-xs">
        <thead>
          <tr>
            <th className="p-1" />
            {ALPHABET.split("").map((l, j) => (
              <th key={l} className={`p-1 ${j === c ? "bg-accent/30 text-white" : "text-accent"}`}>{l}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ALPHABET.split("").map((k, i) => (
            <tr key={k}>
              <th className={`p-1 ${i === r ? "bg-accent2/30 text-white" : "text-accent2"}`}>{k}</th>
              {ALPHABET.split("").map((_, j) => {
                const hit = i === r && j === c;
                return (
                  <td key={j} className={`p-1 text-center ${hit ? "rounded bg-good font-bold text-black" : i === r || j === c ? "bg-white/10 text-white" : "text-soft"}`}>
                    {ALPHABET[(i + j) % 26]}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
