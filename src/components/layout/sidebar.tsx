"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, BarChart2, Folder, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const navItems = [
    { name: "Лиды", href: "/leads", icon: Users },
    { name: "Аналитика", href: "/analytics", icon: BarChart2 },
    { name: "Файлы", href: "/files", icon: Folder },
  ];

  const handleLogout = async () => {
    // TODO: implement firebase signout
  };

  return (
    <aside className="hidden md:flex flex-col w-[240px] h-screen bg-surface border-r border-border sticky top-0">
      <div className="p-24 pb-12">
        <h1 className="text-[20px] font-bold tracking-tight text-textPrimary">
          Белавто центр
        </h1>
      </div>

      <nav className="flex-1 px-12 space-y-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-12 px-12 py-8 rounded-md transition-colors duration-150 ${
                isActive
                  ? "bg-hover text-accent font-medium"
                  : "text-textMuted hover:bg-hover hover:text-textPrimary"
              }`}
            >
              <item.icon
                strokeWidth={1.5}
                className={`w-20 h-20 ${isActive ? "text-accent" : ""}`}
              />
              <span className="text-body">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-12 space-y-4 border-t border-border">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center space-x-12 px-12 py-8 rounded-md text-textMuted hover:bg-hover hover:text-textPrimary transition-colors duration-150"
          >
            {theme === "dark" ? (
              <>
                <Sun strokeWidth={1.5} className="w-20 h-20" />
                <span className="text-body">Светлая тема</span>
              </>
            ) : (
              <>
                <Moon strokeWidth={1.5} className="w-20 h-20" />
                <span className="text-body">Тёмная тема</span>
              </>
            )}
          </button>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-12 px-12 py-8 rounded-md text-textMuted hover:bg-hover hover:text-textPrimary transition-colors duration-150"
        >
          <LogOut strokeWidth={1.5} className="w-20 h-20" />
          <span className="text-body">Выйти</span>
        </button>
      </div>
    </aside>
  );
}
