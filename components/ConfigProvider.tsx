"use client";
import { createContext, useContext, useState } from "react";
import type { Config } from "@/lib/options";
import { createConfigStore, type ConfigStore } from "@/lib/store";

const Ctx = createContext<ConfigStore | null>(null);

export function ConfigProvider({ initial, children }: { initial: Config; children: React.ReactNode }) {
  const [store] = useState(() => createConfigStore(initial));
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useConfigStore(): ConfigStore {
  const store = useContext(Ctx);
  if (!store) throw new Error("useConfigStore must be used inside ConfigProvider");
  return store;
}
