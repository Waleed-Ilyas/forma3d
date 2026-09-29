import { createStore } from "zustand/vanilla";
import { DEFAULT_CONFIG, type Config } from "./options";

export type ConfigState = Config & {
  set: <K extends keyof Config>(key: K, value: Config[K]) => void;
  reset: () => void;
};

export const createConfigStore = (initial: Config = DEFAULT_CONFIG) =>
  createStore<ConfigState>((set) => ({
    ...initial,
    set: (key, value) => set({ [key]: value } as Partial<Config>),
    reset: () => set({ ...DEFAULT_CONFIG }),
  }));

export type ConfigStore = ReturnType<typeof createConfigStore>;
