import { useState, type FormEvent } from "react";
import { Check, KeyRound, Lock, Pencil, ShieldAlert, Trash2, UserRound } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import clsx from "../../utils/clsx";
import { useFinanceStore } from "../../store/useFinanceStore";
import type { ProfileMeta } from "../../types";

export default function ProfileManager() {
  const profiles = useFinanceStore((s) => s.profiles);
  const activeProfileId = useFinanceStore((s) => s.activeProfileId);
  const switchProfile = useFinanceStore((s) => s.switchProfile);
  const renameProfile = useFinanceStore((s) => s.renameProfile);
  const deleteProfile = useFinanceStore((s) => s.deleteProfile);
  const setProfilePin = useFinanceStore((s) => s.setProfilePin);

  const [renaming, setRenaming] = useState<ProfileMeta | null>(null);
  const [deleting, setDeleting] = useState<ProfileMeta | null>(null);
  const [pinModalOpen, setPinModalOpen] = useState(false);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  return (
    <Card title="Perfis" subtitle="Cada perfil tem receitas, despesas e configurações próprias">
      <div className="flex flex-col gap-1.5">
        {profiles.map((p) => (
          <div
            key={p.id}
            className={clsx(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
              p.id === activeProfileId
                ? "bg-series-1/10"
                : "hover:bg-black/5 dark:hover:bg-white/5",
            )}
          >
            <UserRound size={16} className="shrink-0 text-ink-secondary-light dark:text-ink-secondary-dark" />
            <span className="flex-1 truncate font-medium text-ink-primary-light dark:text-ink-primary-dark">
              {p.name}
            </span>
            {p.hasPin && <Lock size={13} className="shrink-0 text-ink-muted" />}
            {p.id === activeProfileId ? (
              <Badge tone="info">Ativo</Badge>
            ) : (
              <button
                onClick={() => switchProfile(p.id)}
                className="text-xs font-medium text-series-1 hover:underline"
              >
                Usar
              </button>
            )}
            <button
              onClick={() => setRenaming(p)}
              aria-label={`Renomear ${p.name}`}
              className="rounded-md p-1.5 text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-black/10 dark:hover:bg-white/10"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => setDeleting(p)}
              disabled={profiles.length <= 1}
              aria-label={`Excluir ${p.name}`}
              className="rounded-md p-1.5 text-status-critical hover:bg-status-critical/10 disabled:opacity-30 disabled:pointer-events-none"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {activeProfile && (
        <div className="mt-4 border-t border-black/5 dark:border-white/10 pt-4">
          <p className="text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark">
            PIN do perfil ativo ({activeProfile.name})
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Protege os dados desse perfil com criptografia — sem o PIN, os dados ficam ilegíveis
            mesmo pra quem acessar o navegador diretamente.
          </p>
          <Button
            size="sm"
            variant="secondary"
            icon={<KeyRound size={14} />}
            className="mt-2"
            onClick={() => setPinModalOpen(true)}
          >
            {activeProfile.hasPin ? "Alterar ou remover PIN" : "Adicionar PIN"}
          </Button>
        </div>
      )}

      {renaming && (
        <RenameModal
          profile={renaming}
          onClose={() => setRenaming(null)}
          onSave={(name) => {
            renameProfile(renaming.id, name);
            setRenaming(null);
          }}
        />
      )}

      {deleting && (
        <DeleteProfileModal profile={deleting} onClose={() => setDeleting(null)} onDelete={deleteProfile} />
      )}

      {pinModalOpen && activeProfile && (
        <PinModal
          profile={activeProfile}
          onClose={() => setPinModalOpen(false)}
          setProfilePin={setProfilePin}
        />
      )}
    </Card>
  );
}

function RenameModal({
  profile,
  onClose,
  onSave,
}: {
  profile: ProfileMeta;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState(profile.name);
  return (
    <Modal title="Renomear perfil" onClose={onClose}>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          if (name.trim()) onSave(name.trim());
        }}
        className="flex flex-col gap-4"
      >
        <Input label="Nome do perfil" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteProfileModal({
  profile,
  onClose,
  onDelete,
}: {
  profile: ProfileMeta;
  onClose: () => void;
  onDelete: (id: string) => boolean;
}) {
  const [confirmName, setConfirmName] = useState("");
  const canDelete = confirmName.trim() === profile.name;

  return (
    <Modal title={`Excluir perfil "${profile.name}"`} onClose={onClose}>
      <div className="flex flex-col gap-3 text-sm text-ink-secondary-light dark:text-ink-secondary-dark">
        <div className="flex items-start gap-2 rounded-lg bg-status-critical/10 p-3 text-xs text-status-critical">
          <ShieldAlert size={16} className="mt-0.5 shrink-0" />
          <p>Isso apaga permanentemente todos os dados desse perfil. Não pode ser desfeito.</p>
        </div>
        <p>
          Pra confirmar, digite o nome do perfil (<strong>{profile.name}</strong>):
        </p>
        <input
          autoFocus
          value={confirmName}
          onChange={(e) => setConfirmName(e.target.value)}
          className="rounded-lg border border-ink-muted/40 bg-transparent px-3 py-2 text-sm outline-none focus:border-status-critical focus:ring-2 focus:ring-status-critical/20"
        />
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="danger"
          disabled={!canDelete}
          onClick={() => {
            onDelete(profile.id);
            onClose();
          }}
        >
          Excluir perfil
        </Button>
      </div>
    </Modal>
  );
}

function PinModal({
  profile,
  onClose,
  setProfilePin,
}: {
  profile: ProfileMeta;
  onClose: () => void;
  setProfilePin: (newPin: string | null, currentPin?: string) => Promise<boolean>;
}) {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newPinConfirm, setNewPinConfirm] = useState("");
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (profile.hasPin && !currentPin) {
      setError("Digite o PIN atual.");
      return;
    }
    if (!removing) {
      if (newPin.length < 4) {
        setError("O novo PIN precisa ter pelo menos 4 dígitos.");
        return;
      }
      if (newPin !== newPinConfirm) {
        setError("Os PINs não coincidem.");
        return;
      }
    }

    setBusy(true);
    const ok = await setProfilePin(removing ? null : newPin, profile.hasPin ? currentPin : undefined);
    setBusy(false);
    if (!ok) {
      setError("PIN atual incorreto.");
      return;
    }
    onClose();
  };

  return (
    <Modal title={profile.hasPin ? "Alterar PIN" : "Adicionar PIN"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {profile.hasPin && (
          <Input
            label="PIN atual"
            type="password"
            inputMode="numeric"
            value={currentPin}
            onChange={(e) => setCurrentPin(e.target.value)}
            autoFocus
          />
        )}

        {profile.hasPin && (
          <label className="flex items-center gap-2 text-sm text-ink-secondary-light dark:text-ink-secondary-dark">
            <input
              type="checkbox"
              checked={removing}
              onChange={(e) => setRemoving(e.target.checked)}
              className="h-4 w-4 rounded border-ink-muted/40 text-series-1 focus:ring-series-1"
            />
            Remover o PIN (deixar este perfil sem proteção)
          </label>
        )}

        {!removing && (
          <>
            <Input
              label="Novo PIN"
              type="password"
              inputMode="numeric"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              autoFocus={!profile.hasPin}
            />
            <Input
              label="Confirmar novo PIN"
              type="password"
              inputMode="numeric"
              value={newPinConfirm}
              onChange={(e) => setNewPinConfirm(e.target.value)}
            />
          </>
        )}

        {error && <p className="text-xs text-status-critical">{error}</p>}
        {!error && !removing && (
          <p className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Check size={13} className="text-status-good" />
            Sem esse PIN depois, os dados não têm como ser recuperados.
          </p>
        )}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant={removing ? "danger" : "primary"} disabled={busy}>
            {busy ? "Salvando..." : removing ? "Remover PIN" : "Salvar PIN"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
