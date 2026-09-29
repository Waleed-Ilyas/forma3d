// Single source of truth for everything a customer can choose. The 3D scene, the UI and the pricing all read from here.

export type Option = { id: string; label: string; note?: string; price: number };

export const FRAMES = [
  { id: "oak", label: "Oak", note: "Warm, light grain", price: 0, color: "#b48a5a", metalness: 0, roughness: 0.55 },
  { id: "walnut", label: "Walnut", note: "Deep, dark grain", price: 40, color: "#5b3a27", metalness: 0, roughness: 0.5 },
  { id: "steel", label: "Black steel", note: "Powder coated", price: 20, color: "#1b1c21", metalness: 0.75, roughness: 0.38 },
  { id: "brass", label: "Brushed brass", note: "Hand finished", price: 85, color: "#b8975a", metalness: 1, roughness: 0.32 },
] as const;

export const UPHOLSTERY = [
  { id: "fabric", label: "Woven fabric", note: "Everyday durable", price: 0, roughness: 0.95, sheen: 0 },
  { id: "boucle", label: "Bouclé", note: "Soft, textured", price: 45, roughness: 1, sheen: 0.4 },
  { id: "leather", label: "Leather", note: "Full grain", price: 120, roughness: 0.45, sheen: 0.2 },
] as const;

export const COLORS = [
  { id: "sand", label: "Sand", hex: "#d8c7a8" },
  { id: "sage", label: "Sage", hex: "#8fa58a" },
  { id: "clay", label: "Clay", hex: "#b8664a" },
  { id: "ink", label: "Ink", hex: "#2f3a4f" },
  { id: "cream", label: "Cream", hex: "#ece6d8" },
  { id: "moss", label: "Moss", hex: "#4a5a3a" },
] as const;

export const BASES = [
  { id: "legs", label: "Four legs", note: "Classic, splayed", price: 0 },
  { id: "sled", label: "Sled", note: "Continuous runners", price: 25 },
  { id: "pedestal", label: "Pedestal", note: "Single column", price: 35 },
] as const;

export const BASE_PRICE = 240;
export const ARMS_PRICE = 60;

export type Config = {
  frame: (typeof FRAMES)[number]["id"];
  upholstery: (typeof UPHOLSTERY)[number]["id"];
  color: (typeof COLORS)[number]["id"];
  base: (typeof BASES)[number]["id"];
  arms: boolean;
};

export const DEFAULT_CONFIG: Config = { frame: "oak", upholstery: "fabric", color: "sage", base: "legs", arms: false };

export const byId = <T extends { id: string }>(list: readonly T[], id: string): T => list.find((x) => x.id === id) ?? list[0];
