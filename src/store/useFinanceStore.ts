import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppSettings,
  FixedExpense,
  IncomeSource,
  ProfileData,
  ProfileMeta,
  VariableExpense,
} from "../types";
import {
  decryptWithKey,
  deriveKey,
  encryptWithKey,
  saltFromBlob,
  type DerivedKey,
  type EncryptedBlob,
} from "../utils/crypto";

type StoredEntry =
  { encrypted: false; data: ProfileData } | { encrypted: true; blob: EncryptedBlob };

interface FinanceState {
  profiles: ProfileMeta[];
  activeProfileId: string;
  dataByProfile: Record<string, StoredEntry>;
  /** true quando o perfil ativo tem PIN e ainda não foi desbloqueado nesta sessão. */
  locked: boolean;
  /** true após a primeira leitura do localStorage — evita telas piscando com dado errado. */
  hydrated: boolean;

  // Dados do perfil ativo (só ficam populados quando `locked` é false).
  incomeSources: IncomeSource[];
  fixedExpenses: FixedExpense[];
  variableExpenses: VariableExpense[];
  settings: AppSettings;

  addIncomeSource: (item: Omit<IncomeSource, "id">) => void;
  updateIncomeSource: (id: string, item: Omit<IncomeSource, "id">) => void;
  removeIncomeSource: (id: string) => void;

  addFixedExpense: (item: Omit<FixedExpense, "id">) => void;
  updateFixedExpense: (id: string, item: Omit<FixedExpense, "id">) => void;
  removeFixedExpense: (id: string) => void;

  addVariableExpense: (item: Omit<VariableExpense, "id">) => void;
  updateVariableExpense: (id: string, item: Omit<VariableExpense, "id">) => void;
  removeVariableExpense: (id: string) => void;

  updateSettings: (patch: Partial<AppSettings>) => void;

  importData: (data: {
    incomeSources: IncomeSource[];
    fixedExpenses: FixedExpense[];
    variableExpenses: VariableExpense[];
    settings: AppSettings;
  }) => void;
  /** Apaga os dados só do perfil ativo — os outros perfis não são afetados. */
  resetAll: () => void;

  createProfile: (name: string, pin?: string) => Promise<string>;
  switchProfile: (id: string) => void;
  unlockProfile: (pin: string) => Promise<boolean>;
  lockActiveProfile: () => void;
  renameProfile: (id: string, name: string) => void;
  /**
   * Remove um perfil (não permite apagar o último restante). Não exige o PIN: quem tem
   * acesso ao navegador já consegue limpar os dados por fora do app, então essa checagem
   * não seria uma proteção real — a confirmação "digite o nome do perfil" fica na UI.
   */
  deleteProfile: (id: string) => boolean;
  /** Define, troca ou remove (newPin=null) o PIN do perfil ativo. Exige o PIN atual, se houver um. */
  setProfilePin: (newPin: string | null, currentPin?: string) => Promise<boolean>;

  _afterHydrate: () => void;
}

const defaultSettings: AppSettings = {
  currency: "BRL",
  theme: "system",
  monthlySavingsGoal: null,
  onboardingComplete: false,
};

