"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/news", label: "News Hunter", icon: "📰" },
  { href: "/generate", label: "YouTube → Artikel", icon: "🎬" },
  { href: "/articles", label: "Artikel", icon: "📝" },
  { href: "/settings", label: "Einstellungen", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-800 px-5 py-5">
        <p className="text-lg font-semibold tracking-tight">Crypto News AI Publisher</p>
        <p className="mt-1 text-xs text-zinc-500">XRP · Bitcoin · Krypto · Finanzen</p>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              }`}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-zinc-800 px-5 py-4 text-xs text-zinc-500">
        Artikel werden als Entwurf in WordPress gespeichert - keine automatische Veröffentlichung.
      </div>
    </aside>
  );
}
