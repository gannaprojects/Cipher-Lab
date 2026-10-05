"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function Collapsible({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-line bg-white/[0.03]">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold">
        {title}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.15 }}><ChevronDown size={16} aria-hidden /></motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
