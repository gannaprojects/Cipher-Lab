"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dices, Lock, RotateCcw, Unlock } from "lucide-react";
import { getAlgorithm, ALGORITHMS, type CipherAlgorithm, type CipherRun, type Key, type KeyErrors, type Mode } from "@/lib/ciphers";
import AlgorithmSelector from "./AlgorithmSelector";
import CipherInput from "./CipherInput";
import KeyInput from "./KeyInput";
import ResultCard from "./ResultCard";
import ExampleButton from "./ExampleButton";
import StepVisualizer from "./StepVisualizer";
import AlgorithmExplanation from "./AlgorithmExplanation";

interface Ran { sig: string; run: CipherRun }
const sigOf = (id: string, mode: Mode, text: string, key: Key) => JSON.stringify([id, mode, text, key]);

function compute(algo: CipherAlgorithm, mode: Mode, text: string, key: Key): { run?: CipherRun; keyErrors: KeyErrors; textError?: string } {
  const keyErrors = algo.validateKey(key, mode);
  let textError: string | undefined;
  if (!text.trim()) textError = `Enter some ${mode === "encrypt" ? "plaintext" : "ciphertext"} first.`;
  else textError = algo.validateText?.(text, key, mode) ?? undefined;
  if (Object.keys(keyErrors).length || textError) return { keyErrors, textError };
  return { run: algo.getSteps(text, key, mode), keyErrors };
}

export default function Lab({ initialId = "caesar" }: { initialId?: string }) {
  const first = getAlgorithm(initialId) ?? ALGORITHMS[0];
  const [algo, setAlgo] = useState(first);
  const [mode, setMode] = useState<Mode>("encrypt");
  const [text, setText] = useState(first.example.text);
  const [key, setKey] = useState<Key>(first.example.key);
  const [ran, setRan] = useState<Ran | null>(() => ({ sig: sigOf(first.id, "encrypt", first.example.text, first.example.key), run: first.getSteps(first.example.text, first.example.key, "encrypt") }));
  const [attempted, setAttempted] = useState(false);
  const [steps, setSteps] = useState(false);

  const sig = sigOf(algo.id, mode, text, key);
  const keyErrors = useMemo(() => algo.validateKey(key, mode), [algo, key, mode]);
  const fresh = ran && ran.sig === sig ? ran.run : null;
  const textError = attempted ? compute(algo, mode, text, key).textError : undefined;
  const valid = Object.keys(keyErrors).length === 0;

  const run = () => {
    setAttempted(true);
    const r = compute(algo, mode, text, key);
    if (r.run) setRan({ sig, run: r.run });
  };

  const load = (a: CipherAlgorithm, m: Mode) => {
    const t = m === "encrypt" ? a.example.text : a.example.result;
    setAlgo(a);
    setText(t);
    setKey(a.example.key);
    setAttempted(false);
    setRan({ sig: sigOf(a.id, m, t, a.example.key), run: a.getSteps(t, a.example.key, m) });
  };

  const switchMode = (m: Mode) => {
    if (m === mode) return;
    setMode(m);
    setAttempted(false);
    if (fresh) setText(fresh.output); // carry the result over: encrypt → decrypt round trip
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-2">
      <div className="min-w-0 space-y-5">
        <section className="card space-y-4 p-5" aria-label="Encryption calculator">
          <h1 className="text-xl font-semibold">Encryption Playground</h1>
          <div role="tablist" aria-label="Mode" className="grid grid-cols-2 gap-1 rounded-2xl border border-line bg-black/20 p-1">
            {(["encrypt", "decrypt"] as const).map((m) => (
              <button key={m} role="tab" aria-selected={mode === m} onClick={() => switchMode(m)} className={`relative rounded-xl py-2 text-sm font-semibold capitalize ${mode === m ? "text-white" : "text-soft"}`}>
                {mode === m && <motion.span layoutId="mode-pill" className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#6c7bff]/60 to-[#9a74ff]/60" transition={{ duration: 0.2 }} />}
                <span className="relative flex items-center justify-center gap-2">{m === "encrypt" ? <Lock size={15} aria-hidden /> : <Unlock size={15} aria-hidden />}{m}</span>
              </button>
            ))}
          </div>

          <AlgorithmSelector value={algo} onChange={(id) => load(getAlgorithm(id)!, mode)} />
          <CipherInput mode={mode} value={text} onChange={setText} error={textError} rules={algo.inputRules} />

          <AnimatePresence mode="wait">
            <motion.div key={algo.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <KeyInput algo={algo} value={key} errors={keyErrors} onChange={setKey} />
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary min-w-40 flex-1" onClick={run}>{mode === "encrypt" ? "Encrypt Text" : "Decrypt Text"}</button>
            <ExampleButton onClick={() => load(algo, mode)} />
            {algo.generateKey && (
              <button type="button" className="btn" onClick={() => setKey(algo.generateKey!())}>
                <Dices size={16} aria-hidden /> Generate Key
              </button>
            )}
            <button type="button" className="btn" onClick={() => { setText(""); setKey(algo.defaultKey); setRan(null); setAttempted(false); setSteps(false); }}>
              <RotateCcw size={16} aria-hidden /> Reset
            </button>
          </div>
        </section>

        <ResultCard mode={mode} output={fresh ? fresh.output : null} notes={fresh?.notes ?? []} stepsOpen={steps} onSteps={() => setSteps(!steps)} />
        {!fresh && ran && <p className="px-2 text-xs text-soft">Inputs changed — press {mode === "encrypt" ? "Encrypt" : "Decrypt"} to update the result.</p>}
      </div>

      <div className="min-w-0 space-y-5">
        <AnimatePresence initial={false}>
          {steps && fresh && (
            <motion.section key="steps" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="card overflow-hidden" aria-label="Step-by-step visualization">
              <div className="p-5">
                <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-accent">Step by step</h2>
                <StepVisualizer key={sig} run={fresh} mode={mode} />
              </div>
            </motion.section>
          )}
        </AnimatePresence>
        <AlgorithmExplanation algo={algo} keyVal={key} valid={valid} />
      </div>
    </div>
  );
}
