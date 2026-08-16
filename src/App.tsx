import { HashRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";
import Settings from "./pages/Settings";
import { useTheme } from "./hooks/useTheme";

export default function App() {
  useTheme();

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
