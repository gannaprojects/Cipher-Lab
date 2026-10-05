"use client";
import { AnimatePresence, motion } from "framer-motion";
import type { CipherAlgorithm, Key } from "@/lib/ciphers";
import { buildMatrix } from "@/lib/ciphers/playfair";
import AlphabetVisualizer from "./AlphabetVisualizer";
import Collapsible from "./Collapsible";
import TabulaRecta from "./TabulaRecta";

const Fact = ({ k, v }: { k: string; v: string }) => (
  <span className="chip"><span className="text-white/50">{k}</span> {v}</span>
);

function Visual({ algo, keyVal, valid }: { algo: CipherAlgorithm; keyVal: Key; valid: boolean }) {
  const k = valid ? keyVal : algo.defaultKey;
  if (algo.alphabetMap) {
    const m = algo.alphabetMap(k);
    const label = algo.id === "caesar" ? `shift ${k.shift}` : algo.id === "affine" ? `x → ${k.a}x + ${k.b}` : algo.id === "atbash" ? "reversed" : "shift 13";
    return (
      <div className="space-y-3">
        <AlphabetVisualizer mapped={m} label={label} />
        <p className="mono text-sm text-soft">
          {"ABC".split("").map((c, i) => <span key={c} className="mr-4">{c} → <span className="text-good">{m[i]}</span></span>)}…
        </p>
      </div>
    );
  }
  if (algo.id === "vigenere" || algo.id === "autokey" || algo.id === "beaufort") {
    const kw = (k.key ?? "").toUpperCase().replace(/[^A-Z]/g, "") || "KEY";
    const t = algo.example.text.slice(0, 12);
    const stream = algo.id === "autokey" ? (kw + t).slice(0, t.length) : Array.from({ length: t.length }, (_, i) => kw[i % kw.length]).join("");
    return (
      <div>
        <p className="mb-1 text-sm text-soft">{algo.id === "autokey" ? "The key continues with the message itself:" : "The keyword repeats under the message:"}</p>
        <div className="mono overflow-x-auto text-lg tracking-[0.35em]">
          <div>{t}</div>
          <div className="text-accent2">{stream}</div>
        </div>
        {algo.id !== "beaufort" && (
          <div className="mt-3"><Collapsible title="Show the Vigenère table (Tabula Recta)"><TabulaRecta /></Collapsible></div>
        )}
      </div>
    );
  }
  if (algo.id === "playfair") {
    const m = buildMatrix(k.key ?? "");
    return (
      <div className="space-y-3">
        <div className="mono inline-grid grid-cols-5 gap-1 text-center">
          {m.flat().map((c, i) => <motion.span key={`${c}${i}`} layout className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-white/5">{c === "I" ? "I/J" : c}</motion.span>)}
        </div>
        <p className="text-xs text-soft">Standard convention: I and J share one cell.</p>
        <div className="grid gap-2 text-sm sm:grid-cols-3">
          {[["Same row", "Take the letter to the right", "A B → B C"], ["Same column", "Take the letter below", "A↓ B↓"], ["Rectangle", "Swap to the other corner in your row", "┌ ┐ → ┐ ┌"]].map(([t, d, e]) => (
            <div key={t} className="rounded-xl border border-line bg-black/20 p-2"><b>{t}</b><br /><span className="text-soft">{d}</span><br /><span className="mono text-xs text-accent">{e}</span></div>
          ))}
        </div>
      </div>
    );
  }
  if (algo.id === "hill")
    return (
      <div className="mono flex flex-wrap items-center gap-1 text-sm">
        {["Letters", "Numbers", "Vectors", "Matrix ×", "mod 26", "Letters"].map((s, i, a) => (
          <span key={i} className="flex items-center gap-1"><span className="rounded-lg bg-white/10 px-2 py-1">{s}</span>{i < a.length - 1 && <span className="text-accent">→</span>}</span>
        ))}
      </div>
    );
  if (algo.id === "railfence")
    return <pre className="mono text-sm text-good">{"W . . . E . . . C . . . R . . . L . . . T . . . E\n. E . R . D . S . O . E . E . F . E . A . O . C .\n. . A . . . I . . . V . . . D . . . E . . . N . ."}</pre>;
  if (algo.id === "columnar") return <p className="mono text-sm text-soft">Write in rows → number columns by keyword order → read columns.</p>;
  if (algo.id === "bacon") return <p className="mono text-sm text-soft">H = 7 = 00111 → <span className="text-good">AABBB</span></p>;
  return null;
}

export default function AlgorithmExplanation({ algo, keyVal, valid }: { algo: CipherAlgorithm; keyVal: Key; valid: boolean }) {
  return (
    <section className="card p-5" aria-labelledby="how-title">
      <h2 id="how-title" className="text-xs font-bold uppercase tracking-widest text-accent">How {algo.name} works</h2>
      <p className="mt-2 text-lg font-semibold">{algo.tagline}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Fact k="Type" v={algo.type} />
        <Fact k="Key" v={algo.keyType} />
        <Fact k="Difficulty" v={algo.difficulty} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={algo.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="mt-4 space-y-3">
          <div className="overflow-x-auto rounded-2xl border border-line bg-black/20 p-3"><Visual algo={algo} keyVal={keyVal} valid={valid} /></div>
          <Collapsible title="What is it?" defaultOpen><p className="text-sm leading-relaxed text-soft">{algo.what}</p></Collapsible>
          <Collapsible title="How does it work?">
            <ol className="list-decimal space-y-1 pl-5 text-sm text-soft">{algo.how.map((h, i) => <li key={i}>{h}</li>)}</ol>
          </Collapsible>
          <Collapsible title="Simple example">
            <p className="mono text-sm">
              {algo.example.text} <span className="text-accent">→</span> <span className="text-good">{algo.example.result}</span>
            </p>
            <p className="mono mt-1 text-xs text-soft">
              {Object.keys(algo.example.key).length ? `Key: ${algo.example.key.m ? `${algo.example.key.size}×${algo.example.key.size} matrix [${algo.example.key.m}]` : Object.entries(algo.example.key).map(([k, v]) => `${k} = ${v}`).join(", ")}` : "No key needed."}
            </p>
          </Collapsible>
          {algo.formulas && (
            <Collapsible title="Formulas" defaultOpen>
              <div className="mono space-y-1 text-sm">
                <p><span className="text-soft">Encrypt: </span>{algo.formulas.encrypt}</p>
                <p><span className="text-soft">Decrypt: </span>{algo.formulas.decrypt}</p>
              </div>
              <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-soft">{algo.formulas.legend.map((l, i) => <li key={i}>{l}</li>)}</ul>
            </Collapsible>
          )}
          <Collapsible title="What happens to spaces, digits and punctuation?"><p className="text-sm text-soft">{algo.inputRules}</p></Collapsible>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
