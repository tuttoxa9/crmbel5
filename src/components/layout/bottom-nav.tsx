"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, BarChart2, Folder } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Лиды", href: "/leads", icon: Users },
    { name: "Аналитика", href: "/analytics", icon: BarChart2 },
    { name: "Файлы", href: "/files", icon: Folder },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-surface border-t border-border flex items-center justify-around px-8 z-50 pb-safe">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full space-y-[4px] ${
              isActive ? "text-accent" : "text-textMuted"
            }`}
          >
            <item.icon
              strokeWidth={1.5}
              className={`w-24 h-24 ${isActive ? "text-accent" : ""}`}
            />
            <span className="text-[11px] font-medium leading-none">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
