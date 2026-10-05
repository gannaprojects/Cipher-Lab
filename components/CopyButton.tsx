"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyButton({ text, label = "Copy Result" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea"); // fallback for non-secure contexts
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  };
  return (
    <button type="button" className="btn" onClick={copy} disabled={!text}>
      {done ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
      <span aria-live="polite">{done ? "Copied!" : label}</span>
    </button>
  );
}
