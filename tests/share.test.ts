import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG, type Config } from "@/lib/options";
import { decodeConfig, encodeConfig } from "@/lib/share";

describe("share links", () => {
  it("round-trips a configuration", () => {
    const c: Config = { frame: "steel", upholstery: "boucle", color: "clay", base: "sled", arms: true };
    expect(decodeConfig(new URLSearchParams(encodeConfig(c)))).toEqual(c);
  });
  it("uses defaults when there are no parameters", () => {
    expect(decodeConfig(new URLSearchParams(""))).toEqual(DEFAULT_CONFIG);
  });
  it("ignores an unknown value but keeps the valid ones", () => {
    const c = decodeConfig(new URLSearchParams("f=walnut&u=velvet&c=ink&b=nope&a=1"));
    expect(c).toEqual({ ...DEFAULT_CONFIG, frame: "walnut", color: "ink", arms: true });
  });
  it("reads Next.js searchParams objects, including repeated keys", () => {
    expect(decodeConfig({ f: ["brass", "oak"], a: "1" })).toEqual({ ...DEFAULT_CONFIG, frame: "brass", arms: true });
  });
  it("treats anything other than 1 as no armrests", () => {
    expect(decodeConfig(new URLSearchParams("a=yes")).arms).toBe(false);
  });
});
