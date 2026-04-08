"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { usePathname } from "next/navigation";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Do not wrap login page with MainLayout (Sidebar/BottomNav)
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return <MainLayout>{children}</MainLayout>;
}
