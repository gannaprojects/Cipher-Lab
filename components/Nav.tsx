"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical } from "lucide-react";

const LINKS = [
  { href: "/", label: "Playground" },
  { href: "/algorithms", label: "Algorithms" },
  { href: "/compare", label: "Compare" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink/80 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[#6c7bff] to-[#9a74ff]">
            <FlaskConical size={17} aria-hidden />
          </span>
          Cipher Lab
        </Link>
        <ul className="flex flex-wrap gap-1 text-sm">
          {LINKS.map((l) => {
            const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-3 py-1.5 transition-colors ${active ? "bg-white/10 text-white" : "text-soft hover:text-white"}`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
