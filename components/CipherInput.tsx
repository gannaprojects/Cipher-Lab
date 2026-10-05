"use client";
import type { Mode } from "@/lib/ciphers";

export default function CipherInput({ mode, value, onChange, error, rules }: { mode: Mode; value: string; onChange: (v: string) => void; error?: string | null; rules: string }) {
  return (
    <div>
      <label className="label" htmlFor="input-text">{mode === "encrypt" ? "Plaintext" : "Ciphertext"}</label>
      <textarea
        id="input-text"
        rows={3}
        className="field mono resize-y"
        value={value}
        spellCheck={false}
        placeholder={mode === "encrypt" ? "Enter your text here…" : "Enter the text to decrypt…"}
        aria-invalid={!!error || undefined}
        aria-describedby="input-rules"
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="err" role="alert">{error}</p>}
      <p id="input-rules" className="mt-1.5 text-xs text-soft">{rules}</p>
    </div>
  );
}
