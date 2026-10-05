"use client";
import { Lightbulb } from "lucide-react";

export default function ExampleButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="btn" onClick={onClick}>
      <Lightbulb size={16} aria-hidden /> Load Example
    </button>
  );
}
