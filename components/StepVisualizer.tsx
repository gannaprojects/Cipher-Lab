"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { CharItem, CipherRun, HillItem, Mode, PlayfairItem } from "@/lib/ciphers";
import TabulaRecta from "./TabulaRecta";
import Collapsible from "./Collapsible";

function useStepper(n: number) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setI((x) => (x + 1 >= n ? (setPlaying(false), x) : x + 1)), 1100);
    return () => clearInterval(t);
  }, [playing, n]);
  return { i, setI, playing, toggle: () => setPlaying((p) => (i + 1 >= n ? (setI(0), true) : !p)) };
}

function Controls({ s, n }: { s: ReturnType<typeof useStepper>; n: number }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <button className="btn !p-2" aria-label="Previous step" disabled={s.i === 0} onClick={() => s.setI(s.i - 1)}><ChevronLeft size={16} /></button>
      <button className="btn" onClick={s.toggle}>{s.playing ? <Pause size={15} /> : <Play size={15} />}{s.playing ? "Pause" : "Play"}</button>
      <button className="btn !p-2" aria-label="Next step" disabled={s.i >= n - 1} onClick={() => s.setI(s.i + 1)}><ChevronRight size={16} /></button>
      <span className="text-sm text-soft" aria-live="polite">Step {Math.min(s.i + 1, n)} of {n}</span>
    </div>
  );
}

function Lines({ lines, id }: { lines: string[]; id: string | number }) {
  return (
    <AnimatePresence mode="wait">
      <motion.ol key={id} className="mono space-y-1 rounded-xl bg-black/30 p-3 text-sm" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
        {lines.map((l, k) => (
          <motion.li key={k} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: k * 0.07 }}>{l}</motion.li>
        ))}
      </motion.ol>
    </AnimatePresence>
  );
}

const MAX = 120;

function CharsView({ run }: { run: Extract<CipherRun["steps"], { kind: "chars" }> }) {
  const items = run.items.slice(0, MAX);
  const real = items.map((it, k) => ({ it, k })).filter((x) => !x.it.skip);
  const s = useStepper(real.length || 1);
  const [hover, setHover] = useState<number | null>(null);
  const curIdx = real[s.i]?.k ?? 0; // index into items
  const shown = hover ?? curIdx;
  const cur: CharItem | undefined = items[shown];
  const hasKey = items.some((x) => x.key);
  const seq = run.layout === "sequence";
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.querySelector<HTMLElement>("[data-cur='1']")?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [curIdx]);

  return (
    <div>
      <Controls s={s} n={real.length || 1} />
      <div ref={scroller} className="overflow-x-auto pb-2">
        <div className="flex w-max items-stretch gap-1.5">
          {!seq && (
            <div className="mono sticky left-0 z-10 flex flex-col justify-between gap-1 bg-[#0e1428] pr-2 text-[10px] uppercase tracking-wider text-soft">
              <span className="py-2">Text</span>
              {hasKey && <span className="py-2">Key</span>}
              <span className="py-2">Result</span>
            </div>
          )}
          {seq && <span className="mono self-center pr-2 text-[10px] uppercase tracking-wider text-soft">Read order</span>}
          {items.map((it, k) => {
            const cur2 = k === shown;
            const done = seq && !it.skip && real.findIndex((r) => r.k === k) <= s.i;
            return (
              <button
                key={k}
                data-cur={k === curIdx ? "1" : undefined}
                aria-label={`${it.input} to ${it.output}`}
                aria-pressed={k === curIdx}
                onMouseEnter={() => setHover(k)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(k)}
                onBlur={() => setHover(null)}
                onClick={() => { const j = real.findIndex((r) => r.k === k); if (j >= 0) s.setI(j); }}
                className={`mono relative flex min-w-9 flex-col items-center justify-between gap-1 rounded-xl border px-1.5 py-1 text-lg ${cur2 ? "border-accent bg-accent/20" : "border-transparent"} ${it.skip ? "opacity-40" : ""}`}
              >
                {!seq && <span>{it.input === " " ? "␣" : it.input}</span>}
                {!seq && hasKey && <span className="text-accent2">{it.key ?? "·"}</span>}
                {!seq && <span className="text-xs text-soft">↓</span>}
                <span className={seq && !done ? "text-white/25" : "text-good"}>{it.output === " " ? "␣" : it.output}</span>
              </button>
            );
          })}
        </div>
      </div>
      {run.items.length > MAX && <p className="text-xs text-soft">Showing the first {MAX} characters.</p>}

      {run.grid && <GridView grid={run.grid} items={items} upto={curIdx} cur={cur} />}
      {cur && (
        <div className="mt-3">
          <Lines lines={cur.lines} id={shown} />
        </div>
      )}
      {cur?.tabula && (
        <div className="mt-3">
          <Collapsible title="Tabula Recta (Vigenère table)">
            <TabulaRecta row={cur.tabula.row} col={cur.tabula.col} />
            <p className="mt-2 text-xs text-soft">Row = key letter, column = plaintext letter; where they cross is the ciphertext letter.</p>
          </Collapsible>
        </div>
      )}
    </div>
  );
}

