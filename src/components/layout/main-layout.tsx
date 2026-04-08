import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 pb-[64px] md:pb-0">
        <div className="flex-1 p-16 md:p-32 max-w-[1600px] w-full mx-auto">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
