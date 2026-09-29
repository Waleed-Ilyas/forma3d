import { ARMS_PRICE, BASE_PRICE, BASES, byId, FRAMES, UPHOLSTERY, type Config } from "./options";

export type PriceLine = { label: string; amount: number };

/** Itemised price. Whole dollars, so the total is always the sum of the lines shown. */
export function priceLines(config: Config): PriceLine[] {
  const lines: PriceLine[] = [{ label: "Lounge chair", amount: BASE_PRICE }];
  const add = (label: string, amount: number) => amount > 0 && lines.push({ label, amount });
  const frame = byId(FRAMES, config.frame);
  const upholstery = byId(UPHOLSTERY, config.upholstery);
  const base = byId(BASES, config.base);
  add(`${frame.label} frame`, frame.price);
  add(upholstery.label, upholstery.price);
  add(`${base.label} base`, base.price);
  if (config.arms) add("Armrests", ARMS_PRICE);
  return lines;
}

export function totalPrice(config: Config): number {
  return priceLines(config).reduce((sum, l) => sum + l.amount, 0);
}

export const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
