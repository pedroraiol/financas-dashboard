import { useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Skeleton from "./components/ui/Skeleton";
import { useTheme } from "./hooks/useTheme";
import { useFinanceStore } from "./store/useFinanceStore";
import ProfileLockScreen from "./components/profile/ProfileLockScreen";
import ProfileSwitcherModal from "./components/profile/ProfileSwitcherModal";

function AppSkeleton() {
  return (
    <div className="flex min-h-screen bg-plane-light dark:bg-plane-dark">
      <div className="hidden md:block md:w-60 md:border-r md:border-black/5 md:bg-surface-light md:p-6 dark:md:border-white/10 dark:md:bg-surface-dark">
        <Skeleton className="h-7 w-36" />
        <div className="mt-8 flex flex-col gap-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
      <div className="flex-1 p-5 sm:p-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-5 h-44 w-full rounded-card" />
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-card" />
          <Skeleton className="h-64 w-full rounded-card" />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  useTheme();
  const hydrated = useFinanceStore((s) => s.hydrated);
  const locked = useFinanceStore((s) => s.locked);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  if (!hydrated) return <AppSkeleton />;

  if (locked) {
    return (
      <>
        <ProfileLockScreen onSwitchProfile={() => setSwitcherOpen(true)} />
        {switcherOpen && <ProfileSwitcherModal onClose={() => setSwitcherOpen(false)} />}
      </>
    );
  }

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/receitas" element={<Income />} />
          <Route path="/despesas" element={<Expenses />} />
          <Route path="/configuracoes" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
