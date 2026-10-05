"use client";

/** n×n grid of integer inputs. `value` is the comma-separated row-major string. */
export default function MatrixInput({ size, value, onChange, error }: { size: number; value: string; onChange: (v: string) => void; error?: string }) {
  const cells = value.split(",");
  while (cells.length < size * size) cells.push("");
  const set = (i: number, v: string) => {
    const next = cells.slice(0, size * size);
    next[i] = v.replace(/[^\d-]/g, "");
    onChange(next.join(","));
  };
  return (
    <div>
      <div className="inline-grid gap-2 rounded-2xl border border-line bg-black/20 p-3" style={{ gridTemplateColumns: `repeat(${size}, 3.5rem)` }} role="group" aria-label={`${size} by ${size} key matrix`}>
        {Array.from({ length: size * size }, (_, i) => (
          <input
            key={i}
            inputMode="numeric"
            aria-label={`Row ${Math.floor(i / size) + 1}, column ${(i % size) + 1}`}
            aria-invalid={!!error || undefined}
            value={cells[i] ?? ""}
            onChange={(e) => set(i, e.target.value)}
            className="field mono !px-1 text-center"
          />
        ))}
      </div>
    </div>
  );
}
