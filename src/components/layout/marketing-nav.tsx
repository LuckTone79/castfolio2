"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/guide", label: "운영 가이드" },
  { href: "/demo", label: "샘플 갤러리" },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-gray-800/60 bg-gray-950/85 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles size={20} className="text-white" />
          <span className="text-lg font-bold tracking-tight text-white">CastFolio</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm transition-colors",
                pathname === link.href ? "font-medium text-white" : "text-gray-400 hover:text-white",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login">
            <Button size="sm">파트너로 시작하기</Button>
          </Link>
        </div>

        <button
          className="text-gray-400 md:hidden"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="space-y-3 border-t border-gray-800 bg-gray-950 px-6 py-4 md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-sm text-gray-300 transition hover:text-white"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/login" className="block" onClick={() => setOpen(false)}>
            <Button className="w-full" size="sm">
              파트너로 시작하기
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
