import { useRef, useState, type ChangeEvent } from "react";
import { Download, FileSpreadsheet, Upload, Trash2, ShieldCheck } from "lucide-react";
import Header from "../components/layout/Header";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Input from "../components/ui/Input";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import ProfileManager from "../components/profile/ProfileManager";
import { useFinanceStore } from "../store/useFinanceStore";
import type { AppSettings } from "../types";
import { downloadBackup, parseBackupFile } from "../utils/backup";

export default function Settings() {
  const incomeSources = useFinanceStore((s) => s.incomeSources);
  const fixedExpenses = useFinanceStore((s) => s.fixedExpenses);
  const variableExpenses = useFinanceStore((s) => s.variableExpenses);
  const settings = useFinanceStore((s) => s.settings);
  const updateSettings = useFinanceStore((s) => s.updateSettings);
  const importData = useFinanceStore((s) => s.importData);
  const resetAll = useFinanceStore((s) => s.resetAll);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [exportingSheet, setExportingSheet] = useState(false);

  const handleExport = () => {
    downloadBackup({ incomeSources, fixedExpenses, variableExpenses, settings });
  };

  const handleExportSpreadsheet = async () => {
    setExportingSheet(true);
    try {
      const { downloadSpreadsheet } = await import("../utils/spreadsheet");
      await downloadSpreadsheet({ incomeSources, fixedExpenses, variableExpenses, settings });
    } finally {
      setExportingSheet(false);
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError("");
    setImportSuccess(false);

    const text = await file.text();
    const parsed = parseBackupFile(text);
    if (!parsed) {
      setImportError("Não foi possível ler este arquivo. Verifique se é um backup válido gerado por este painel.");
      return;
    }
    importData({
      incomeSources: parsed.incomeSources,
      fixedExpenses: parsed.fixedExpenses,
      variableExpenses: parsed.variableExpenses,
      settings: parsed.settings,
    });
    setImportSuccess(true);
    e.target.value = "";
  };

  return (
    <>
      <Header title="Configurações" subtitle="Personalize o painel e gerencie seus dados" />

      <div className="mt-5 flex flex-col gap-4">
        <ProfileManager />

        <Card title="Preferências">
          <div className="flex flex-col gap-4 sm:max-w-sm">
            <Select
              label="Moeda"
              value={settings.currency}
              onChange={(e) => updateSettings({ currency: e.target.value as AppSettings["currency"] })}
              options={[
                { value: "BRL", label: "Real (R$)" },
                { value: "USD", label: "Dólar (US$)" },
                { value: "EUR", label: "Euro (€)" },
              ]}
            />
            <Select
              label="Tema"
              value={settings.theme}
              onChange={(e) => updateSettings({ theme: e.target.value as AppSettings["theme"] })}
              options={[
                { value: "system", label: "Automático (segue o sistema)" },
                { value: "light", label: "Claro" },
                { value: "dark", label: "Escuro" },
              ]}
            />
            <Input
              label="Meta de economia mensal (opcional)"
              help="Se definida, o painel mostra o quanto você está perto de bater sua meta de saldo positivo no mês."
              type="number"
              min="0"
              step="0.01"
              placeholder="Ex.: 500,00"
              value={settings.monthlySavingsGoal ?? ""}
              onChange={(e) =>
                updateSettings({
                  monthlySavingsGoal: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
            />
          </div>
        </Card>

        <Card
          title="Seus dados"
          subtitle="Tudo fica salvo apenas neste navegador — exportar/importar e apagar afetam só o perfil ativo"
        >
          <div className="flex items-start gap-3 rounded-lg bg-series-1/5 p-3 text-xs text-ink-secondary-light dark:text-ink-secondary-dark">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-series-1" />
            <p>
              Este painel não envia suas informações financeiras para nenhum servidor. Recomendamos
              exportar um backup periodicamente, especialmente antes de limpar o navegador ou trocar de
              computador.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" icon={<Download size={16} />} onClick={handleExport}>
              Exportar backup (JSON)
            </Button>
            <Button variant="secondary" icon={<Upload size={16} />} onClick={handleImportClick}>
              Importar backup
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <p className="mt-1.5 text-xs text-ink-muted">
            O backup em JSON é o único formato que pode ser importado de volta — use-o pra restaurar
            ou migrar seus dados.
          </p>
          {importError && <p className="mt-2 text-xs text-status-critical">{importError}</p>}
          {importSuccess && <p className="mt-2 text-xs text-status-good">Backup importado com sucesso!</p>}

          <div className="mt-4 border-t border-black/5 dark:border-white/10 pt-4">
            <Button
              variant="secondary"
              icon={<FileSpreadsheet size={16} />}
              onClick={handleExportSpreadsheet}
              disabled={exportingSheet}
            >
              {exportingSheet ? "Gerando planilha..." : "Exportar planilha (Excel)"}
            </Button>
            <p className="mt-1.5 text-xs text-ink-muted">
              Gera um .xlsx com abas de receitas, despesas fixas e variáveis, pra abrir no Excel,
              Google Sheets ou Numbers. Serve só pra consulta/análise — não pode ser reimportado aqui.
            </p>
          </div>

          <div className="mt-5 border-t border-black/5 dark:border-white/10 pt-4">
            <Button variant="danger" icon={<Trash2 size={16} />} onClick={() => setConfirmReset(true)}>
              Apagar todos os dados
            </Button>
          </div>
        </Card>
      </div>

      {confirmReset && (
        <ConfirmDialog
          title="Apagar todos os dados"
          message="Isso vai remover permanentemente todas as receitas e despesas do perfil ativo (os outros perfis não são afetados). Considere exportar um backup antes."
          confirmLabel="Apagar tudo"
          onCancel={() => setConfirmReset(false)}
          onConfirm={() => {
            resetAll();
            setConfirmReset(false);
          }}
        />
      )}
    </>
  );
}
