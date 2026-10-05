"use client";
import type { CipherAlgorithm, Key, KeyErrors } from "@/lib/ciphers";
import MatrixInput from "./MatrixInput";

export default function KeyInput({ algo, value, errors, onChange }: { algo: CipherAlgorithm; value: Key; errors: KeyErrors; onChange: (k: Key) => void }) {
  if (!algo.keyFields.length)
    return (
      <div>
        <span className="label">Key</span>
        <p className="rounded-xl border border-line bg-black/20 px-3 py-2 text-sm text-soft">{algo.name} needs no key.</p>
      </div>
    );
  const set = (name: string, v: string) => onChange({ ...value, [name]: v });
  const grid = algo.keyFields.length > 1 && algo.keyFields.every((f) => f.kind === "number");
  return (
    <div className={grid ? "grid grid-cols-2 gap-3" : "space-y-3"}>
      {algo.keyFields.map((f) => {
        const id = `key-${algo.id}-${f.name}`;
        const err = errors[f.name];
        if (f.kind === "size")
          return (
            <div key={f.name}>
              <span className="label" id={id}>{f.label}</span>
              <div role="radiogroup" aria-labelledby={id} className="flex gap-2">
                {["2", "3"].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={value.size === n}
                    onClick={() => {
                      // resize matrix, keeping an invertible default
                      onChange({ ...value, size: n, m: n === "2" ? "3,3,2,5" : "6,24,1,13,16,10,20,17,15" });
                    }}
                    className={`btn ${value.size === n ? "!border-accent !bg-accent/20" : ""}`}
                  >
                    {n}×{n}
                  </button>
                ))}
              </div>
            </div>
          );
        if (f.kind === "matrix")
          return (
            <div key={f.name}>
              <span className="label" id={id}>{f.label}</span>
              <MatrixInput size={Number(value.size)} value={value.m ?? ""} onChange={(v) => set(f.name, v)} error={err} />
              {err ? <p className="err" role="alert">{err}</p> : f.hint && <p className="mt-2 text-xs text-soft">{f.hint}</p>}
            </div>
          );
        return (
          <div key={f.name}>
            <label className="label" htmlFor={id}>{f.label}</label>
            <input
              id={id}
              className="field mono"
              value={value[f.name] ?? ""}
              placeholder={f.placeholder}
              inputMode={f.kind === "number" ? "numeric" : "text"}
              aria-invalid={!!err || undefined}
              aria-describedby={err ? `${id}-err` : undefined}
              autoCapitalize="characters"
              spellCheck={false}
              onChange={(e) => set(f.name, f.kind === "number" ? e.target.value.replace(/[^\d-]/g, "") : e.target.value)}
            />
            {err ? <p id={`${id}-err`} className="err" role="alert">{err}</p> : f.hint && !grid && <p className="mt-1.5 text-xs text-soft">{f.hint}</p>}
          </div>
        );
      })}
    </div>
  );
}