function GridView({ grid, items, upto, cur }: { grid: NonNullable<Extract<CipherRun["steps"], { kind: "chars" }>["grid"]>; items: CharItem[]; upto: number; cur?: CharItem }) {
  const read = new Set(items.slice(0, upto).filter((x) => x.cell).map((x) => x.cell!.join(",")));
  const cols = grid.cells[0]?.length ?? 0;
  return (
    <div className="mt-3 overflow-x-auto">
      <div className="mono inline-grid gap-1 text-sm" style={{ gridTemplateColumns: `${grid.rowHeaders ? "auto " : ""}repeat(${cols}, minmax(1.6rem, 1fr))` }}>
        {grid.colHeaders && (
          <>
            {grid.rowHeaders && <span />}
            {grid.colHeaders.map((h, c) => <span key={c} className="text-center text-xs text-accent2">{h}</span>)}
          </>
        )}
        {grid.cells.map((row, r) => (
          <div key={r} className="contents">
            {grid.rowHeaders && <span className="pr-1 text-xs text-accent2">{grid.rowHeaders[r]}</span>}
            {row.map((c, cc) => {
              const isCur = cur?.cell?.[0] === r && cur.cell[1] === cc;
              const isRead = read.has(`${r},${cc}`);
              return (
                <motion.span key={cc} animate={{ scale: isCur ? 1.15 : 1 }} className={`grid h-7 min-w-6 place-items-center rounded-md border ${isCur ? "border-accent bg-accent/30 text-white" : isRead ? "border-good/40 bg-good/10 text-good" : "border-line text-soft"}`}>
                  {c}
                </motion.span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Playfair ---------- */

const RULES = { row: "Same Row Rule", column: "Same Column Rule", rectangle: "Rectangle Rule" } as const;

function PlayfairView({ run, mode }: { run: Extract<CipherRun["steps"], { kind: "playfair" }>; mode: Mode }) {
  const s = useStepper(run.items.length || 1);
  const it: PlayfairItem | undefined = run.items[s.i];
  const pt = (p: [number, number]) => `${p[1] + 0.5},${p[0] + 0.5}`;
  const is = (r: number, c: number) => (x: [number, number]) => x[0] === r && x[1] === c;
  return (
    <div>
      <div className="mb-3 rounded-xl bg-black/25 p-3 text-sm">
        <p className="label">1 · Prepare the text</p>
        <p className="mono break-all">{run.original || "—"}{run.original.includes("J") ? "  (J → I)" : ""}</p>
        <p className="mt-2 label">2 · Split into pairs</p>
        <div className="flex flex-wrap gap-1.5">
          {run.pairs.map((p, k) => (
            <button key={k} onClick={() => s.setI(k)} aria-pressed={k === s.i} className={`mono rounded-lg border px-2 py-1 ${k === s.i ? "border-accent bg-accent/25" : "border-line"}`}>{p}</button>
          ))}
        </div>
        {run.fixes.length > 0 && mode === "encrypt" && <ul className="mt-2 list-disc pl-5 text-soft">{run.fixes.map((f, k) => <li key={k}>{f}</li>)}</ul>}
      </div>

      <Controls s={s} n={run.items.length || 1} />
      {it && (
        <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
          <div>
            <p className="label">3 · Find the pair in the matrix</p>
            <div className="relative aspect-square w-[min(100%,17rem)]">
              <div className="mono grid h-full grid-cols-5 grid-rows-5 overflow-hidden rounded-xl border border-line text-lg">
                {run.matrix.map((row, r) => row.map((c, cc) => {
                  const inp = is(r, cc)(it.a) || is(r, cc)(it.b);
                  const outp = is(r, cc)(it.outA) || is(r, cc)(it.outB);
                  return (
                    <motion.div key={c} animate={{ backgroundColor: outp ? "rgba(94,234,212,0.3)" : inp ? "rgba(124,140,255,0.45)" : "rgba(255,255,255,0)" }} className="grid place-items-center border border-line/50">
                      {c === "I" ? "I/J" : c}
                    </motion.div>
                  );
                }))}
              </div>
              <svg className="pointer-events-none absolute inset-0" viewBox="0 0 5 5" aria-hidden>
                {it.rule !== "rectangle" && <motion.line key={`l-${s.i}`} x1={it.a[1] + 0.5} y1={it.a[0] + 0.5} x2={it.b[1] + 0.5} y2={it.b[0] + 0.5} stroke="#b087ff" strokeWidth="0.06" strokeDasharray="0.15 0.1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />}
                {it.rule === "rectangle" && <motion.polygon key={`r-${s.i}`} points={[it.a, [it.a[0], it.b[1]], it.b, [it.b[0], it.a[1]]].map((p) => pt(p as [number, number])).join(" ")} fill="rgba(176,135,255,0.12)" stroke="#b087ff" strokeWidth="0.06" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />}
              </svg>
            </div>
            <p className="mt-1 text-xs text-soft"><span className="text-accent">■</span> input pair <span className="ml-2 text-good">■</span> output pair</p>
          </div>
          <div>
            <p className="label">4 · Apply the rule</p>
            <AnimatePresence mode="wait">
              <motion.div key={s.i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="mono space-y-1 text-center text-xl">
                <div>{it.input[0]} + {it.input[1]}</div>
                <div className="text-soft">↓</div>
                <div className="rounded-lg bg-accent2/20 px-2 py-1 font-sans text-base font-semibold">{RULES[it.rule]}</div>
                <div className="text-soft">↓</div>
                <div className="text-good">{it.output[0]} + {it.output[1]}</div>
              </motion.div>
            </AnimatePresence>
            <div className="mt-3"><Lines lines={it.lines} id={s.i} /></div>
          </div>
        </div>
      )}
      <p className="label mt-4">5 · Ciphertext so far</p>
      <p className="mono break-all text-lg tracking-wider text-good">{run.items.slice(0, s.i + 1).map((x) => x.output).join(" ")}</p>
    </div>
  );
}

/* ---------- Hill ---------- */

const MatrixBox = ({ m, accent }: { m: (number | string)[][]; accent?: string }) => (
  <div className="mono inline-grid items-center gap-x-3 gap-y-1 border-x-2 border-white/40 px-2 py-1 text-center" style={{ gridTemplateColumns: `repeat(${m[0].length}, auto)` }}>
    {m.flat().map((v, i) => <span key={i} className={accent}>{v}</span>)}
  </div>
);

function HillView({ run, mode }: { run: Extract<CipherRun["steps"], { kind: "hill" }>; mode: Mode }) {
  const s = useStepper(run.items.length || 1);
  const it: HillItem | undefined = run.items[s.i];
  return (
    <div>
      {mode === "decrypt" && (
        <div className="mb-3 rounded-xl bg-black/25 p-3 text-sm">
          <p>To decrypt a Hill Cipher, we need the inverse of the key matrix modulo 26.</p>
          {run.inverse && (
            <div className="mono mt-2 space-y-1 text-soft">
              <p>det(K) mod 26 = {run.inverse.det}</p>
              <p>det⁻¹ = {run.inverse.detInv}  (since {run.inverse.det} × {run.inverse.detInv} ≡ 1 mod 26)</p>
              <div className="flex flex-wrap items-center gap-2 text-white">
                <span>K⁻¹ = {run.inverse.detInv} ×</span><MatrixBox m={run.inverse.adjugate} /><span>=</span><MatrixBox m={run.matrix} accent="text-good" />
                <span className="text-soft">(mod 26)</span>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="mono mb-3 flex flex-wrap items-center gap-1 text-sm text-soft">
        Letters <span>→</span> Numbers <span>→</span> Vectors <span>→</span> Matrix × <span>→</span> mod 26 <span>→</span> Letters
      </div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {run.items.map((x, k) => <button key={k} onClick={() => s.setI(k)} aria-pressed={k === s.i} className={`mono rounded-lg border px-2 py-1 ${k === s.i ? "border-accent bg-accent/25" : "border-line"}`}>{x.input}</button>)}
      </div>
      <Controls s={s} n={run.items.length || 1} />
      {it && (
        <AnimatePresence mode="wait">
          <motion.div key={s.i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="space-y-3">
            <p className="mono">{it.input.split("").map((c, k) => <span key={k} className="mr-3">{c} = {it.vec[k]}</span>)}</p>
            <div className="mono flex flex-wrap items-center gap-2 text-lg">
              <MatrixBox m={run.matrix} /><span>×</span><MatrixBox m={it.vec.map((v) => [v])} accent="text-accent" /><span>=</span>
              <MatrixBox m={it.product.map((v) => [v])} />
              <span className="text-sm text-soft">mod 26</span><span>=</span>
              <MatrixBox m={it.result.map((v) => [v])} accent="text-accent2" /><span>→</span>
              <span className="text-good">{it.output}</span>
            </div>
            <Lines lines={it.lines} id={s.i} />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export default function StepVisualizer({ run, mode }: { run: CipherRun; mode: Mode }) {
  const st = run.steps;
  return (
    <div>
      {st.kind === "chars" && <CharsView run={st} />}
      {st.kind === "playfair" && <PlayfairView run={st} mode={mode} />}
      {st.kind === "hill" && <HillView run={st} mode={mode} />}
    </div>
  );
}
