"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import { ALGORITHMS, CATEGORIES, type CipherAlgorithm } from "@/lib/ciphers";
import { ICONS } from "./icons";

export default function AlgorithmSelector({ value, onChange }: { value: CipherAlgorithm; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const Icon = ICONS[value.id];

  useEffect(() => {
    if (!open) return;
    dialog.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div>
      <span className="label" id="algo-label">Algorithm</span>
      <button type="button" className="field flex items-center justify-between gap-3 text-left" aria-haspopup="dialog" aria-labelledby="algo-label algo-current" onClick={() => setOpen(true)}>
        <span id="algo-current" className="flex min-w-0 items-center gap-2 font-medium">
          <Icon size={18} className="shrink-0 text-accent" aria-hidden />
          <span className="truncate">{value.name}</span>
        </span>
        <ChevronDown size={18} aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-3 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.div
              ref={dialog}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Choose algorithm"
              className="card max-h-[88vh] w-full max-w-3xl overflow-y-auto bg-panel p-5 outline-none"
              style={{ background: "#0e1428" }}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Choose Algorithm</h2>
                <button className="btn !p-2" aria-label="Close" onClick={() => setOpen(false)}>
                  <X size={16} />
                </button>
              </div>
              {CATEGORIES.map((cat) => (
                <section key={cat.id} className="mb-5">
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">{cat.label}</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {ALGORITHMS.filter((a) => a.category === cat.id).map((a) => {
                      const I = ICONS[a.id];
                      const sel = a.id === value.id;
                      return (
                        <button
                          key={a.id}
                          type="button"
                          aria-pressed={sel}
                          onClick={() => {
                            onChange(a.id);
                            setOpen(false);
                          }}
                          className={`flex items-start gap-3 rounded-2xl border p-3 text-left transition-colors ${sel ? "border-accent bg-accent/15" : "border-line bg-white/[0.03] hover:bg-white/[0.08]"}`}
                        >
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10">
                            <I size={18} aria-hidden />
                          </span>
                          <span>
                            <span className="block font-semibold">{a.name}</span>
                            <span className="block text-sm text-soft">{a.tagline}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
