import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG, BASE_PRICE, type Config } from "@/lib/options";
import { priceLines, totalPrice } from "@/lib/pricing";

describe("pricing", () => {
  it("prices the default configuration at the base price", () => {
    expect(totalPrice(DEFAULT_CONFIG)).toBe(BASE_PRICE);
    expect(priceLines(DEFAULT_CONFIG)).toEqual([{ label: "Lounge chair", amount: BASE_PRICE }]);
  });
  it("adds every selected upgrade", () => {
    const c: Config = { frame: "brass", upholstery: "leather", color: "ink", base: "pedestal", arms: true };
    expect(totalPrice(c)).toBe(240 + 85 + 120 + 35 + 60);
  });
  it("total always equals the sum of the itemised lines", () => {
    const c: Config = { frame: "walnut", upholstery: "boucle", color: "sand", base: "sled", arms: true };
    expect(priceLines(c).reduce((s, l) => s + l.amount, 0)).toBe(totalPrice(c));
  });
  it("does not list free options as lines", () => {
    expect(priceLines({ ...DEFAULT_CONFIG, arms: false }).map((l) => l.label)).toEqual(["Lounge chair"]);
  });
  it("colour never changes the price", () => {
    expect(totalPrice({ ...DEFAULT_CONFIG, color: "clay" })).toBe(totalPrice({ ...DEFAULT_CONFIG, color: "moss" }));
  });
});
