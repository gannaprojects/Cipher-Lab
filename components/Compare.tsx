"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ALGORITHMS, type Key } from "@/lib/ciphers";
import CopyButton from "./CopyButton";
import KeyInput from "./KeyInput";

export default function Compare() {
  const [text, setText] = useState("HELLO WORLD");
  const [sel, setSel] = useState<string[]>(["caesar", "vigenere", "playfair", "hill"]);
  const [keys, setKeys] = useState<Record<string, Key>>(() => Object.fromEntries(ALGORITHMS.map((a) => [a.id, a.example.key])));
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Compare Algorithms</h1>
        <p className="mt-1 text-soft">Encrypt the same text with several ciphers and see how different the results look.</p>
      </div>
      <div className="card space-y-4 p-5">
        <div>
          <label htmlFor="cmp-text" className="label">Plaintext</label>
          <input id="cmp-text" className="field mono" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
        </div>
        <fieldset>
          <legend className="label">Algorithms to compare</legend>
          <div className="flex flex-wrap gap-2">
            {ALGORITHMS.map((a) => (
              <label key={a.id} className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${sel.includes(a.id) ? "border-accent bg-accent/20" : "border-line text-soft"}`}>
                <input type="checkbox" className="sr-only" checked={sel.includes(a.id)} onChange={() => toggle(a.id)} />
                {a.name}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {ALGORITHMS.filter((a) => sel.includes(a.id)).map((a) => {
          const key = keys[a.id];
          const errs = a.validateKey(key, "encrypt");
          const textErr = !text.trim() ? "Enter some text." : a.validateText?.(text, key, "encrypt");
          const out = Object.keys(errs).length || textErr ? null : a.encrypt(text, key);
          return (
            <motion.section layout key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="card space-y-3 p-5">
              <h2 className="font-semibold">{a.name}</h2>
              <KeyInput algo={a} value={key} errors={errs} onChange={(k) => setKeys({ ...keys, [a.id]: k })} />
              {out !== null ? (
                <>
                  <p className="mono break-all rounded-xl bg-black/30 p-3 text-good" data-testid={`cmp-${a.id}`}>{out}</p>
                  <CopyButton text={out} label="Copy" />
                </>
              ) : (
                <p className="err">{textErr || "Fix the key above to see the result."}</p>
              )}
            </motion.section>
          );
        })}
      </div>
      {sel.length === 0 && <p className="text-soft">Select at least one algorithm.</p>}
    </div>
  );
}
