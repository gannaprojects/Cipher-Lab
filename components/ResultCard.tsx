"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Info } from "lucide-react";
import type { Mode } from "@/lib/ciphers";
import CopyButton from "./CopyButton";

export default function ResultCard({ mode, output, notes, onSteps, stepsOpen }: { mode: Mode; output: string | null; notes: string[]; onSteps: () => void; stepsOpen: boolean }) {
  return (
    <div className="card p-5" aria-live="polite">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="label !mb-0">Result · {mode === "encrypt" ? "Ciphertext" : "Plaintext"}</h2>
      </div>
      <AnimatePresence mode="wait">
        {output === null ? (
          <motion.p key="empty" className="py-3 text-sm text-soft" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            Press the button above to see the result.
          </motion.p>
        ) : (
          <motion.div key={output} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <p data-testid="result" className="mono min-h-10 break-all whitespace-pre-wrap rounded-xl bg-black/30 p-3 text-xl tracking-wider text-good">{output || "(empty)"}</p>
            {notes.length > 0 && (
              <ul className="mt-3 space-y-1.5 text-sm text-soft">
                {notes.map((n, i) => (
                  <li key={i} className="flex gap-2">
                    <Info size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <CopyButton text={output} />
              <button type="button" className="btn" aria-expanded={stepsOpen} onClick={onSteps}>
                {stepsOpen ? "Hide Steps" : "Show Steps"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
