import { useState, type FormEvent } from "react";
import { Check, Lock, Plus, UserRound } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import clsx from "../../utils/clsx";
import { useFinanceStore } from "../../store/useFinanceStore";

export default function ProfileSwitcherModal({ onClose }: { onClose: () => void }) {
  const profiles = useFinanceStore((s) => s.profiles);
  const activeProfileId = useFinanceStore((s) => s.activeProfileId);
  const switchProfile = useFinanceStore((s) => s.switchProfile);
  const createProfile = useFinanceStore((s) => s.createProfile);

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [usePin, setUsePin] = useState(false);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Dê um nome para o perfil.");
      return;
    }
    if (usePin) {
      if (pin.length < 4) {
        setError("O PIN precisa ter pelo menos 4 dígitos.");
        return;
      }
      if (pin !== pinConfirm) {
        setError("Os PINs não coincidem.");
        return;
      }
    }
    setBusy(true);
    await createProfile(name.trim(), usePin ? pin : undefined);
    setBusy(false);
    onClose();
  };

  if (creating) {
    return (
      <Modal title="Novo perfil" onClose={onClose}>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Nome do perfil"
            placeholder="Ex.: Meu pai, Casa..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <label className="flex items-center gap-2 text-sm text-ink-secondary-light dark:text-ink-secondary-dark">
            <input
              type="checkbox"
              checked={usePin}
              onChange={(e) => setUsePin(e.target.checked)}
              className="h-4 w-4 rounded border-ink-muted/40 text-series-1 focus:ring-series-1"
            />
            Proteger com PIN
          </label>
          {usePin && (
            <>
              <div className="rounded-lg bg-series-1/5 p-3 text-xs text-ink-secondary-light dark:text-ink-secondary-dark">
                Sem esse PIN não é possível recuperar os dados desse perfil depois — anote em
                lugar seguro.
              </div>
              <Input
                label="PIN"
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
              <Input
                label="Confirmar PIN"
                type="password"
                inputMode="numeric"
                value={pinConfirm}
                onChange={(e) => setPinConfirm(e.target.value)}
              />
            </>
          )}
          {error && <p className="text-xs text-status-critical">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setCreating(false)}>
              Voltar
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Criando..." : "Criar perfil"}
            </Button>
          </div>
        </form>
      </Modal>
    );
  }

  return (
    <Modal title="Trocar de perfil" onClose={onClose}>
      <div className="flex flex-col gap-1.5">
        {profiles.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              switchProfile(p.id);
              onClose();
            }}
            className={clsx(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
              p.id === activeProfileId
                ? "bg-series-1/10 text-series-1"
                : "text-ink-primary-light dark:text-ink-primary-dark hover:bg-black/5 dark:hover:bg-white/5",
            )}
          >
            <UserRound size={16} className="shrink-0" />
            <span className="flex-1 truncate font-medium">{p.name}</span>
            {p.hasPin && <Lock size={13} className="shrink-0 text-ink-muted" />}
            {p.id === activeProfileId && <Check size={16} className="shrink-0" />}
          </button>
        ))}
      </div>
      <Button
        variant="secondary"
        icon={<Plus size={16} />}
        className="mt-4 w-full"
        onClick={() => setCreating(true)}
      >
        Novo perfil
      </Button>
    </Modal>
  );
}
