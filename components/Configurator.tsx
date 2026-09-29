"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import { BASES, COLORS, FRAMES, UPHOLSTERY, ARMS_PRICE, type Config } from "@/lib/options";
import { money, priceLines, totalPrice } from "@/lib/pricing";
import { encodeConfig } from "@/lib/share";
import { useConfigStore } from "./ConfigProvider";
import type { CaptureFn } from "./Scene";

const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center" role="status" aria-label="Loading 3D scene">
      <div className="text-center">
        <div className="skeleton mx-auto h-24 w-24 rounded-full" />
        <p className="label mt-4">Loading 3D scene</p>
      </div>
    </div>
  ),
});

type ChoiceProps = { name: string; value: string; checked: boolean; onChange: () => void; children: React.ReactNode; className?: string; label: string };

/** Native radio input, visually replaced. Keeps arrow-key navigation and screen reader semantics for free. */
function Choice({ name, value, checked, onChange, children, className = "", label }: ChoiceProps) {
  return (
    <label className={`relative cursor-pointer ${className}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="peer sr-only" aria-label={label} />
      {children}
    </label>
  );
}

const card =
  "block rounded-[12px] border border-line bg-panel px-4 py-3 transition-colors peer-checked:border-accent peer-checked:bg-white peer-checked:shadow-[inset_0_0_0_1px_var(--accent)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent hover:border-line-strong";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-line py-5">
      <legend className="label float-left mb-3 w-full">{title}</legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

export function Configurator() {
  const store = useConfigStore();
  const s = useStore(store);
  const config: Config = { frame: s.frame, upholstery: s.upholstery, color: s.color, base: s.base, arms: s.arms };
  const capture = useRef<CaptureFn | null>(null);
  const [toast, setToast] = useState("");

  // Keep the address bar in sync so the page URL is always a shareable link to this exact configuration.
  useEffect(() => {
    const url = `${window.location.pathname}?${encodeConfig(config)}`;
    window.history.replaceState(null, "", url);
  });

  const say = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2200);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?${encodeConfig(config)}`);
      say("Link copied");
    } catch {
      say("Copy blocked. Copy the address bar instead.");
    }
  };

  const download = () => {
    const url = capture.current?.();
    if (!url) return say("The 3D view is not ready yet.");
    const a = document.createElement("a");
    a.href = url;
    a.download = "forma3d-lounge-chair.png";
    a.click();
    say("Image saved");
  };

  const lines = priceLines(config);
  const total = totalPrice(config);

  return (
    <div className="grid min-h-dvh lg:h-dvh lg:grid-cols-[1fr_440px]">
      <section aria-label="3D preview" className="relative h-[56svh] min-h-[340px] lg:h-full">
        <Scene capture={capture} />
        <div className="pointer-events-none absolute left-5 top-5 lg:left-8 lg:top-7">
          <p className="display text-3xl">Forma3D</p>
          <p className="label mt-1">Lounge chair configurator</p>
        </div>
        <p className="pointer-events-none absolute bottom-4 left-5 label hidden sm:block lg:left-8">Drag to rotate · scroll to zoom</p>
      </section>

      <aside className="border-t border-line bg-panel lg:overflow-y-auto lg:border-l lg:border-t-0">
        <div className="px-5 pb-32 pt-6 lg:px-8 lg:pb-8">
          <h1 className="display text-4xl">Make it yours</h1>
          <p className="mt-2 text-[15px] text-ink-2">Every choice updates the chair and the price. Demo pricing, this is not a real store.</p>

          <div className="mt-6">
            <Group title="Frame">
              <div className="grid grid-cols-2 gap-2">
                {FRAMES.map((f) => (
                  <Choice
                    key={f.id}
                    name="frame"
                    value={f.id}
                    label={`${f.label}${f.price ? `, plus ${money.format(f.price)}` : ""}`}
                    checked={s.frame === f.id}
                    onChange={() => s.set("frame", f.id)}
                  >
                    <span className={card}>
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border border-line-strong" style={{ background: f.color }} aria-hidden />
                        <span className="text-sm font-medium">{f.label}</span>
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-3">{f.price ? `+${money.format(f.price)}` : "Included"}</span>
                    </span>
                  </Choice>
                ))}
              </div>
            </Group>

            <Group title="Upholstery">
              <div className="grid gap-2 sm:grid-cols-3">
                {UPHOLSTERY.map((u) => (
                  <Choice
                    key={u.id}
                    name="upholstery"
                    value={u.id}
                    label={`${u.label}${u.price ? `, plus ${money.format(u.price)}` : ""}`}
                    checked={s.upholstery === u.id}
                    onChange={() => s.set("upholstery", u.id)}
                  >
                    <span className={card}>
                      <span className="block text-sm font-medium">{u.label}</span>
                      <span className="mt-0.5 block text-xs text-ink-3">{u.price ? `+${money.format(u.price)}` : "Included"}</span>
                    </span>
                  </Choice>
                ))}
              </div>
            </Group>

            <Group title={`Colour · ${COLORS.find((c) => c.id === s.color)?.label}`}>
              <div className="flex flex-wrap gap-3">
                {COLORS.map((c) => (
                  <Choice key={c.id} name="color" value={c.id} label={c.label} checked={s.color === c.id} onChange={() => s.set("color", c.id)}>
                    <span
                      className="block h-11 w-11 rounded-full border border-line-strong transition-shadow peer-checked:shadow-[0_0_0_2px_var(--panel),0_0_0_4px_var(--accent)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-accent"
                      style={{ background: c.hex }}
                    />
                  </Choice>
                ))}
              </div>
            </Group>

            <Group title="Base">
              <div className="grid gap-2 sm:grid-cols-3">
                {BASES.map((b) => (
                  <Choice
                    key={b.id}
                    name="base"
                    value={b.id}
                    label={`${b.label}${b.price ? `, plus ${money.format(b.price)}` : ""}`}
                    checked={s.base === b.id}
                    onChange={() => s.set("base", b.id)}
                  >
                    <span className={card}>
                      <span className="block text-sm font-medium">{b.label}</span>
                      <span className="mt-0.5 block text-xs text-ink-3">{b.price ? `+${money.format(b.price)}` : "Included"}</span>
                    </span>
                  </Choice>
                ))}
              </div>
            </Group>

            <Group title="Armrests">
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-[12px] border border-line bg-panel px-4 py-3 hover:border-line-strong">
                <span>
                  <span className="block text-sm font-medium">Add armrests</span>
                  <span className="block text-xs text-ink-3">+{money.format(ARMS_PRICE)}</span>
                </span>
                <input type="checkbox" role="switch" checked={s.arms} onChange={(e) => s.set("arms", e.target.checked)} className="peer sr-only" aria-label="Add armrests" />
                <span
                  aria-hidden
                  className="relative h-7 w-12 shrink-0 rounded-full bg-line-strong transition-colors peer-checked:bg-accent peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5"
                />
              </label>
            </Group>
          </div>

          <section aria-label="Price" className="border-t border-line pt-5">
            <ul className="grid gap-1 text-sm text-ink-2">
              {lines.map((l) => (
                <li key={l.label} className="flex justify-between">
                  <span>{l.label}</span>
                  <span className="tabular-nums">{money.format(l.amount)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-baseline justify-between" aria-live="polite">
              <span className="label">Total</span>
              <span className="display text-5xl tabular-nums">{money.format(total)}</span>
            </p>
          </section>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <button className="btn btn-primary" onClick={copyLink}>
              Copy share link
            </button>
            <button className="btn" onClick={download}>
              Download PNG
            </button>
            <button className="btn sm:col-span-2" onClick={() => s.reset()}>
              Reset to default
            </button>
          </div>
          <p role="status" className="mt-3 h-5 text-sm text-ink-2">
            {toast}
          </p>

          <footer className="mt-8 border-t border-line pt-5 text-xs text-ink-3">
            A personal project by{" "}
            <a className="underline underline-offset-4 hover:text-accent" href="https://github.com/Waleed-Ilyas" target="_blank" rel="noopener noreferrer">
              Waleed Ilyas
            </a>
            . The chair is modelled in code from primitives, no external 3D files.
          </footer>
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-line bg-panel/95 px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <p aria-hidden>
          <span className="label block">Total</span>
          <span className="display text-3xl tabular-nums">{money.format(total)}</span>
        </p>
        <button className="btn btn-primary" onClick={copyLink}>
          Copy share link
        </button>
      </div>
    </div>
  );
}
