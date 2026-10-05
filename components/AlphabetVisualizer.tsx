"use client";
import { motion } from "framer-motion";
import { ALPHABET } from "@/lib/ciphers/util";

/** Top row: plain alphabet. Bottom row: where each letter goes. Bottom letters glide when the key changes. */
export default function AlphabetVisualizer({ mapped, label }: { mapped: string; label: string }) {
  return (
    <div className="overflow-x-auto" role="img" aria-label={`${ALPHABET} becomes ${mapped}`}>
      <div className="mono w-max text-sm sm:text-base">
        <div className="flex">
          {ALPHABET.split("").map((l) => <span key={l} className="w-6 text-center text-soft sm:w-7">{l}</span>)}
        </div>
        <div className="my-1 pl-1 text-xs text-accent">↓ {label}</div>
        <div className="flex">
          {mapped.split("").map((l, i) => (
            <motion.span key={`${l}`} layout transition={{ type: "spring", stiffness: 320, damping: 30 }} className="w-6 text-center font-semibold text-good sm:w-7" data-i={i}>
              {l}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}
