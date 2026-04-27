"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui";

const LINKS = [
  { href: "/guide", label: "가이드" },
  { href: "/demo", label: "데모" },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-6">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles size={20} className="text-white" />
          <span className="text-lg font-bold text-white tracking-tight">Castfolio</span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm transition-colors",
                pathname === l.href ? "text-white font-medium" : "text-gray-400 hover:text-white",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/create">
            <Button size="sm">시작하기</Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-gray-400" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950 px-6 py-4 space-y-3">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="block text-sm text-gray-300 hover:text-white" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link href="/create" className="block">
            <Button className="w-full" size="sm">시작하기</Button>
          </Link>
        </div>
      )}
    </header>
  );
}
