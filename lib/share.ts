import { z } from "zod";
import { BASES, COLORS, DEFAULT_CONFIG, FRAMES, UPHOLSTERY, type Config } from "./options";

const oneOf = <T extends readonly { id: string }[]>(list: T) => z.enum(list.map((x) => x.id) as [T[number]["id"], ...T[number]["id"][]]);

const Schema = z.object({
  frame: oneOf(FRAMES),
  upholstery: oneOf(UPHOLSTERY),
  color: oneOf(COLORS),
  base: oneOf(BASES),
  arms: z.boolean(),
});

const KEYS = { f: "frame", u: "upholstery", c: "color", b: "base", a: "arms" } as const;

/** Short, readable query string, e.g. `f=walnut&u=leather&c=ink&b=sled&a=1`. */
export function encodeConfig(config: Config): string {
  const p = new URLSearchParams();
  p.set("f", config.frame);
  p.set("u", config.upholstery);
  p.set("c", config.color);
  p.set("b", config.base);
  p.set("a", config.arms ? "1" : "0");
  return p.toString();
}

type Params = URLSearchParams | Record<string, string | string[] | undefined>;

const read = (params: Params, key: string): string | undefined => {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const v = params[key];
  return Array.isArray(v) ? v[0] : v;
};

/**
 * Parse a shared link. Each field is validated on its own, so one bad or missing value
 * falls back to the default for that field instead of discarding the whole configuration.
 */
export function decodeConfig(params: Params): Config {
  const out: Record<string, unknown> = { ...DEFAULT_CONFIG };
  for (const [short, field] of Object.entries(KEYS)) {
    const raw = read(params, short);
    if (raw === undefined) continue;
    const candidate = field === "arms" ? raw === "1" : raw;
    const attempt = Schema.safeParse({ ...DEFAULT_CONFIG, [field]: candidate });
    if (attempt.success) out[field] = candidate;
  }
  return out as Config;
}