function emptyProfileData(): ProfileData {
  return {
    incomeSources: [],
    fixedExpenses: [],
    variableExpenses: [],
    settings: defaultSettings,
  };
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Chaves derivadas de PIN só existem em memória (nunca persistidas), pelo tempo da sessão desbloqueada. */
const sessionKeys = new Map<string, DerivedKey>();

/** Serializa a re-criptografia por perfil, pra edições rápidas em sequência não se sobrescreverem. */
const persistQueues = new Map<string, Promise<unknown>>();

function persistActiveProfile(
  get: () => FinanceState,
  set: (partial: Partial<FinanceState>) => void,
) {
  const id = get().activeProfileId;
  if (!id) return;
  const prev = persistQueues.get(id) ?? Promise.resolve();
  const next = prev.then(async () => {
    const s = get();
    const data: ProfileData = {
      incomeSources: s.incomeSources,
      fixedExpenses: s.fixedExpenses,
      variableExpenses: s.variableExpenses,
      settings: s.settings,
    };
    const cachedKey = sessionKeys.get(id);
    const entry: StoredEntry = cachedKey
      ? { encrypted: true, blob: await encryptWithKey(data, cachedKey) }
      : { encrypted: false, data };
    set({ dataByProfile: { ...get().dataByProfile, [id]: entry } });
  });
  persistQueues.set(id, next);
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: "",
      dataByProfile: {},
      locked: false,
      hydrated: false,

      incomeSources: [],
      fixedExpenses: [],
      variableExpenses: [],
      settings: defaultSettings,

      addIncomeSource: (item) => {
        set((state) => ({
          incomeSources: [...state.incomeSources, { ...item, id: makeId() }],
        }));
        persistActiveProfile(get, set);
      },
      updateIncomeSource: (id, item) => {
        set((state) => ({
          incomeSources: state.incomeSources.map((i) => (i.id === id ? { ...item, id } : i)),
        }));
        persistActiveProfile(get, set);
      },
      removeIncomeSource: (id) => {
        set((state) => ({
          incomeSources: state.incomeSources.filter((i) => i.id !== id),
        }));
        persistActiveProfile(get, set);
      },

      addFixedExpense: (item) => {
        set((state) => ({
          fixedExpenses: [...state.fixedExpenses, { ...item, id: makeId() }],
        }));
        persistActiveProfile(get, set);
      },
      updateFixedExpense: (id, item) => {
        set((state) => ({
          fixedExpenses: state.fixedExpenses.map((i) => (i.id === id ? { ...item, id } : i)),
        }));
        persistActiveProfile(get, set);
      },
      removeFixedExpense: (id) => {
        set((state) => ({
          fixedExpenses: state.fixedExpenses.filter((i) => i.id !== id),
        }));
        persistActiveProfile(get, set);
      },

      addVariableExpense: (item) => {
        set((state) => ({
          variableExpenses: [...state.variableExpenses, { ...item, id: makeId() }],
        }));
        persistActiveProfile(get, set);
      },
      updateVariableExpense: (id, item) => {
        set((state) => ({
          variableExpenses: state.variableExpenses.map((i) => (i.id === id ? { ...item, id } : i)),
        }));
        persistActiveProfile(get, set);
      },
      removeVariableExpense: (id) => {
        set((state) => ({
          variableExpenses: state.variableExpenses.filter((i) => i.id !== id),
        }));
        persistActiveProfile(get, set);
      },

      updateSettings: (patch) => {
        set((state) => ({ settings: { ...state.settings, ...patch } }));
        persistActiveProfile(get, set);
      },

      importData: (data) => {
        set({
          incomeSources: data.incomeSources,
          fixedExpenses: data.fixedExpenses,
          variableExpenses: data.variableExpenses,
          settings: data.settings,
        });
        persistActiveProfile(get, set);
      },

      resetAll: () => {
        set({ ...emptyProfileData() });
        persistActiveProfile(get, set);
      },

      createProfile: async (name, pin) => {
        const id = makeId();
        const data = emptyProfileData();
        let entry: StoredEntry;
        if (pin) {
          const derived = await deriveKey(pin);
          sessionKeys.set(id, derived);
          entry = { encrypted: true, blob: await encryptWithKey(data, derived) };
        } else {
          entry = { encrypted: false, data };
        }
        set((state) => ({
          profiles: [
            ...state.profiles,
            { id, name: name.trim(), createdAt: new Date().toISOString(), hasPin: !!pin },
          ],
          dataByProfile: { ...state.dataByProfile, [id]: entry },
          activeProfileId: id,
          locked: false,
          ...data,
        }));
        return id;
      },

      switchProfile: (id) => {
        const state = get();
        if (id === state.activeProfileId) return;
        const entry = state.dataByProfile[id];
        if (!entry) return;
        if (!entry.encrypted) {
          set({ activeProfileId: id, locked: false, ...entry.data });
        } else {
          set({ activeProfileId: id, locked: true, ...emptyProfileData() });
        }
      },

      unlockProfile: async (pin) => {
        const state = get();
        const entry = state.dataByProfile[state.activeProfileId];
        if (!entry) return false;
        if (!entry.encrypted) {
          set({ locked: false });
          return true;
        }
        const derived = await deriveKey(pin, saltFromBlob(entry.blob));
        const data = await decryptWithKey<ProfileData>(entry.blob, derived.key);
        if (!data) return false;
        sessionKeys.set(state.activeProfileId, derived);
        set({ ...data, locked: false });
        return true;
      },

      lockActiveProfile: () => {
        const state = get();
        sessionKeys.delete(state.activeProfileId);
        set({ locked: true, ...emptyProfileData() });
      },

      renameProfile: (id, name) => {
        if (!name.trim()) return;
        set((state) => ({
          profiles: state.profiles.map((p) => (p.id === id ? { ...p, name: name.trim() } : p)),
        }));
      },

      deleteProfile: (id) => {
        const state = get();
        if (state.profiles.length <= 1) return false;
        const meta = state.profiles.find((p) => p.id === id);
        const entry = state.dataByProfile[id];
        if (!meta || !entry) return false;

        const remainingProfiles = state.profiles.filter((p) => p.id !== id);
        const restData = { ...state.dataByProfile };
        delete restData[id];
        sessionKeys.delete(id);

        if (id === state.activeProfileId) {
          const next = remainingProfiles[0];
          const nextEntry = restData[next.id];
          if (nextEntry && !nextEntry.encrypted) {
            set({
              profiles: remainingProfiles,
              dataByProfile: restData,
              activeProfileId: next.id,
              locked: false,
              ...nextEntry.data,
            });
          } else {
            set({
              profiles: remainingProfiles,
              dataByProfile: restData,
              activeProfileId: next.id,
              locked: true,
              ...emptyProfileData(),
            });
          }
        } else {
          set({ profiles: remainingProfiles, dataByProfile: restData });
        }
        return true;
      },

      setProfilePin: async (newPin, currentPin) => {
        const state = get();
        const id = state.activeProfileId;
        const meta = state.profiles.find((p) => p.id === id);
        const entry = state.dataByProfile[id];
        if (!meta || !entry) return false;

        if (meta.hasPin) {
          if (!currentPin || !entry.encrypted) return false;
          const derived = await deriveKey(currentPin, saltFromBlob(entry.blob));
          const data = await decryptWithKey(entry.blob, derived.key);
          if (!data) return false;
        }

        const currentData: ProfileData = {
          incomeSources: state.incomeSources,
          fixedExpenses: state.fixedExpenses,
          variableExpenses: state.variableExpenses,
          settings: state.settings,
        };

        let newEntry: StoredEntry;
        if (newPin) {
          const derived = await deriveKey(newPin);
          sessionKeys.set(id, derived);
          newEntry = { encrypted: true, blob: await encryptWithKey(currentData, derived) };
        } else {
          sessionKeys.delete(id);
          newEntry = { encrypted: false, data: currentData };
        }

        set((s) => ({
          profiles: s.profiles.map((p) => (p.id === id ? { ...p, hasPin: !!newPin } : p)),
          dataByProfile: { ...s.dataByProfile, [id]: newEntry },
        }));
        return true;
      },

      _afterHydrate: () => {
        const state = get();

        if (state.profiles.length === 0) {
          const id = makeId();
          const data = emptyProfileData();
          set({
            profiles: [
              { id, name: "Perfil 1", createdAt: new Date().toISOString(), hasPin: false },
            ],
            activeProfileId: id,
            dataByProfile: { [id]: { encrypted: false, data } },
            locked: false,
            hydrated: true,
            ...data,
          });
          return;
        }

        const activeId = state.dataByProfile[state.activeProfileId]
          ? state.activeProfileId
          : state.profiles[0].id;
        const entry = state.dataByProfile[activeId];

        if (entry && !entry.encrypted) {
          set({ activeProfileId: activeId, locked: false, hydrated: true, ...entry.data });
        } else {
          set({ activeProfileId: activeId, locked: true, hydrated: true, ...emptyProfileData() });
        }
      },
    }),
    {
      name: "financas-dashboard-data",
      version: 2,
      partialize: (state) => ({
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
        dataByProfile: state.dataByProfile,
      }),
      migrate: (persisted, version) => {
        if (version < 2) {
          const old = persisted as {
            incomeSources?: IncomeSource[];
            fixedExpenses?: FixedExpense[];
            variableExpenses?: VariableExpense[];
            settings?: AppSettings;
          };
          const id = makeId();
          const data: ProfileData = {
            incomeSources: old?.incomeSources ?? [],
            fixedExpenses: old?.fixedExpenses ?? [],
            variableExpenses: old?.variableExpenses ?? [],
            settings: old?.settings ?? defaultSettings,
          };
          return {
            profiles: [
              { id, name: "Perfil 1", createdAt: new Date().toISOString(), hasPin: false },
            ],
            activeProfileId: id,
            dataByProfile: { [id]: { encrypted: false, data } },
          };
        }
        return persisted;
      },
      onRehydrateStorage: () => (state) => {
        state?._afterHydrate();
      },
    },
  ),
);
