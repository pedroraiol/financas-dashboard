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
import { useToast } from "../components/ui/ToastProvider";
import type { AppSettings } from "../types";
import { downloadBackup, parseBackupFile } from "../utils/backup";

function SectionLabel({ children }: { children: string }) {
  return (
    <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
      {children}
    </h2>
  );
}

export default function Settings() {
  const incomeSources = useFinanceStore((s) => s.incomeSources);
  const fixedExpenses = useFinanceStore((s) => s.fixedExpenses);
  const variableExpenses = useFinanceStore((s) => s.variableExpenses);
  const settings = useFinanceStore((s) => s.settings);
  const updateSettings = useFinanceStore((s) => s.updateSettings);
  const importData = useFinanceStore((s) => s.importData);
  const resetAll = useFinanceStore((s) => s.resetAll);
  const toast = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [exportingSheet, setExportingSheet] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleExport = () => {
    downloadBackup({ incomeSources, fixedExpenses, variableExpenses, settings });
    toast.success("Backup exportado");
  };

  const handleExportSpreadsheet = async () => {
    setExportingSheet(true);
    try {
      const { downloadSpreadsheet } = await import("../utils/spreadsheet");
      await downloadSpreadsheet({ incomeSources, fixedExpenses, variableExpenses, settings });
      toast.success("Planilha gerada");
    } finally {
      setExportingSheet(false);
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);

    const text = await file.text();
    const parsed = parseBackupFile(text);
    if (!parsed) {
      toast.error(
        "Não foi possível ler este arquivo. Verifique se é um backup válido gerado por este painel.",
      );
      setImporting(false);
      e.target.value = "";
      return;
    }
    importData({
      incomeSources: parsed.incomeSources,
      fixedExpenses: parsed.fixedExpenses,
      variableExpenses: parsed.variableExpenses,
      settings: parsed.settings,
    });
    toast.success("Backup importado com sucesso");
    setImporting(false);
    e.target.value = "";
  };

  return (
    <>
      <Header title="Configurações" subtitle="Personalize o painel e gerencie seus dados" />

      <div className="mt-5 flex flex-col gap-6">
        <section>
          <SectionLabel>Conta</SectionLabel>
          <ProfileManager />
        </section>

        <section>
          <SectionLabel>Preferências</SectionLabel>
          <Card>
            <div className="flex flex-col gap-4 sm:max-w-sm">
              <Select
                label="Moeda"
                value={settings.currency}
                onChange={(e) =>
                  updateSettings({ currency: e.target.value as AppSettings["currency"] })
                }
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
        </section>

        <section>
          <SectionLabel>Dados</SectionLabel>
          <Card subtitle="Tudo fica salvo apenas neste navegador. Exportar/importar afeta só o perfil ativo">
            <div className="flex items-start gap-3 rounded-lg bg-series-1/5 p-3 text-xs text-ink-secondary-light dark:text-ink-secondary-dark">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-series-1" />
              <p>
                Este painel não envia suas informações financeiras para nenhum servidor. Recomendo
                exportar um backup periodicamente, especialmente antes de limpar o navegador ou
                trocar de computador.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" icon={<Download size={16} />} onClick={handleExport}>
                Exportar backup (JSON)
              </Button>
              <Button
                variant="secondary"
                icon={<Upload size={16} />}
                loading={importing}
                onClick={handleImportClick}
              >
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
              O backup em JSON é o único formato que pode ser importado de volta, use-o pra
              restaurar ou migrar seus dados.
            </p>

            <div className="mt-4 border-t border-black/5 dark:border-white/10 pt-4">
              <Button
                variant="secondary"
                icon={<FileSpreadsheet size={16} />}
                loading={exportingSheet}
                onClick={handleExportSpreadsheet}
              >
                Exportar planilha (Excel)
              </Button>
              <p className="mt-1.5 text-xs text-ink-muted">
                Gera um .xlsx com abas de receitas, despesas fixas e variáveis, pra abrir no Excel,
                Google Sheets ou Numbers. Serve só pra consulta/análise. Não pode ser reimportado
                aqui.
              </p>
            </div>
          </Card>
        </section>

        <section>
          <SectionLabel>Zona de perigo</SectionLabel>
          <Card className="border-status-critical/30">
            <p className="text-sm text-ink-secondary-light dark:text-ink-secondary-dark">
              Remove permanentemente todas as receitas e despesas do perfil ativo. Os outros perfis
              não são afetados. Essa ação não pode ser desfeita.
            </p>
            <Button
              variant="danger"
              icon={<Trash2 size={16} />}
              className="mt-3"
              onClick={() => setConfirmReset(true)}
            >
              Apagar todos os dados
            </Button>
          </Card>
        </section>
      </div>

      {confirmReset && (
        <ConfirmDialog
          title="Apagar todos os dados"
          message="Isso vai remover permanentemente todas as receitas e despesas do perfil ativo (os outros perfis não são afetados). Considere exportar um backup antes."
          confirmLabel="Apagar tudo"
          onCancel={() => setConfirmReset(false)}
          onConfirm={() => {
            resetAll();
            toast.success("Todos os dados foram apagados");
            setConfirmReset(false);
          }}
        />
      )}
    </>
  );
}
