import { useState, type FormEvent } from "react";
import { Lock, ShieldAlert, Users } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { useFinanceStore } from "../../store/useFinanceStore";

export default function ProfileLockScreen({ onSwitchProfile }: { onSwitchProfile: () => void }) {
  const profiles = useFinanceStore((s) => s.profiles);
  const activeProfileId = useFinanceStore((s) => s.activeProfileId);
  const unlockProfile = useFinanceStore((s) => s.unlockProfile);
  const deleteProfile = useFinanceStore((s) => s.deleteProfile);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const ok = await unlockProfile(pin);
    setBusy(false);
    if (!ok) {
      setError("PIN incorreto.");
      setPin("");
      return;
    }
  };

  const canForceDelete = confirmName.trim() === activeProfile?.name && profiles.length > 1;

  return (
    <div className="flex min-h-screen items-center justify-center bg-plane-light dark:bg-plane-dark px-4">
      <div className="w-full max-w-sm rounded-card border border-black/5 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-6 shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-series-1/10 text-series-1">
          <Lock size={22} />
        </div>
        <h1 className="text-center text-base font-semibold text-ink-primary-light dark:text-ink-primary-dark">
          {activeProfile?.name ?? "Perfil"} está protegido
        </h1>
        <p className="mt-1 text-center text-sm text-ink-secondary-light dark:text-ink-secondary-dark">
          Digite o PIN para ver os dados desse perfil.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          <Input
            label="PIN"
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            error={error || undefined}
          />
          <Button type="submit" disabled={busy || !pin}>
            {busy ? "Verificando..." : "Desbloquear"}
          </Button>
        </form>

        <div className="mt-5 flex flex-col items-center gap-2 border-t border-black/5 dark:border-white/10 pt-4">
          <button
            type="button"
            onClick={onSwitchProfile}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark hover:text-series-1"
          >
            <Users size={14} />
            Trocar de perfil
          </button>
          {profiles.length > 1 && (
            <button
              type="button"
              onClick={() => setForgotOpen(true)}
              className="text-xs text-ink-muted hover:text-status-critical"
            >
              Esqueci o PIN
            </button>
          )}
        </div>
      </div>

      {forgotOpen && activeProfile && (
        <Modal
          title="Esqueceu o PIN?"
          onClose={() => {
            setForgotOpen(false);
            setConfirmName("");
          }}
        >
          <div className="flex flex-col gap-3 text-sm text-ink-secondary-light dark:text-ink-secondary-dark">
            <div className="flex items-start gap-2 rounded-lg bg-status-critical/10 p-3 text-xs text-status-critical">
              <ShieldAlert size={16} className="mt-0.5 shrink-0" />
              <p>
                Sem o PIN não é possível recuperar os dados desse perfil — eles ficam
                permanentemente ilegíveis. A única opção é apagar o perfil e começar de novo.
              </p>
            </div>
            <p>
              Pra confirmar, digite o nome do perfil (<strong>{activeProfile.name}</strong>):
            </p>
            <input
              autoFocus
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              className="rounded-lg border border-ink-muted/40 bg-transparent px-3 py-2 text-sm outline-none focus:border-status-critical focus:ring-2 focus:ring-status-critical/20"
            />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setForgotOpen(false);
                setConfirmName("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              disabled={!canForceDelete}
              onClick={() => {
                deleteProfile(activeProfile.id);
                setForgotOpen(false);
                setConfirmName("");
              }}
            >
              Apagar este perfil
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
