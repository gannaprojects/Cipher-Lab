import Link from "next/link";
import { ALGORITHMS, CATEGORIES } from "@/lib/ciphers";
import { ICONS } from "@/components/icons";

export const metadata = { title: "Algorithms — Cipher Lab" };

export default function Algorithms() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Algorithms</h1>
        <p className="mt-1 text-soft">Pick a cipher to open its interactive lesson.</p>
      </div>
      {CATEGORIES.map((c) => (
        <section key={c.id} aria-labelledby={`cat-${c.id}`}>
          <h2 id={`cat-${c.id}`} className="mb-3 text-xs font-bold uppercase tracking-widest text-accent">{c.label}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ALGORITHMS.filter((a) => a.category === c.id).map((a) => {
              const I = ICONS[a.id];
              return (
                <Link key={a.id} href={`/algorithms/${a.id}`} className="card flex flex-col gap-2 p-5 transition-colors hover:border-accent">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10"><I size={20} aria-hidden /></span>
                  <span className="text-lg font-semibold">{a.name}</span>
                  <span className="text-sm text-soft">{a.tagline}</span>
                  <span className="mt-auto flex flex-wrap gap-1.5 pt-2"><span className="chip">{a.type}</span><span className="chip">{a.difficulty}</span></span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
