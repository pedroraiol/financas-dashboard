import type { ReactNode } from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-plane-light dark:bg-plane-dark">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col pb-16 md:pb-0">
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-5 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
