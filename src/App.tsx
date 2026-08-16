import { useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";
import Settings from "./pages/Settings";
import { useTheme } from "./hooks/useTheme";
import { useFinanceStore } from "./store/useFinanceStore";
import ProfileLockScreen from "./components/profile/ProfileLockScreen";
import ProfileSwitcherModal from "./components/profile/ProfileSwitcherModal";

export default function App() {
  useTheme();
  const hydrated = useFinanceStore((s) => s.hydrated);
  const locked = useFinanceStore((s) => s.locked);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  if (!hydrated) return null;

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
        </Routes>
      </Layout>
    </HashRouter>
  );
}
